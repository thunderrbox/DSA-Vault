import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";

export const revalidate = 0; // Dynamic page

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/");
  }

  const userId = session.user.id;

  // Query database for bookmarked problems
  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    include: {
      problem: {
        include: {
          tags: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        {/* User Card */}
        <section className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={64}
              height={64}
              unoptimized
              className="w-16 h-16 rounded-full border border-slate-300 dark:border-slate-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 flex items-center justify-center text-2xl font-semibold">
              {session.user.name?.[0] || "U"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{session.user.name}</h2>
            <p className="text-sm text-slate-500">{session.user.email}</p>
          </div>
        </section>

        {/* Saved Bookmarks */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500" size={20} />
            <h3 className="text-lg font-bold">Saved Bookmark Problems</h3>
          </div>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarks.map(({ problem }) => (
                <div
                  key={problem.id}
                  className="bg-white dark:bg-[#161B2B] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
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

                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
                      {problem.title}
                    </h4>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {problem.tags.map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-medium"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between">
                    <Link
                      href={`/problems/${problem.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      <span>Review approach</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/10 p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-slate-400">No starred problems in your catalog yet.</p>
              <Link
                href="/problems"
                className="inline-flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 font-semibold hover:underline mt-2"
              >
                <span>Browse solutions catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
