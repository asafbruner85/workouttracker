/**
 * ViewModeSwitcher - Toggle between daily/weekly/monthly views
 */

import React from 'react';

export default function ViewModeSwitcher({ viewMode, onViewModeChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-gray-700 rounded-lg p-1 gap-1">
        <button
          onClick={() => onViewModeChange('daily')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'daily'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => onViewModeChange('weekly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'weekly'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => onViewModeChange('monthly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'monthly'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
        >
          Monthly
        </button>
      </div>
    </div>
  );
}
