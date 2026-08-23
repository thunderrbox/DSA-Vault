import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SolutionViewer from "@/components/SolutionViewer";
import BookmarkButton from "@/components/BookmarkButton";
import { db } from "@/lib/db";
import { highlightCode } from "@/lib/highlighter";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Github, ExternalLink } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const revalidate = 60; // ISR revalidation

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = await db.problem.findUnique({
    where: { slug },
  });

  if (!problem) {
    return {
      title: "Problem Not Found — DSA-Vault",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ubiquitous-dango-feef0b.netlify.app";
  const absoluteUrl = `${baseUrl}/problems/${problem.slug}`;
  const title = `${problem.title} — LeetCode #${problem.problemNumber} Solution | Abhijeet`;
  const description = `Detailed explanation, complexity analysis, and optimized C++/Java/Python/SQL source code solution for LeetCode #${problem.problemNumber}: ${problem.title}.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl,
    },
  };
}

export default async function ProblemDetailPage({ params }) {
  const { slug } = await params;

  // 1. Fetch current problem
  const problem = await db.problem.findUnique({
    where: { slug },
    include: {
      tags: true,
      solutions: true,
    },
  });

  if (!problem) {
    notFound();
  }

  // 1.5 Fetch session and check if bookmarked
  const session = await getServerSession(authOptions);
  let isBookmarked = false;
  if (session && session.user?.id) {
    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
    });
    isBookmarked = !!bookmark;
  }

  // 2. Fetch all problems ordered to calculate Prev/Next neighbor navigation
  const allProblems = await db.problem.findMany({
    orderBy: { problemNumber: "asc" },
    select: { id: true, title: true, slug: true, problemNumber: true },
  });

  const currentIndex = allProblems.findIndex((p) => p.id === problem.id);
  const prevProblem = currentIndex > 0 ? allProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1] : null;

  // 3. Heuristically fetch 3 related problems sharing the same tags
  const tagIds = problem.tags.map((t) => t.id);
  const relatedProblems = await db.problem.findMany({
    where: {
      id: { not: problem.id },
      tags: {
        some: {
          id: { in: tagIds },
        },
      },
    },
    take: 3,
    select: { title: true, slug: true, difficulty: true },
  });

  // 4. Highlight solutions on the server using Shiki
  const solutionsWithHighlight = await Promise.all(
    problem.solutions.map(async (sol) => {
      const html = await highlightCode(sol.codeContent, sol.language);
      return {
        language: sol.language,
        codeContent: sol.codeContent,
        highlightedHtml: html,
      };
    })
  );

  // 5. Generate JSON-LD Structured Data Schema
  const finalBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ubiquitous-dango-feef0b.netlify.app";
  const absoluteUrl = `${finalBaseUrl}/problems/${problem.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${absoluteUrl}#article`,
        "headline": `${problem.title} — LeetCode #${problem.problemNumber} Solution & Explanation`,
        "description": `Detailed explanation, complexity analysis, and clean source code solutions for LeetCode #${problem.problemNumber}: ${problem.title}.`,
        "inLanguage": "en",
        "mainEntityOfPage": absoluteUrl,
        "url": absoluteUrl,
        "dateCreated": problem.createdAt.toISOString(),
        "dateModified": problem.updatedAt.toISOString(),
        "author": {
          "@type": "Person",
          "name": "Abhijeet Singh Rana",
        },
        "about": problem.tags.map((t) => ({
          "@type": "Thing",
          "name": t.name,
        })),
      },
      ...problem.solutions.map((sol) => ({
        "@type": "SoftwareSourceCode",
        "@id": `${absoluteUrl}#code-${sol.language.toLowerCase()}`,
        "name": `${problem.title} ${sol.language.toUpperCase()} Solution`,
        "programmingLanguage": sol.language.toLowerCase(),
        "codeSampleType": "full solution",
        "text": sol.codeContent,
        "codeRepository": problem.githubUrl,
        "author": {
          "@type": "Person",
          "name": "Abhijeet Singh Rana",
        },
      })),
    ],
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0F19]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] rounded-full bg-teal-400 blur-[120px]" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500 blur-[130px]" />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col gap-10 relative z-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-slate-550 dark:text-slate-450 flex items-center gap-1.5 font-bold">
          <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/problems" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Problems
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-300 font-extrabold line-clamp-1">
            {problem.title}
          </span>
        </nav>

        {/* Title Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                  problem.difficulty === "Easy"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                    : problem.difficulty === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                }`}
              >
                {problem.difficulty}
              </span>
              <span className="text-sm font-bold font-mono text-slate-450 dark:text-slate-500">
                LeetCode #{problem.problemNumber}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {problem.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {problem.tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs px-2.5 py-1 bg-white/85 dark:bg-slate-800/80 text-slate-650 dark:text-slate-300 rounded-lg font-semibold border border-slate-200/50 dark:border-slate-700/30"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* External links */}
          <div className="flex items-center gap-3">
            <BookmarkButton problemId={problem.id} initialBookmarked={isBookmarked} />
            <a
              href={problem.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 text-slate-750 dark:text-slate-350"
            >
              <Github size={14} />
              <span>GitHub Source</span>
            </a>
            <a
              href={`https://leetcode.com/problems/${slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-md shadow-teal-600/10"
            >
              <ExternalLink size={14} />
              <span>LeetCode Link</span>
            </a>
          </div>
        </section>

        {/* Content Layout: Description vs Code Viewer */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left panel: Description */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md">
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white border-b border-slate-200 dark:border-slate-800/50 pb-3 tracking-tight">
              Problem Description
            </h2>
            <div
              className="prose dark:prose-invert max-w-none text-slate-650 dark:text-slate-350 text-sm leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-code:font-semibold"
              dangerouslySetInnerHTML={{ __html: problem.description }}
            />
          </div>

          {/* Right panel: Solution Frame */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-white/70 dark:bg-[#161B2B]/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md">
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white border-b border-slate-200 dark:border-slate-800/50 pb-3 tracking-tight">
              Solutions & Implementation
            </h2>
            <SolutionViewer solutions={solutionsWithHighlight} />
          </div>
        </section>

        {/* Neighbor Navigation Footer */}
        <section className="flex items-center justify-between border-t border-b border-slate-200 dark:border-slate-800/80 py-6 mt-8">
          {prevProblem ? (
            <Link
              href={`/problems/${prevProblem.slug}`}
              className="group flex items-center gap-3 text-left"
            >
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-500 border border-slate-200/50 dark:border-slate-700/30 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                <ChevronLeft size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Previous Problem</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  #{prevProblem.problemNumber}. {prevProblem.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextProblem ? (
            <Link
              href={`/problems/${nextProblem.slug}`}
              className="group flex items-center gap-3 text-right justify-end ml-auto"
            >
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Next Problem</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  #{nextProblem.problemNumber}. {nextProblem.title}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-500 border border-slate-200/50 dark:border-slate-700/30 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                <ChevronRight size={16} />
              </div>
            </Link>
          ) : (
            <div />
          )}
        </section>

        {/* Related Problems (Recommendations) */}
        {relatedProblems.length > 0 && (
          <section className="flex flex-col gap-6 mt-4">
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">Related Problems</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProblems.map((p) => (
                <Link
                  key={p.slug}
                  href={`/problems/${p.slug}`}
                  className={`bg-white/70 dark:bg-[#161B2B]/60 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 ${
                    p.difficulty === "Easy"
                      ? "border-l-4 border-l-emerald-500 hover:border-teal-500/20"
                      : p.difficulty === "Medium"
                      ? "border-l-4 border-l-amber-500 hover:border-teal-500/20"
                      : "border-l-4 border-l-rose-500 hover:border-teal-500/20"
                  }`}
                >
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border self-start ${
                      p.difficulty === "Easy"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                        : p.difficulty === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-1">
                    {p.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Footer />
    </div>
  );
}
