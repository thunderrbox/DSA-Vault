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
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0F19]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-400 blur-[120px]" />
        <div className="absolute top-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-violet-500 blur-[130px]" />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col gap-20 md:gap-28 relative z-10">
        {/* 1. Hero Section */}
        <FadeIn className="text-center max-w-3xl mx-auto flex flex-col gap-6 items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50/80 text-teal-750 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/30 backdrop-blur-sm animate-pulse">
            <Award size={12} className="text-teal-650 dark:text-teal-400" />
            <span>Continuous SDE Learning Journal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Every Problem I Solve.
            <span className="block mt-2 bg-gradient-to-r from-teal-600 via-cyan-500 to-emerald-500 dark:from-teal-400 dark:via-cyan-400 dark:to-emerald-450 bg-clip-text text-transparent">
              A Searchable DSA Notebook.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mt-2 font-normal">
            Welcome to my engineering portfolio. This platform automatically processes my daily LeetCode
            solutions from my GitHub repository and hosts them in an interactive, searchable DSA database.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
            <Link
              href="/problems"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-650 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-teal-600/20 hover:shadow-teal-600/35 hover:-translate-y-0.5 text-base"
            >
              <span>Explore Solutions</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://github.com/thunderrbox/LeetCode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5 text-base text-slate-700 dark:text-slate-200"
            >
              <span>View Source Code</span>
            </a>
          </div>
        </FadeIn>

        {/* 2. Database Stats Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <HoverScale className="bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-md flex flex-col gap-3 cursor-default transition-all hover:border-teal-500/30">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">{problemsCount}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">Problems Solved</p>
            </div>
          </HoverScale>
          
          <HoverScale className="bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-md flex flex-col gap-3 cursor-default transition-all hover:border-teal-500/30">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">{tagsCount}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">DSA Topics Indexed</p>
            </div>
          </HoverScale>

          <HoverScale className="bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-md flex flex-col gap-3 cursor-default transition-all hover:border-teal-500/30">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">{problemsCount > 0 ? "Daily" : "Inactive"}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">Sync Frequency</p>
            </div>
          </HoverScale>

          <HoverScale className="bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md shadow-slate-100/50 dark:shadow-none backdrop-blur-md flex flex-col gap-3 cursor-default transition-all hover:border-teal-500/30">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">100%</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">Automated Pipeline</p>
            </div>
          </HoverScale>
        </section>

        {/* 3. Latest Solved Problem & Weekly Tracker */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Problem Card */}
          <div 
            className={`lg:col-span-2 bg-white dark:bg-[#161B2B] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md flex flex-col justify-between gap-6 relative overflow-hidden transition-all duration-300 ${
              latestProblem?.difficulty === "Easy"
                ? "border-l-4 border-l-emerald-500 hover:border-emerald-500/60"
                : latestProblem?.difficulty === "Medium"
                ? "border-l-4 border-l-amber-500 hover:border-amber-500/60"
                : "border-l-4 border-l-rose-500 hover:border-rose-500/60"
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 tracking-widest uppercase">
                  Latest Published Solution
                </span>
                {latestProblem && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold border ${
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
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    #{latestProblem.problemNumber}. {latestProblem.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {latestProblem.tags.map((t) => (
                      <span
                        key={t.id}
                        className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-650 dark:text-slate-300 rounded-lg font-medium border border-slate-200/50 dark:border-slate-700/30"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                  <div
                    className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 mt-2 prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: latestProblem.description }}
                  />
                </div>
              ) : (
                <p className="text-slate-400">No problems synced yet. Pushing solutions will build the list.</p>
              )}
            </div>

            {latestProblem && (
              <div className="mt-4 border-t border-slate-100 dark:border-slate-800/60 pt-4 flex">
                <Link
                  href={`/problems/${latestProblem.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 group"
                >
                  <span>View Full Approach & Code</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Difficulty breakdown list */}
          <div className="bg-white dark:bg-[#161B2B] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md flex flex-col justify-between gap-6">
            <h3 className="font-extrabold text-lg text-slate-950 dark:text-white tracking-tight">Difficulty Distribution</h3>
            
            <div className="flex flex-col gap-5">
              {/* Easy Progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                  <span className="text-slate-600 dark:text-slate-400">{easyCount} / {problemsCount}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-700/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    style={{ width: `${problemsCount > 0 ? (easyCount / problemsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Medium Progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-amber-600 dark:text-amber-400">Medium</span>
                  <span className="text-slate-600 dark:text-slate-400">{mediumCount} / {problemsCount}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-700/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    style={{ width: `${problemsCount > 0 ? (mediumCount / problemsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Hard Progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-rose-600 dark:text-rose-400">Hard</span>
                  <span className="text-slate-600 dark:text-slate-400">{hardCount} / {problemsCount}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-700/10">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                    style={{ width: `${problemsCount > 0 ? (hardCount / problemsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Languages Used</span>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {Object.entries(languageCounts)
                  .map(([lang, count]) => `${lang.toUpperCase()} (${count})`)
                  .join(", ") || "None"}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
