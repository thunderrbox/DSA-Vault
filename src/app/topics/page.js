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
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0F19]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] rounded-full bg-teal-400 blur-[120px]" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500 blur-[130px]" />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col gap-10 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Data Structures & Algorithms Topics
          </h1>
          <p className="text-slate-650 dark:text-slate-400 mt-2 text-base sm:text-lg">
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
                  className="group bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex items-center justify-between gap-4 transition-all duration-200 hover:border-teal-500 dark:hover:border-teal-500 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-500 dark:group-hover:text-[#0B0F19] transition-all">
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
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                        {tag.name}
                      </h3>
                      <p className="text-xs text-slate-450 mt-1 font-semibold">{problemCount} Solved Problems</p>
                    </div>
                  </div>
                  <ChevronRightIcon />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-12">No topics found. Please run imports.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  );
}
