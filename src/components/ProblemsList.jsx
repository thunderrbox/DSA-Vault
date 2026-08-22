"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronRight, Filter, RefreshCw } from "lucide-react";

export default function ProblemsList({ initialProblems, availableTags }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State hooks
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("number");

  // 1. Initialize states from URL parameters on boot
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlDiff = searchParams.get("difficulty");
    const urlTags = searchParams.get("tags");
    const urlSort = searchParams.get("sort");

    if (urlSearch) setSearch(urlSearch);
    if (urlDiff) setSelectedDifficulty(urlDiff.split(",").filter(Boolean));
    if (urlTags) setSelectedTags(urlTags.split(",").filter(Boolean));
    if (urlSort && ["newest", "oldest", "number"].includes(urlSort)) {
      setSortBy(urlSort);
    }
  }, [searchParams]);

  // 2. Synchronize state modifications back to the URL query parameters
  const updateUrlParams = (
    currentSearch,
    currentDiff,
    currentTags,
    currentSort
  ) => {
    const params = new URLSearchParams();
    if (currentSearch.trim()) params.set("search", currentSearch);
    if (currentDiff.length > 0) params.set("difficulty", currentDiff.join(","));
    if (currentTags.length > 0) params.set("tags", currentTags.join(","));
    if (currentSort !== "number") params.set("sort", currentSort);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle search text changes
  const handleSearchChange = (val) => {
    setSearch(val);
    updateUrlParams(val, selectedDifficulty, selectedTags, sortBy);
  };

  // Handle difficulty filter toggles
  const handleDifficultyToggle = (difficulty) => {
    const nextDiff = selectedDifficulty.includes(difficulty)
      ? selectedDifficulty.filter((d) => d !== difficulty)
      : [...selectedDifficulty, difficulty];
    setSelectedDifficulty(nextDiff);
    updateUrlParams(search, nextDiff, selectedTags, sortBy);
  };

  // Handle tag filter toggles
  const handleTagToggle = (tag) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(nextTags);
    updateUrlParams(search, selectedDifficulty, nextTags, sortBy);
  };

  // Handle sorting toggles
  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateUrlParams(search, selectedDifficulty, selectedTags, sort);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setSelectedDifficulty([]);
    setSelectedTags([]);
    setSortBy("number");
    router.replace(pathname, { scroll: false });
  };

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    let result = [...initialProblems];

    // 1. Text Search Filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.problemNumber.includes(query) ||
          p.tags.some((t) => t.name.toLowerCase().includes(query))
      );
    }

    // 2. Difficulty Filter
    if (selectedDifficulty.length > 0) {
      result = result.filter((p) => selectedDifficulty.includes(p.difficulty));
    }

    // 3. Tag/Topic Filter
    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        selectedTags.every((tag) => p.tags.some((t) => t.name === tag))
      );
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      const numA = parseInt(a.problemNumber) || 99999;
      const numB = parseInt(b.problemNumber) || 99999;
      return numA - numB;
    });

    return result;
  }, [initialProblems, search, selectedDifficulty, selectedTags, sortBy]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* 1. Sidebar Filters */}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-1.5">
            <Filter size={16} />
            <span>Filters</span>
          </h2>
          {(search || selectedDifficulty.length > 0 || selectedTags.length > 0 || sortBy !== "number") && (
            <button
              onClick={clearFilters}
              className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <RefreshCw size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B2B] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B2B] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="number">Problem Number</option>
            <option value="newest">Recently Solved</option>
            <option value="oldest">Oldest Solved</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty</label>
          <div className="flex flex-col gap-1.5">
            {["Easy", "Medium", "Hard"].map((diff) => (
              <label key={diff} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDifficulty.includes(diff)}
                  onChange={() => handleDifficultyToggle(diff)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>{diff}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Topics Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topics</label>
          <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
            {availableTags.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                    selected
                      ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                      : "bg-white dark:bg-[#161B2B] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 2. Problems Listing Grid */}
      <main className="lg:col-span-3 flex flex-col gap-4">
        <div className="flex justify-between items-center text-sm text-slate-500">
          <p>Showing {filteredProblems.length} of {initialProblems.length} problems</p>
        </div>

        {filteredProblems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="group bg-white dark:bg-[#161B2B] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-indigo-500 dark:hover:border-indigo-500 hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold font-mono">
                      #{problem.problemNumber}
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {problem.title}
                  </h3>

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

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="font-medium">Languages:</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono uppercase">
                      {problem.solutions.map((s) => s.language).join(", ") || "None"}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 flex flex-col items-center gap-3">
            <p className="text-slate-400 text-base">No problems match your filter criteria.</p>
            <button
              onClick={clearFilters}
              className="text-sm px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
