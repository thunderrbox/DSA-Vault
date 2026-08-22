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

  const title = `${problem.title} — LeetCode #${problem.problemNumber} Solution | Abhijeet`;
  const description = `Detailed explanation, approach, and optimized C++/SQL/Java code solution for LeetCode #${problem.problemNumber}: ${problem.title}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/problems/${problem.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/problems/${problem.slug}`,
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
  const baseUrl = process.env.NEXTAUTH_URL || "https://dsa-vault.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `${problem.title} — LeetCode #${problem.problemNumber} Solution`,
    "description": `Detailed explanation and optimized source code implementation for LeetCode #${problem.problemNumber}: ${problem.title}.`,
    "articleSection": problem.tags.map((t) => t.name).join(", "),
    "author": {
      "@type": "Person",
      "name": "Abhijeet",
    },
    "dateCreated": problem.createdAt.toISOString(),
    "dateModified": problem.updatedAt.toISOString(),
    "url": `${baseUrl}/problems/${problem.slug}`,
    "mainEntityOfPage": `${baseUrl}/problems/${problem.slug}`,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/problems" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Problems
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">
            {problem.title}
          </span>
        </nav>

        {/* Title Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex flex-col gap-2.5">
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
              <span className="text-sm font-semibold font-mono text-slate-400">
                LeetCode #{problem.problemNumber}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {problem.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {problem.tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-medium"
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
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors"
            >
              <Github size={14} />
              <span>GitHub Source</span>
            </a>
            <a
              href={`https://leetcode.com/problems/${slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} />
              <span>LeetCode Link</span>
            </a>
          </div>
        </section>

        {/* Content Layout: Description vs Code Viewer */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left panel: Description */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/50 pb-2">
              Problem Description
            </h2>
            <div
              className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800"
              dangerouslySetInnerHTML={{ __html: problem.description }}
            />
          </div>

          {/* Right panel: Solution Frame */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/50 pb-2">
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
              className="group flex items-center gap-2 text-left"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <ChevronLeft size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Previous Problem</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
              className="group flex items-center gap-2 text-right justify-end ml-auto"
            >
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next Problem</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  #{nextProblem.problemNumber}. {nextProblem.title}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <ChevronRight size={16} />
              </div>
            </Link>
          ) : (
            <div />
          )}
        </section>

        {/* Related Problems (Recommendations) */}
        {relatedProblems.length > 0 && (
          <section className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Related Problems</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProblems.map((p) => (
                <Link
                  key={p.slug}
                  href={`/problems/${p.slug}`}
                  className="bg-white dark:bg-[#161B2B] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm"
                >
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-indigo-100 bg-indigo-50/20 text-indigo-600 dark:border-indigo-950 dark:bg-indigo-950/45 dark:text-indigo-400">
                    {p.difficulty}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
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
