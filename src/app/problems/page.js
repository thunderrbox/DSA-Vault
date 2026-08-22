import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProblemsList from "@/components/ProblemsList";
import { ProblemsListSkeleton } from "@/components/SkeletonLoader";
import { db } from "@/lib/db";
import { Suspense } from "react";

export const revalidate = 60; // ISR revalidation

export default async function ProblemsPage() {
  // Fetch problems from database
  const problems = await db.problem.findMany({
    orderBy: { problemNumber: "asc" },
    include: {
      tags: true,
      solutions: {
        select: { language: true },
      },
    },
  });

  // Fetch all available tags ordered by tag name
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  const tagNames = tags.map((t) => t.name);

  // Map to flat types matching component expectation
  const formattedProblems = problems.map((p) => ({
    id: p.id,
    problemNumber: p.problemNumber,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    tags: p.tags.map((t) => ({ id: t.id, name: t.name })),
    solutions: p.solutions,
    createdAt: p.createdAt,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LeetCode & DSA Solutions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and filter solved coding challenges.
          </p>
        </div>

        <Suspense fallback={<ProblemsListSkeleton />}>
          <ProblemsList initialProblems={formattedProblems} availableTags={tagNames} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
