import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import Link from "next/link";

export const revalidate = 60; // ISR revalidation

export default async function TopicsPage() {
  // Fetch tags with problem count
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { problems: true },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Structures & Algorithms Topics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse problems categorized by coding topics and patterns.
          </p>
        </div>

        {tags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tags.map((tag) => {
              const problemCount = tag._count.problems;
              const slug = tag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

              return (
                <Link
                  key={tag.id}
                  href={`/topics/${slug}`}
                  className="group bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-between gap-4 transition-all duration-200 hover:border-indigo-500 dark:hover:border-indigo-500 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 dark:group-hover:text-[#0B0F19] transition-all">
                      <svg
                        className="w-5.5 h-5.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                        {tag.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{problemCount} Solved Problems</p>
                    </div>
                  </div>
                  <ChevronRightIcon />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400">No topics found. Please run imports.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  );
}
