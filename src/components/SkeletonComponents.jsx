import React from 'react';

// Base skeleton block with pulse animation
export const SkeletonBlock = ({ className = '' }) => (
  <div className={`bg-gray-700 animate-pulse rounded ${className}`} />
);

// Skeleton for text lines
export const SkeletonText = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`bg-gray-700 animate-pulse rounded ${width} ${height} ${className}`} />
);

// Skeleton for buttons
export const SkeletonButton = ({ className = '' }) => (
  <div className={`bg-gray-700 animate-pulse rounded-lg ${className}`} />
);

// Skeleton for stat cards
export const SkeletonStatCard = () => (
  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
    <SkeletonText width="w-20" height="h-3" />
    <div className="my-2">
      <SkeletonText width="w-16" height="h-8" />
    </div>
    <SkeletonText width="w-24" height="h-3" />
  </div>
);

// Skeleton for workout day card
export const SkeletonDayCard = ({ isLarge = false }) => (
  <div className={`rounded-xl border border-gray-700 bg-gray-800 ${isLarge ? 'max-w-2xl mx-auto' : ''}`}>
    {/* Day Header */}
    <div className="bg-gray-700 animate-pulse px-4 py-3 rounded-t-xl">
      <SkeletonText width="w-16" height="h-5" />
      <SkeletonText width="w-20" height="h-3" className="mt-1" />
    </div>

    {/* Workout Type */}
    <div className="px-4 py-2 border-b border-gray-700">
      <SkeletonText width="w-24" height="h-4" />
      <SkeletonText width="w-16" height="h-3" className="mt-1" />
    </div>

    {/* Exercises Preview */}
    <div className="p-4 space-y-3">
      <div className="space-y-1">
        <SkeletonText width="w-full" height="h-4" />
        <SkeletonText width="w-3/4" height="h-3" />
      </div>
      <div className="space-y-1">
        <SkeletonText width="w-5/6" height="h-4" />
        <SkeletonText width="w-2/3" height="h-3" />
      </div>
      {isLarge && (
        <>
          <div className="space-y-1">
            <SkeletonText width="w-4/5" height="h-4" />
            <SkeletonText width="w-1/2" height="h-3" />
          </div>
          <div className="space-y-1">
            <SkeletonText width="w-full" height="h-4" />
            <SkeletonText width="w-3/5" height="h-3" />
          </div>
        </>
      )}
    </div>

    {/* Action Buttons */}
    <div className="px-4 pb-4 flex gap-2">
      <SkeletonButton className="flex-1 h-9" />
      <SkeletonButton className="w-9 h-9" />
    </div>
  </div>
);
