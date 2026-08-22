import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const toggleBookmarkSchema = z.object({
  problemId: z.string(),
});

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { problemId } = toggleBookmarkSchema.parse(body);

    // Verify problem exists
    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Check if already bookmarked
    const existing = await db.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });

    if (existing) {
      // Delete bookmark
      await db.bookmark.delete({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      // Create bookmark
      await db.bookmark.create({
        data: {
          userId,
          problemId,
        },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (err) {
    console.error("Failed to toggle bookmark:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
