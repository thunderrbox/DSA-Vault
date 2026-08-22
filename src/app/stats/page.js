import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import { Award, Code2, Layers, ShieldCheck, Activity } from "lucide-react";

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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Statistics & Activity</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights into solved challenges and automated pipeline history.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Solved Problems</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{problemsCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">DSA Topics</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{tagsCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Code2 size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Solutions Compiled</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{solutionsCount}</p>
            </div>
          </div>
        </section>

        {/* Detailed Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Difficulty & Languages */}
          <div className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Solving Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary by complexity and languages.</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Easy */}
              <div className="flex justify-between items-center text-sm font-medium border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-emerald-500">Easy Problems</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{easyCount}</span>
              </div>
              {/* Medium */}
              <div className="flex justify-between items-center text-sm font-medium border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-amber-500">Medium Problems</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{mediumCount}</span>
              </div>
              {/* Hard */}
              <div className="flex justify-between items-center text-sm font-medium border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-rose-500">Hard Problems</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{hardCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Language Coverage</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(languageCounts).map(([lang, count]) => (
                  <div key={lang} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase font-mono">{lang}</p>
                    <p className="text-lg font-bold mt-0.5">{count} solutions</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Webhook Sync History */}
          <div className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Activity size={18} className="text-indigo-500" />
                  <span>Pipeline Sync logs</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Observability into recent Git pushes.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 border border-emerald-200 dark:border-emerald-900/30 rounded-full">
                <ShieldCheck size={10} />
                <span>HMAC Secure</span>
              </span>
            </div>

            {syncLogs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/80 rounded-lg flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold select-all">
                        Commit: {log.commitSha.slice(0, 7)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Sync date: {new Date(log.createdAt).toLocaleString()}
                    </div>
                    {log.errorMessage && (
                      <p className="text-[11px] text-rose-500 dark:text-rose-400 font-mono bg-rose-500/5 p-1 rounded border border-rose-500/10 max-h-16 overflow-y-auto">
                        {log.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8 text-sm">No webhook sync events recorded yet.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
