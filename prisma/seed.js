import { PrismaClient } from "@prisma/client";
import * as path from "path";
import * as fs from "fs";
import { execFileSync } from "child_process";
import { parseProblemFolder } from "../src/lib/parser/problemParser.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new PrismaClient();

async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`⚠️ Database query failed, retrying in ${delay}ms... (${retries} attempts left). Error: ${error.message || error}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

async function main() {
  console.log("🚀 Starting initial import via Git-Tree parser...");
  const srcRepoPath = path.resolve(__dirname, "../temp_leetcode_src");

  let shouldCleanup = false;
  if (!fs.existsSync(srcRepoPath)) {
    console.log("📦 temp_leetcode_src not found. Cloning solutions repository temporarily...");
    try {
      execFileSync("git", ["-c", "http.sslVerify=false", "clone", "-n", "https://github.com/thunderrbox/LeetCode.git", srcRepoPath], {
        stdio: "inherit"
      });
      shouldCleanup = true;
    } catch (e) {
      console.error("❌ Failed to clone solutions repository:", e.message || e);
      process.exit(1);
    }
  }

  // Run git command to list all files checked in
  let filesList = [];
  try {
    const stdout = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD"], {
      cwd: srcRepoPath,
      encoding: "utf-8",
    });
    filesList = stdout.split(/\r?\n/).filter((f) => f.trim().length > 0);
  } catch (error) {
    const err = error;
    console.error("❌ Failed to query git repository files:", err.message || err);
    process.exit(1);
  }

  // Group files by parent directory
  const folderFiles = {};
  for (const filePath of filesList) {
    if (filePath.includes("/")) {
      const parts = filePath.split("/");
      const folderName = parts[0];
      const fileName = parts.slice(1).join("/");
      
      if (!folderFiles[folderName]) {
        folderFiles[folderName] = [];
      }
      folderFiles[folderName].push({
        name: fileName,
        path: filePath,
      });
    }
  }

  const folders = Object.keys(folderFiles);
  console.log(`📁 Found ${folders.length} problem folders in Git history.`);

  let createdCount = 0;
  let updatedCount = 0;
  let failedCount = 0;
  const failedFolders = [];

  for (const folder of folders) {
    try {
      const gitFiles = folderFiles[folder];
      const files = [];

      for (const gitFile of gitFiles) {
        // Read file content directly from git database
        const content = execFileSync("git", ["show", `HEAD:${gitFile.path}`], {
          cwd: srcRepoPath,
          maxBuffer: 10 * 1024 * 1024,
          encoding: "utf-8",
        });
        files.push({
          name: gitFile.name,
          content,
        });
      }

      // Parse folder contents
      const parsed = parseProblemFolder(folder, files);

      // Check if problem already exists
      const existingProblem = await retry(() => db.problem.findUnique({
        where: { slug: parsed.slug },
      }));

      // Upsert tags
      const tagConnections = [];
      for (const tagName of parsed.tags) {
        const tag = await retry(() => db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        }));
        tagConnections.push({ id: tag.id });
      }

      const problemData = {
        problemNumber: parsed.problemNumber,
        title: parsed.title,
        slug: parsed.slug,
        difficulty: parsed.difficulty,
        description: parsed.description,
        githubPath: folder,
        githubUrl: `https://github.com/thunderrbox/LeetCode/tree/main/${encodeURIComponent(folder)}`,
        commitSha: "initial_import_sha",
        tags: {
          connect: tagConnections,
        },
      };

      if (existingProblem) {
        // Update problem
        await retry(() => db.problem.update({
          where: { id: existingProblem.id },
          data: {
            ...problemData,
            solutions: {
              deleteMany: {},
              create: parsed.solutions.map((sol) => ({
                language: sol.language,
                filePath: sol.filePath,
                codeContent: sol.codeContent,
              })),
            },
          },
        }));
        updatedCount++;
      } else {
        // Create problem
        await retry(() => db.problem.create({
          data: {
            ...problemData,
            solutions: {
              create: parsed.solutions.map((sol) => ({
                language: sol.language,
                filePath: sol.filePath,
                codeContent: sol.codeContent,
              })),
            },
          },
        }));
        createdCount++;
      }
    } catch (error) {
      failedCount++;
      failedFolders.push(folder);
      const err = error;
      console.error(`❌ Failed to import folder '${folder}':`, err.message || err);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n==============================================");
  console.log("🎉 Initial Import / Synchronization Report");
  console.log("==============================================");
  console.log(`... Total Folders Scanned: ${folders.length}`);
  console.log(`... Created: ${createdCount}`);
  console.log(`... Updated: ${updatedCount}`);
  console.log(`... Failed: ${failedCount}`);
  if (failedCount > 0) {
    console.log("Folders that failed:");
    failedFolders.forEach((f) => console.log(`  - ${f}`));
  }
  console.log("==============================================\n");

  if (shouldCleanup) {
    console.log("🧹 Cleaning up temporary solutions directory...");
    try {
      fs.rmSync(srcRepoPath, { recursive: true, force: true });
      console.log("✅ Cleanup complete.");
    } catch (e) {
      console.warn("⚠️ Warning: Failed to clean up temp_leetcode_src directory automatically:", e.message || e);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with uncaught exception:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
