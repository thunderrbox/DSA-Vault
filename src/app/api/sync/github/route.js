import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySignature } from "@/lib/security";
import { parseProblemFolder } from "@/lib/parser/problemParser";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const syncSecret = process.env.SYNC_SECRET;

// Zod schemas for webhook payload validation
const webhookFileSchema = z.object({
  path: z.string(),
  content: z.string().optional().default(""),
  status: z.enum(["added", "modified", "removed"]),
});

const webhookPayloadSchema = z.object({
  commitSha: z.string(),
  files: z.array(webhookFileSchema),
});

export async function POST(request) {
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // 1. Signature Verification
  const signature = request.headers.get("X-Hub-Signature-256");
  if (!syncSecret) {
    console.error("❌ SYNC_SECRET environment variable is missing on server");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const isValid = verifySignature(rawBody, signature, syncSecret);
  if (!isValid) {
    console.warn("⚠️ Webhook sync request rejected: Invalid signature header");
    return NextResponse.json({ error: "Unauthorized signature mismatch" }, { status: 401 });
  }

  // 2. Payload Validation
  let payload;
  try {
    const json = JSON.parse(rawBody);
    payload = webhookPayloadSchema.parse(json);
  } catch (err) {
    console.error("❌ Failed to parse or validate webhook payload:", err);
    return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
  }

  console.log(`🤖 Processing GitHub Sync for Commit: ${payload.commitSha}`);

  // Record Sync Event log
  const syncEvent = await db.syncEvent.create({
    data: {
      commitSha: payload.commitSha,
      status: "PENDING",
      payload: rawBody,
    },
  });

  try {
    // 3. Group files by parent directory
    const folderFiles = {};
    for (const file of payload.files) {
      if (file.path.includes("/")) {
        const parts = file.path.split("/");
        const folderName = parts[0];
        if (!folderFiles[folderName]) {
          folderFiles[folderName] = [];
        }
        folderFiles[folderName].push(file);
      }
    }

    const folders = Object.keys(folderFiles);
    let createdCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;

    for (const folder of folders) {
      const gitFiles = folderFiles[folder];

      // Check if folder contains deletions
      // E.g., if a README.md is deleted, or the entire folder is deleted
      const isFolderDeleted = gitFiles.every((f) => f.status === "removed");
      if (isFolderDeleted) {
        // Soft delete/remove the problem from database
        const existing = await db.problem.findFirst({
          where: { githubPath: folder },
        });
        if (existing) {
          await db.problem.delete({ where: { id: existing.id } });
          deletedCount++;
        }
        continue;
      }

      // Read current DB files to merge with incoming files for incremental updates
      const existingProblem = await db.problem.findFirst({
        where: { githubPath: folder },
        include: { solutions: true },
      });

      const mergedFilesMap = new Map();

      // Load existing metadata and solutions from DB
      if (existingProblem) {
        // Mock a README.md in memory if it exists in DB
        // By reconstructing README contents
        const reconstructedReadme = `# ${existingProblem.title} (${existingProblem.difficulty})\n\n---\n\n${existingProblem.description}\n\n 📝 Notes \n ---\n`;
        mergedFilesMap.set("README.md", reconstructedReadme);

        for (const sol of existingProblem.solutions) {
          const fileName = sol.filePath.split("/").pop() || "";
          mergedFilesMap.set(fileName, sol.codeContent);
        }
      }

      // Overwrite with incoming payload files
      for (const gitFile of gitFiles) {
        const fileName = gitFile.path.split("/").pop() || "";
        if (gitFile.status === "removed") {
          mergedFilesMap.delete(fileName);
        } else {
          mergedFilesMap.set(fileName, gitFile.content);
        }
      }

      // Convert map back to list
      const filesToParse = Array.from(mergedFilesMap.entries()).map(([name, content]) => ({
        name,
        content,
      }));

      if (filesToParse.length === 0) {
        // No files left (all solutions and readme deleted)
        if (existingProblem) {
          await db.problem.delete({ where: { id: existingProblem.id } });
          deletedCount++;
        }
        continue;
      }

      // Parse merged files
      const parsed = parseProblemFolder(folder, filesToParse);

      // Connect tags
      const tagConnections = [];
      for (const tagName of parsed.tags) {
        const tag = await db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        tagConnections.push({ id: tag.id });
      }

      const problemDataCommon = {
        problemNumber: parsed.problemNumber,
        title: parsed.title,
        slug: parsed.slug,
        difficulty: parsed.difficulty,
        description: parsed.description,
        githubPath: folder,
        githubUrl: `https://github.com/thunderrbox/LeetCode/tree/main/${encodeURIComponent(folder)}`,
        commitSha: payload.commitSha,
      };

      if (existingProblem) {
        // Update problem and reset solutions
        await db.problem.update({
          where: { id: existingProblem.id },
          data: {
            ...problemDataCommon,
            tags: {
              set: [], // clear existing tags relations (valid in update)
              connect: tagConnections,
            },
            solutions: {
              deleteMany: {},
              create: parsed.solutions.map((sol) => ({
                language: sol.language,
                filePath: sol.filePath,
                codeContent: sol.codeContent,
              })),
            },
          },
        });
        updatedCount++;
      } else {
        // Create new problem
        await db.problem.create({
          data: {
            ...problemDataCommon,
            tags: {
              connect: tagConnections, // connect only (valid in create)
            },
            solutions: {
              create: parsed.solutions.map((sol) => ({
                language: sol.language,
                filePath: sol.filePath,
                codeContent: sol.codeContent,
              })),
            },
          },
        });
        createdCount++;
      }
    }

    // Mark event success
    await db.syncEvent.update({
      where: { id: syncEvent.id },
      data: { status: "SUCCESS" },
    });

    // Revalidate Next.js cache so updates are instantly visible
    try {
      revalidatePath("/");
      revalidatePath("/problems");
      revalidatePath("/topics");
      revalidatePath("/stats");
      revalidatePath("/problems/[slug]", "page");
      console.log("⚡ Instant cache revalidation triggered successfully");
    } catch (e) {
      console.warn("⚠️ Cache revalidation failed:", e.message || e);
    }

    console.log(`✅ Sync complete. Created: ${createdCount}, Updated: ${updatedCount}, Deleted: ${deletedCount}`);
    return NextResponse.json({
      success: true,
      commitSha: payload.commitSha,
      created: createdCount,
      updated: updatedCount,
      deleted: deletedCount,
    });
  } catch (err) {
    const error = err;
    console.error("❌ Sync Error:", error);
    await db.syncEvent.update({
      where: { id: syncEvent.id },
      data: {
        status: "FAILED",
        errorMessage: error.message || JSON.stringify(error),
      },
    });
    return NextResponse.json({ error: "Internal Sync Failure", details: error.message }, { status: 500 });
  }
}
