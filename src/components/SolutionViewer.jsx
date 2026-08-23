"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function SolutionViewer({ solutions }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSolution = solutions[activeIdx];

  const handleCopy = async () => {
    if (!activeSolution) return;
    try {
      await navigator.clipboard.writeText(activeSolution.codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy code:", e);
    }
  };

  if (solutions.length === 0) {
    return (
      <div className="bg-slate-900 text-slate-400 p-8 rounded-xl text-center border border-slate-800">
        No code solutions synced for this problem.
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
      {/* 1. Header Bar: Tabs & Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-[#161B2B] border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {solutions.map((sol, idx) => (
            <button
              key={sol.language}
              onClick={() => setActiveIdx(idx)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors uppercase font-mono ${
                activeIdx === idx
                  ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {sol.language}
            </button>
          ))}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Code Frame */}
      <div className="relative text-sm max-h-[600px] overflow-auto bg-[#0d1117] p-4 font-mono">
        <div
          className="shiki-code-frame"
          dangerouslySetInnerHTML={{ __html: activeSolution?.highlightedHtml || "" }}
        />
      </div>
    </div>
  );
}
