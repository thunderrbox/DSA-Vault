import React from "react";

export function SkeletonPulse({ className }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} />
  );
}

export function ProblemCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161B2B] p-5 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-16" />
      </div>
      <SkeletonPulse className="h-6 w-3/4" />
      <div className="flex gap-2">
        <SkeletonPulse className="h-4 w-16" />
        <SkeletonPulse className="h-4 w-20" />
      </div>
    </div>
  );
}

export function ProblemsListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Mock */}
      <aside className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SkeletonPulse className="h-5 w-24" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonPulse className="h-5 w-20" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonPulse className="h-5 w-24" />
          <div className="flex flex-col gap-2">
            <SkeletonPulse className="h-4 w-1/2" />
            <SkeletonPulse className="h-4 w-1/3" />
          </div>
        </div>
      </aside>

      {/* List Mock */}
      <main className="lg:col-span-3 flex flex-col gap-4">
        <SkeletonPulse className="h-4 w-40" />
        <div className="flex flex-col gap-3">
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
        </div>
      </main>
    </div>
  );
}
