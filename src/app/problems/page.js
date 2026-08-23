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
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0F19]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] rounded-full bg-indigo-400 blur-[120px]" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500 blur-[130px]" />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col gap-10 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            LeetCode & DSA Solutions
          </h1>
          <p className="text-slate-650 dark:text-slate-400 mt-2 text-base sm:text-lg">
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
