"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useSession, signIn } from "next-auth/react";

export default function BookmarkButton({ problemId, initialBookmarked }) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!session) {
      // If not logged in, prompt to sign in with Google
      signIn("google");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problemId }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (e) {
      console.error("Failed to toggle bookmark:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
        bookmarked
          ? "bg-amber-500/10 border-amber-300 text-amber-600 dark:border-amber-900/50 dark:text-amber-400"
          : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/30"
      }`}
      aria-label={bookmarked ? "Unbookmark problem" : "Bookmark problem"}
    >
      <Star size={16} className={bookmarked ? "fill-amber-500 text-amber-500" : ""} />
      <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
    </button>
  );
}
