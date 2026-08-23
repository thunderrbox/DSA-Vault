"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Next.js Application Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center gap-6">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/20">
          <AlertOctagon size={48} className="stroke-[1.5]" />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight">Something Went Wrong</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
          {error.message && (
            <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded text-rose-500 mt-2 max-h-24 overflow-y-auto text-left border border-slate-200 dark:border-slate-800">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-teal-600/10"
          >
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors"
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
