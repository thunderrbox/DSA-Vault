import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

export const revalidate = 60; // ISR revalidation

export default async function TopicDetailPage({ params }) {
  const { topic: topicSlug } = await params;

  // 1. Fetch tags and identify matches
  const tags = await db.tag.findMany({
    include: {
      problems: {
        orderBy: { problemNumber: "asc" },
        include: {
          solutions: { select: { language: true } },
          tags: true,
        },
      },
    },
  });

  const tag = tags.find(
    (t) => t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === topicSlug
  );

  if (!tag) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0F19]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] rounded-full bg-indigo-400 blur-[120px]" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500 blur-[130px]" />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col gap-8 relative z-10">
        <div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to topics</span>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Topic: {tag.name}
          </h1>
          <p className="text-slate-650 dark:text-slate-400 mt-2 text-base sm:text-lg">
            Displaying all {tag.problems.length} solved problems related to {tag.name}.
          </p>
        </div>

        {tag.problems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {tag.problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className={`group bg-white dark:bg-[#161B2B] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  problem.difficulty === "Easy"
                    ? "border-l-4 border-l-emerald-500 hover:border-l-emerald-500 hover:border-indigo-500/20"
                    : problem.difficulty === "Medium"
                    ? "border-l-4 border-l-amber-500 hover:border-l-amber-500 hover:border-indigo-500/20"
                    : "border-l-4 border-l-rose-500 hover:border-l-rose-500 hover:border-indigo-500/20"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
                      #{problem.problemNumber}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                    {problem.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-850">
                  <span className="text-xs text-slate-400 dark:text-slate-505 font-medium">
                    Languages:{" "}
                    <span className="font-bold text-slate-600 dark:text-slate-300 uppercase font-mono">
                      {problem.solutions.map((s) => s.language).join(", ") || "None"}
                    </span>
                  </span>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-12">No problems solved in this category yet.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}
