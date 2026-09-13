import React from 'react';

/**
 * Base atomic Skeleton component with pulse animation
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-md ${className}`}
      {...props}
    />
  );
}

/**
 * 1. RosterSkeleton: exactly matches the user's uploaded mockup:
 * Circular avatar on left + 2 horizontal bars (name and role) in a multi-column grid
 */
export function RosterSkeleton({ count = 8, columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid ${columns} gap-4 animate-in fade-in duration-200`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-xs flex items-center space-x-3.5"
        >
          {/* Avatar circle */}
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          
          {/* Name & Role lines */}
          <div className="flex-1 space-y-2 py-0.5">
            <Skeleton className={`h-4 rounded-md ${i % 3 === 0 ? 'w-3/5' : i % 2 === 0 ? 'w-4/6' : 'w-1/2'}`} />
            <Skeleton className={`h-3 rounded-md ${i % 2 === 0 ? 'w-4/5' : 'w-3/4'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 2. StatsTableSkeleton: Leaderboard / Statistics table skeleton with rank, avatar, name, and metric columns
 */
export function StatsTableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 animate-in fade-in duration-200">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3.5 w-12"><Skeleton className="h-3.5 w-6 rounded-sm" /></th>
            <th className="px-6 py-3.5"><Skeleton className="h-3.5 w-24 rounded-sm" /></th>
            <th className="px-6 py-3.5"><Skeleton className="h-3.5 w-24 rounded-sm" /></th>
            <th className="px-6 py-3.5"><Skeleton className="h-3.5 w-20 rounded-sm" /></th>
            <th className="px-6 py-3.5 text-right"><Skeleton className="h-3.5 w-16 ml-auto rounded-sm" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="px-6 py-4">
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-5 rounded-md" />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className={`h-4 rounded-md ${i % 2 === 0 ? 'w-28' : 'w-36'}`} />
                    <Skeleton className="h-2.5 w-20 rounded-md" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20 rounded-md" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-16 rounded-md" />
              </td>
              <td className="px-6 py-4 text-right">
                <Skeleton className="h-4 w-12 ml-auto rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 3. DossierCardsSkeleton: Member dossier cards in grid view
 */
export function DossierCardsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4"
        >
          {/* Header with avatar, name and status badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Skill ratings placeholders */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14 rounded-sm" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14 rounded-sm" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>

          {/* Bottom Action Button */}
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * 4. DossierModalGlobalSkeleton: Global search placeholder inside MemberDossierModal
 */
export function DossierModalGlobalSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200 pt-2">
      {/* Banner Skeleton */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center space-x-2.5">
          <Skeleton className="w-5 h-5 rounded-full shrink-0" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-4/5 rounded-md" />
      </div>

      {/* Profile Record Skeleton */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * 5. ApplicationsTableSkeleton: Recruitment tickets / applications table rows
 */
export function ApplicationsTableSkeleton({ rows = 5 }) {
  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs animate-in fade-in duration-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-4 py-3"><Skeleton className="h-3.5 w-24 rounded-sm" /></th>
            <th className="px-3 py-3"><Skeleton className="h-3.5 w-16 rounded-sm" /></th>
            <th className="px-3 py-3"><Skeleton className="h-3.5 w-14 rounded-sm" /></th>
            <th className="px-3 py-3"><Skeleton className="h-3.5 w-14 rounded-sm" /></th>
            <th className="px-3 py-3"><Skeleton className="h-3.5 w-16 rounded-sm" /></th>
            <th className="px-3 py-3 text-center"><Skeleton className="h-3.5 w-16 mx-auto rounded-sm" /></th>
            <th className="px-4 py-3 text-right"><Skeleton className="h-3.5 w-16 ml-auto rounded-sm" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="px-4 py-3">
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2.5">
                  <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                  <Skeleton className={`h-3.5 rounded-md ${i % 2 === 0 ? 'w-24' : 'w-32'}`} />
                </div>
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-3 w-16 rounded-md" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-3 w-10 rounded-md" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-3 w-12 rounded-md" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-18 rounded-full" />
              </td>
              <td className="px-3 py-3 text-center">
                <Skeleton className="h-6 w-16 mx-auto rounded-lg" />
              </td>
              <td className="px-4 py-3 text-right">
                <Skeleton className="h-3 w-16 ml-auto rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 6. SelectSkeleton: Form input/select skeleton placeholder
 */
export function SelectSkeleton({ label, description }) {
  return (
    <div className="flex flex-col space-y-1 animate-in fade-in duration-200">
      {label && <Skeleton className="h-3.5 w-28 rounded-md mb-1" />}
      {description && <Skeleton className="h-2.5 w-48 rounded-md mb-2" />}
      <Skeleton className="h-9.5 w-full rounded-lg" />
    </div>
  );
}

/**
 * 7. VoiceRoomsSkeleton: Voice generator config and active rooms skeleton
 */
export function VoiceRoomsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Config card skeleton */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3 w-72 rounded-md" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectSkeleton label=" " />
          <SelectSkeleton label=" " />
        </div>
      </div>

      {/* Active rooms card skeleton */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-2.5 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 8. IntegrityCheckSkeleton: Developer diagnostics & integrity check list rows
 */
export function IntegrityCheckSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      <Skeleton className="h-4 w-36 rounded-md mb-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
          <Skeleton className={`h-3.5 rounded-md ${i % 2 === 0 ? 'w-44' : 'w-56'}`} />
          <Skeleton className="w-4 h-4 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
