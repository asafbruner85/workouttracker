/**
 * NavigationButtons - Period navigation with prev/next buttons
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NavigationButtons({
  periodTitle,
  viewMode,
  onNavigate
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => onNavigate(-1)}
        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="text-center">
        {viewMode === 'weekly' && typeof periodTitle === 'object' ? (
          <>
            <h2 className="text-2xl font-bold">{periodTitle.main}</h2>
            <p className="text-gray-400">{periodTitle.sub}</p>
          </>
        ) : (
          <h2 className="text-2xl font-bold">{periodTitle}</h2>
        )}
      </div>

      <button
        onClick={() => onNavigate(1)}
        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
