"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronRight, Filter, RefreshCw, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";

const ITEMS_PER_PAGE = 15;

export default function ProblemsList({ initialProblems, availableTags }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State hooks
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [sortBy, setSortBy] = useState("number");
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamically extract all available languages from initialProblems
  const availableLanguages = useMemo(() => {
    const langs = new Set();
    initialProblems.forEach((p) => {
      p.solutions.forEach((s) => {
        if (s.language) {
          langs.add(s.language.toUpperCase());
        }
      });
    });
    langs.add("JAVA");
    langs.add("CPP");
    langs.add("PYTHON");
    langs.add("SQL");
    return Array.from(langs).sort();
  }, [initialProblems]);

  // 1. Initialize states from URL parameters on boot
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlDiff = searchParams.get("difficulty");
    const urlTags = searchParams.get("tags");
    const urlLangs = searchParams.get("languages");
    const urlSort = searchParams.get("sort");
    const urlPage = parseInt(searchParams.get("page")) || 1;

    if (urlSearch) setSearch(urlSearch);
    if (urlDiff) setSelectedDifficulty(urlDiff.split(",").filter(Boolean));
    if (urlTags) setSelectedTags(urlTags.split(",").filter(Boolean));
    if (urlLangs) setSelectedLanguages(urlLangs.split(",").filter(Boolean));
    if (urlSort && ["newest", "oldest", "number"].includes(urlSort)) {
      setSortBy(urlSort);
    }
    if (urlPage) setCurrentPage(urlPage);
  }, [searchParams]);

  // 2. Synchronize state modifications back to the URL query parameters
  const updateUrlParams = (
    currentSearch,
    currentDiff,
    currentTags,
    currentSort,
    currentLangs,
    currentPageNum
  ) => {
    const params = new URLSearchParams();
    if (currentSearch.trim()) params.set("search", currentSearch);
    if (currentDiff.length > 0) params.set("difficulty", currentDiff.join(","));
    if (currentTags.length > 0) params.set("tags", currentTags.join(","));
    if (currentLangs.length > 0) params.set("languages", currentLangs.join(","));
    if (currentSort !== "number") params.set("sort", currentSort);
    if (currentPageNum > 1) params.set("page", currentPageNum.toString());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Reset page when filters change
  const handleFilterChange = (newSearch, newDiff, newTags, newSort, newLangs) => {
    setCurrentPage(1);
    updateUrlParams(newSearch, newDiff, newTags, newSort, newLangs, 1);
  };

  // Handle search text changes
  const handleSearchChange = (val) => {
    setSearch(val);
    handleFilterChange(val, selectedDifficulty, selectedTags, sortBy, selectedLanguages);
  };

  // Handle difficulty filter toggles
  const handleDifficultyToggle = (difficulty) => {
    const nextDiff = selectedDifficulty.includes(difficulty)
      ? selectedDifficulty.filter((d) => d !== difficulty)
      : [...selectedDifficulty, difficulty];
    setSelectedDifficulty(nextDiff);
    handleFilterChange(search, nextDiff, selectedTags, sortBy, selectedLanguages);
  };

  // Handle tag filter toggles
  const handleTagToggle = (tag) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(nextTags);
    handleFilterChange(search, selectedDifficulty, nextTags, sortBy, selectedLanguages);
  };

  // Handle language filter toggles
  const handleLanguageToggle = (lang) => {
    const nextLangs = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    setSelectedLanguages(nextLangs);
    handleFilterChange(search, selectedDifficulty, selectedTags, sortBy, nextLangs);
  };

  // Handle sorting toggles
  const handleSortChange = (sort) => {
    setSortBy(sort);
    handleFilterChange(search, selectedDifficulty, selectedTags, sort, selectedLanguages);
  };

  // Handle page pagination clicks
  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    updateUrlParams(search, selectedDifficulty, selectedTags, sortBy, selectedLanguages, pageNum);
    // Smooth scroll page back to top of main area
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setSelectedDifficulty([]);
    setSelectedTags([]);
    setSelectedLanguages([]);
    setSortBy("number");
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    let result = [...initialProblems];

    // 1. Text Search Filter (supports names and question numbers e.g. "1" or "#1")
    if (search.trim()) {
      const query = search.toLowerCase().replace(/^#/, "").trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.problemNumber.toLowerCase() === query ||
          p.problemNumber.toLowerCase().includes(query) ||
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

    // 4. Language Filter
    if (selectedLanguages.length > 0) {
      result = result.filter((p) =>
        p.solutions.some((sol) => selectedLanguages.includes(sol.language.toUpperCase()))
      );
    }

    // 5. Sorting
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
  }, [initialProblems, search, selectedDifficulty, selectedTags, selectedLanguages, sortBy]);

  // Calculate pagination bounds
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const paginatedProblems = useMemo(() => {
    const startIdx = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredProblems, activePage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* 1. Sidebar Filters */}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-1.5">
            <Filter size={16} />
            <span>Filters</span>
          </h2>
          {(search || selectedDifficulty.length > 0 || selectedTags.length > 0 || selectedLanguages.length > 0 || sortBy !== "number") && (
            <button
              onClick={clearFilters}
              className="text-xs flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
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
            placeholder="Search by name, tags or #no..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B2B] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B2B] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <label key={diff} className="flex items-center gap-2 text-sm text-slate-650 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDifficulty.includes(diff)}
                  onChange={() => handleDifficultyToggle(diff)}
                  className="rounded border-slate-350 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>{diff}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages Filter */}
        {availableLanguages.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Languages</label>
            <div className="flex flex-wrap gap-1.5">
              {availableLanguages.map((lang) => {
                const selected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => handleLanguageToggle(lang)}
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-all ${
                      selected
                        ? "bg-teal-50 text-teal-700 border-teal-350 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
                        : "bg-white dark:bg-[#161B2B] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
                      ? "bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
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
      <main className="lg:col-span-3 flex flex-col gap-6">
        <div className="flex justify-between items-center text-sm text-slate-550 dark:text-slate-400">
          <p className="font-semibold">
            Showing {Math.min(filteredProblems.length, (activePage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredProblems.length, activePage * ITEMS_PER_PAGE)} of {filteredProblems.length} problems
          </p>
        </div>

        {paginatedProblems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {paginatedProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className={`group bg-white dark:bg-[#161B2B] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  problem.difficulty === "Easy"
                    ? "border-l-4 border-l-emerald-500 hover:border-l-emerald-500 hover:border-teal-500/20"
                    : problem.difficulty === "Medium"
                    ? "border-l-4 border-l-amber-500 hover:border-l-amber-500 hover:border-teal-500/20"
                    : "border-l-4 border-l-rose-500 hover:border-l-rose-500 hover:border-teal-500/20"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold font-mono">
                      #{problem.problemNumber}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">
                    {problem.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {problem.tags.map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-650 dark:text-slate-450 rounded-md font-semibold border border-slate-200/30 dark:border-slate-700/10"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
                    <span className="font-semibold">Languages:</span>
                    <span className="font-bold text-slate-600 dark:text-slate-350 font-mono uppercase">
                      {problem.solutions.map((s) => s.language).join(", ") || "None"}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 flex flex-col items-center gap-3">
            <p className="text-slate-455 dark:text-slate-500 text-base font-semibold">No problems match your filter criteria.</p>
            <button
              onClick={clearFilters}
              className="text-sm px-5 py-2.5 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 rounded-xl font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* 3. Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-slate-200/60 dark:border-slate-800/40">
            {/* First Page */}
            <button
              disabled={activePage === 1}
              onClick={() => handlePageChange(1)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              aria-label="First page"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Prev Page */}
            <button
              disabled={activePage === 1}
              onClick={() => handlePageChange(activePage - 1)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers Indicator */}
            <div className="flex items-center gap-1.5 px-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - activePage) <= 2 || p === 1 || p === totalPages)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="text-slate-400 text-xs px-1">...</span>}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                          activePage === p
                            ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                            : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Page */}
            <button
              disabled={activePage === totalPages}
              onClick={() => handlePageChange(activePage + 1)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last Page */}
            <button
              disabled={activePage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              aria-label="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
