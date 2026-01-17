/**
 * AppHeader - Main application header with navigation
 */

import React from 'react';
import { Dumbbell, Download, Upload, Calendar, TrendingUp, History, Unlock } from 'lucide-react';

export default function AppHeader({
  appVersion,
  saveStatus,
  showScheduleConfig,
  showProgressDashboard,
  showHistory,
  onExport,
  onImport,
  onToggleSchedule,
  onToggleProgress,
  onToggleHistory,
  onLogout
}) {
  return (
    <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold">Workout Tracker</h1>
            <div className="text-xs text-gray-400">{appVersion}</div>
          </div>
          {saveStatus && (
            <span className="text-sm text-green-400 animate-pulse">{saveStatus}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExport}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-sm"
            title="Export workout data as backup"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <label className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />
          </label>
          <button
            onClick={onToggleSchedule}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
              showScheduleConfig ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Configure your weekly workout schedule"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </button>
          <button
            onClick={onToggleProgress}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
              showProgressDashboard ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </button>
          <button
            onClick={onToggleHistory}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
              showHistory ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Unlock className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
