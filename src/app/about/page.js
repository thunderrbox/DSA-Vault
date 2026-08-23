import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GitBranch, Server, Settings, Terminal, ShieldAlert, Cpu, Database } from "lucide-react";
import { FadeIn } from "@/components/MotionWrapper";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-[#0B0F19]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] rounded-full bg-teal-400 blur-[120px]" />
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500 blur-[130px]" />
      </div>

      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col gap-16 relative z-10">
        {/* Intro */}
        <section className="flex flex-col gap-4 text-center sm:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            About <span className="bg-gradient-to-r from-teal-600 to-violet-500 dark:from-teal-400 dark:to-pink-400 bg-clip-text text-transparent">DSA-Vault</span>
          </h1>
          <p className="text-slate-700 dark:text-slate-350 text-lg sm:text-xl leading-relaxed mt-2 font-medium">
            DSA-Vault is an automated publishing engine and educational coding notebook designed to
            showcase my continuous SDE problem-solving journal.
          </p>
        </section>

        {/* Core Pipeline Explanation */}
        <section className="bg-white/70 dark:bg-[#161B2B]/60 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md backdrop-blur-md flex flex-col gap-6">
          <div>
            <h3 className="font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white tracking-tight">The Automation Pipeline</h3>
            <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed mt-1">
              Unlike static blogs which require manual edits, metadata updates, and sitemap modifications,
              DSA-Vault publishes solutions instantly on <code className="bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded text-teal-600 dark:text-teal-400 font-mono text-xs font-semibold">git push</code>.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch mt-4">
            {/* Step 1 */}
            <div className="flex-1 bg-white/90 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col gap-3 transition-colors hover:border-teal-500/20">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                  <GitBranch size={16} />
                </div>
                <span>1. Push to GitHub</span>
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                A solution is pushed to the LeetCode solutions repository. E.g., adding a C++ class file
                and a LeetCode problem description.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex-1 bg-white/90 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col gap-3 transition-colors hover:border-teal-500/20">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                  <Settings size={16} />
                </div>
                <span>2. Webhook Triggers</span>
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                GitHub Action detects the changes, packages the file diff contents, signs the JSON payload
                via HMAC-SHA256, and POSTs to the sync API.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex-1 bg-white/90 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col gap-3 transition-colors hover:border-teal-500/20">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                  <Server size={16} />
                </div>
                <span>3. Ingest & Render</span>
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                The website validates the signature, extracts metadata, upserts Prisma models, and revalidates
                the dynamic page path (ISR).
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Details */}
        <section className="flex flex-col gap-6">
          <h3 className="font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white tracking-tight">Technical Implementation</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/70 dark:bg-[#161B2B]/60 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/50 shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-lg">
                <Terminal size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Frontend Stack</h4>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mt-1">
                  Next.js 16 (App Router), React Server Components, Tailwind CSS, and Framer Motion for responsive animations.
                </p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-[#161B2B]/60 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/50 shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-lg">
                <Database size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Database & ORM</h4>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mt-1">
                  PostgreSQL database hosted on Neon serverless environment, query-pooled and managed via Prisma ORM.
                </p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-[#161B2B]/60 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/50 shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-lg">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Secure Authentication</h4>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mt-1">
                  NextAuth system with Google OAuth strategy integration and secure HTTP-Only JWT session storage.
                </p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-[#161B2B]/60 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/50 shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-lg">
                <Cpu size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Syntax Highlighting</h4>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mt-1">
                  Shiki syntax engines compiled on the server side to ship zero runtime JS compiler overhead to client browsers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
