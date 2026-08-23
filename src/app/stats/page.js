import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import { Award, Code2, Layers, ShieldCheck, Activity, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

export const revalidate = 10; // Rapid revalidation for stats page

export default async function StatsPage() {
  const problemsCount = await db.problem.count();
  const tagsCount = await db.tag.count();
  const solutionsCount = await db.solution.count();

  // Difficulty counts
  const easyCount = await db.problem.count({ where: { difficulty: "Easy" } });
  const mediumCount = await db.problem.count({ where: { difficulty: "Medium" } });
  const hardCount = await db.problem.count({ where: { difficulty: "Hard" } });

  // Languages distribution
  const solutions = await db.solution.findMany({ select: { language: true } });
  const languageCounts = {};
  for (const sol of solutions) {
    languageCounts[sol.language] = (languageCounts[sol.language] || 0) + 1;
  }

  // Fetch recent synchronization events
  const syncLogs = await db.syncEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0F19]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[15%] w-[300px] h-[300px] rounded-full bg-indigo-400 blur-[120px]" />
        <div className="absolute top-[10%] right-[15%] w-[350px] h-[350px] rounded-full bg-violet-500 blur-[130px]" />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col gap-12 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Statistics & Activity
          </h1>
          <p className="text-slate-650 dark:text-slate-400 mt-2 text-base sm:text-lg">
            Real-time insights into solved challenges and automated pipeline history.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex items-center gap-5 transition-all hover:border-indigo-500/25">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Solved Problems</p>
              <p className="text-3xl font-extrabold text-slate-950 dark:text-white mt-0.5 tracking-tight">{problemsCount}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex items-center gap-5 transition-all hover:border-indigo-500/25">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">DSA Topics</p>
              <p className="text-3xl font-extrabold text-slate-950 dark:text-white mt-0.5 tracking-tight">{tagsCount}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex items-center gap-5 transition-all hover:border-indigo-500/25">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Code2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Solutions Compiled</p>
              <p className="text-3xl font-extrabold text-slate-950 dark:text-white mt-0.5 tracking-tight">{solutionsCount}</p>
            </div>
          </div>
        </section>

        {/* Detailed Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Difficulty & Languages */}
          <div className="bg-white/70 dark:bg-[#161B2B]/60 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex flex-col gap-6">
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-950 dark:text-white tracking-tight">Solving Distribution</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">Summary by complexity and languages.</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Easy */}
              <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <span className="text-emerald-600 dark:text-emerald-400">Easy Problems</span>
                <span className="text-slate-800 dark:text-slate-250 font-mono font-extrabold">{easyCount}</span>
              </div>
              {/* Medium */}
              <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <span className="text-amber-600 dark:text-amber-400">Medium Problems</span>
                <span className="text-slate-800 dark:text-slate-250 font-mono font-extrabold">{mediumCount}</span>
              </div>
              {/* Hard */}
              <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <span className="text-rose-600 dark:text-rose-400">Hard Problems</span>
                <span className="text-slate-800 dark:text-slate-250 font-mono font-extrabold">{hardCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Language Coverage</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(languageCounts).map(([lang, count]) => (
                  <div key={lang} className="p-4 bg-white/80 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/40">
                    <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase font-mono">{lang}</p>
                    <p className="text-base sm:text-lg font-extrabold mt-0.5 text-slate-900 dark:text-white">{count} solutions</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Webhook Sync History */}
          <div className="bg-white/70 dark:bg-[#161B2B]/60 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Pipeline Sync Logs</span>
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5 font-medium">Observability into recent Git pushes.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5 border border-emerald-200/60 dark:border-emerald-900/30 rounded-full">
                <ShieldCheck size={11} />
                <span>HMAC Secure</span>
              </span>
            </div>

            {syncLogs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-white/95 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/40 rounded-xl flex flex-col gap-2 transition-colors hover:border-indigo-500/25"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold select-all">
                        Commit: {log.commitSha.slice(0, 7)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Sync date: {new Date(log.createdAt).toLocaleString()}
                    </div>
                    {log.errorMessage && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-mono bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200/60 dark:border-rose-900/30 max-h-20 overflow-y-auto mt-1">
                        {log.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-250 dark:border-slate-800/80 rounded-2xl bg-white/40 dark:bg-slate-900/10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/60 text-slate-450 dark:text-slate-500 rounded-full flex items-center justify-center">
                  <Terminal size={22} />
                </div>
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">No Sync logs Available</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your automated synchronization pipeline is active and secure. Pushing a commit to your LeetCode Solutions repository will trigger a webhook update and list logs here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
