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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-6">
        <div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to topics</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Topic: {tag.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Displaying all {tag.problems.length} solved problems related to {tag.name}.
          </p>
        </div>

        {tag.problems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tag.problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="group bg-white dark:bg-[#161B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-indigo-500 dark:hover:border-indigo-500 hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      #{problem.problemNumber}
                    </span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {problem.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    Languages:{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300 uppercase font-mono">
                      {problem.solutions.map((s) => s.language).join(", ") || "None"}
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
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
