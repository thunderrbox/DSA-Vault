import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GitBranch, Server, Settings } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        {/* Intro */}
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">About DSA-Vault</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            DSA-Vault is an automated publishing engine and educational coding notebook designed to
            showcase my continuous SDE problem-solving journal.
          </p>
        </section>

        {/* Core Pipeline Explanation */}
        <section className="bg-slate-50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-6">
          <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">The Automation Pipeline</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Unlike static blogs which require manual edits, metadata updates, and sitemap modifications,
            DSA-Vault publishes solutions instantly on `git push`.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-stretch mt-2">
            <div className="flex-1 bg-white dark:bg-[#161B2B] p-4 rounded-lg border border-slate-200/60 dark:border-slate-800/50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <GitBranch size={16} />
                <span>1. Push to GitHub</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                A solution is pushed to the LeetCode solutions repository. E.g., adding a C++ class file
                and a LeetCode problem description.
              </p>
            </div>

            <div className="flex-1 bg-white dark:bg-[#161B2B] p-4 rounded-lg border border-slate-200/60 dark:border-slate-800/50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Settings size={16} />
                <span>2. Webhook Triggers</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                GitHub Action detects the changes, packages the file diff contents, signs the JSON payload
                via HMAC-SHA256, and POSTs to the sync API.
              </p>
            </div>

            <div className="flex-1 bg-white dark:bg-[#161B2B] p-4 rounded-lg border border-slate-200/60 dark:border-slate-800/50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Server size={16} />
                <span>3. Ingest & Render</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The website validates the signature, extracts metadata, upserts Prisma models, and revalidates
                the dynamic page path (ISR).
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Details */}
        <section className="flex flex-col gap-4">
          <h3 className="font-bold text-xl">Technical Implementation</h3>
          <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300">
            <ul>
              <li>
                <strong>Frontend:</strong> Next.js App Router (React Server Components), JavaScript, and Tailwind CSS.
              </li>
              <li>
                <strong>Database:</strong> Serverless PostgreSQL managed via Prisma Client.
              </li>
              <li>
                <strong>Authentication:</strong> Google OAuth and encrypted JWT session cookies managed using NextAuth.
              </li>
              <li>
                <strong>Syntax Highlighting:</strong> Shiki server-side rendering, ensuring zero compiler weight is shipped to client browsers.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
