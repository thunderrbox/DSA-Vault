import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Award, Calendar, CheckCircle2 } from "lucide-react";
import { FadeIn, HoverScale } from "@/components/MotionWrapper";

export const revalidate = 60; // Revalidate page data every 60 seconds (ISR)

export default async function Home() {
  // Query database for real metrics
  const problemsCount = await db.problem.count();
  const tagsCount = await db.tag.count();
  
  // Calculate difficulty distribution
  const easyCount = await db.problem.count({ where: { difficulty: "Easy" } });
  const mediumCount = await db.problem.count({ where: { difficulty: "Medium" } });
  const hardCount = await db.problem.count({ where: { difficulty: "Hard" } });

  // Fetch the latest solved problem
  const latestProblem = await db.problem.findFirst({
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  });

  // Calculate languages distribution
  const solutions = await db.solution.findMany({ select: { language: true } });
  const languageCounts = {};
  for (const sol of solutions) {
    languageCounts[sol.language] = (languageCounts[sol.language] || 0) + 1;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
        {/* 1. Hero Section */}
        <FadeIn className="text-center max-w-3xl mx-auto flex flex-col gap-6 items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/30">
            <Award size={12} />
            <span>Continuous SDE Learning Journal</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-400">
            Every Problem I Solve.
            <span className="block text-indigo-600 dark:text-indigo-400">A Searchable DSA Notebook.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Welcome to my engineering portfolio. This platform automatically processes my daily LeetCode
            solutions from my GitHub repository and hosts them in an interactive, searchable DSA database.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              href="/problems"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-600/10"
            >
              <span>Explore Solutions</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/thunderrbox/LeetCode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg font-medium transition-colors"
            >
              <span>View Source Code</span>
            </a>
          </div>
        </FadeIn>

        {/* 2. Database Stats Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <HoverScale className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-2 cursor-default">
            <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-2xl font-bold">{problemsCount}</p>
            <p className="text-sm font-medium text-slate-500">Problems Solved</p>
          </HoverScale>
          <HoverScale className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-2 cursor-default">
            <Layers size={20} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-2xl font-bold">{tagsCount}</p>
            <p className="text-sm font-medium text-slate-500">DSA Topics Indexed</p>
          </HoverScale>
          <HoverScale className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-2 cursor-default">
            <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-2xl font-bold">{problemsCount > 0 ? "Daily" : "Inactive"}</p>
            <p className="text-sm font-medium text-slate-500">Sync Frequency</p>
          </HoverScale>
          <HoverScale className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-2 cursor-default">
            <CheckCircle2 size={20} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-2xl font-bold">100%</p>
            <p className="text-sm font-medium text-slate-500">Automated Pipeline</p>
          </HoverScale>
        </section>

        {/* 3. Latest Solved Problem & Weekly Tracker */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Problem Card */}
          <div className="lg:col-span-2 bg-white dark:bg-[#161B2B] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                  Latest Published Solution
                </span>
                {latestProblem && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      latestProblem.difficulty === "Easy"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                        : latestProblem.difficulty === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                    }`}
                  >
                    {latestProblem.difficulty}
                  </span>
                )}
              </div>

              {latestProblem ? (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    #{latestProblem.problemNumber}. {latestProblem.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {latestProblem.tags.map((t) => (
                      <span
                        key={t.id}
                        className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-medium"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                  <div
                    className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mt-2 prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: latestProblem.description }}
                  />
                </div>
              ) : (
                <p className="text-slate-400">No problems synced yet. Pushing solutions will build the list.</p>
              )}
            </div>

            {latestProblem && (
              <div className="mt-4">
                <Link
                  href={`/problems/${latestProblem.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <span>View Full Approach & Code</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Difficulty breakdown list */}
          <div className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col justify-between gap-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Difficulty Distribution</h3>
            
            <div className="flex flex-col gap-4">
              {/* Easy Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                  <span>{easyCount} / {problemsCount}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${problemsCount > 0 ? (easyCount / problemsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Medium Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-amber-600 dark:text-amber-400">Medium</span>
                  <span>{mediumCount} / {problemsCount}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${problemsCount > 0 ? (mediumCount / problemsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Hard Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-rose-600 dark:text-rose-400">Hard</span>
                  <span>{hardCount} / {problemsCount}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${problemsCount > 0 ? (hardCount / problemsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-wrap gap-x-4 gap-y-2">
              <div className="text-xs text-slate-500">
                Languages:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {Object.entries(languageCounts)
                    .map(([lang, count]) => `${lang.toUpperCase()} (${count})`)
                    .join(", ") || "None"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
