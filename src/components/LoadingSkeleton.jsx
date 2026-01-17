import React from 'react';
import { SkeletonText, SkeletonButton, SkeletonStatCard, SkeletonDayCard } from './SkeletonComponents';

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header Skeleton */}
      <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 bg-gray-700 animate-pulse rounded" />
            <div>
              <SkeletonText width="w-32" height="h-5" />
              <SkeletonText width="w-12" height="h-3" className="mt-1" />
            </div>
          </div>

          {/* Header buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonButton key={i} className="w-10 h-10 sm:w-24 sm:h-10" />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* View Mode Switcher Skeleton */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-700/50 rounded-lg p-1 gap-1">
            {['Daily', 'Weekly', 'Monthly'].map((mode) => (
              <SkeletonButton key={mode} className="w-16 sm:w-20 h-10" />
            ))}
          </div>
        </div>

        {/* Period Navigation Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <SkeletonButton className="w-10 h-10" />
          <div className="text-center flex flex-col items-center">
            <SkeletonText width="w-48" height="h-7" />
            <SkeletonText width="w-32" height="h-4" className="mt-1" />
          </div>
          <SkeletonButton className="w-10 h-10" />
        </div>

        {/* Calendar Grid Skeleton - 7 days for weekly view */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <SkeletonDayCard key={index} />
          ))}
        </div>

        {/* Quick Stats Skeleton */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
