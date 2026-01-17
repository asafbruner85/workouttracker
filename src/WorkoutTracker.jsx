/**
 * WorkoutTracker - Main application component
 * Refactored to use extracted components and custom hooks
 */

import React, { useEffect } from 'react';

// Components
import LoginScreen from './components/LoginScreen';
import ProgressDashboard from './components/ProgressDashboard';
import ScheduleConfig from './components/ScheduleConfig';
import UpdateNotification from './components/UpdateNotification';
import LoadingSkeleton from './components/LoadingSkeleton';
import { LogModal, EditWorkoutModal } from './components/modals';
import { CalendarGrid } from './components/calendar';
import { AppHeader, NavigationButtons, ViewModeSwitcher } from './components/header';
import { QuickStats } from './components/stats';
import { HistoryPanel } from './components/history';

// Hooks
import { useAuthentication, useWorkoutData, useCalendarNavigation, useModalState } from './hooks';

// Utils
import { registerServiceWorker, setupInstallPrompt } from './utils/pwa';

// App version - must match service worker version and UpdateNotification.jsx
const APP_VERSION = 'v1.2.1';

export default function WorkoutTracker() {
  // Custom hooks for state management
  const auth = useAuthentication();
  const workoutData = useWorkoutData();
  const calendar = useCalendarNavigation();
  const modals = useModalState();

  // Initialize PWA on mount
  useEffect(() => {
    registerServiceWorker();
    setupInstallPrompt((available) => {
      console.log('Install prompt available:', available);
    });
  }, []);

  // Check authentication on mount
  useEffect(() => {
    auth.checkAuth();
  }, []);

  // Loading state
  if (workoutData.loading) {
    return <LoadingSkeleton />;
  }

  // Login screen
  if (!auth.isAuthenticated) {
    return <LoginScreen onLogin={auth.login} />;
  }

  // Get current workout and log for modals
  const editWorkout = modals.editDate ? workoutData.getWorkoutForDate(modals.editDate) : null;
  const logWorkout = modals.logDate ? workoutData.getWorkoutForDate(modals.logDate) : null;
  const logData = modals.logDate ? workoutData.getDateLog(modals.logDate) : null;

  // Handle schedule save with current week context
  const handleScheduleSave = (schedule) => {
    workoutData.handleScheduleSave(schedule, calendar.currentWeekKey, calendar.weekDates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Update Notification */}
      <UpdateNotification />

      {/* Progress Dashboard Modal */}
      {modals.showProgressDashboard && (
        <ProgressDashboard
          workoutLogs={workoutData.workoutLogs}
          workoutProgram={workoutData.workoutProgram}
          onClose={() => modals.setShowProgressDashboard(false)}
        />
      )}

      {/* Schedule Config Modal */}
      {modals.showScheduleConfig && (
        <ScheduleConfig
          currentSchedule={workoutData.workoutProgram}
          onSave={handleScheduleSave}
          onClose={() => modals.setShowScheduleConfig(false)}
        />
      )}

      {/* Log Modal */}
      <LogModal
        isOpen={modals.showLogModal}
        date={modals.logDate}
        workout={logWorkout}
        log={logData}
        onClose={modals.closeLogModal}
        onUpdateLog={workoutData.updateLog}
        onToggleCompletion={workoutData.toggleCompletion}
        saveTimeoutRef={workoutData.saveTimeoutRef}
      />

      {/* Edit Workout Modal */}
      <EditWorkoutModal
        isOpen={modals.showEditModal}
        date={modals.editDate}
        workout={editWorkout}
        onClose={modals.closeEditModal}
        onSave={workoutData.updateWorkoutForDate}
        onReset={workoutData.resetWorkoutToDefault}
      />

      {/* Header */}
      <AppHeader
        appVersion={APP_VERSION}
        saveStatus={workoutData.saveStatus}
        showScheduleConfig={modals.showScheduleConfig}
        showProgressDashboard={modals.showProgressDashboard}
        showHistory={modals.showHistory}
        onExport={workoutData.handleExportData}
        onImport={workoutData.handleImportData}
        onToggleSchedule={modals.toggleScheduleConfig}
        onToggleProgress={modals.toggleProgressDashboard}
        onToggleHistory={modals.toggleHistory}
        onLogout={auth.logout}
      />

      <main className="max-w-7xl mx-auto p-4">
        {/* History Panel */}
        <HistoryPanel
          isOpen={modals.showHistory}
          history={workoutData.getHistory()}
          workoutProgram={workoutData.workoutProgram}
          onOpenLog={modals.openLogModal}
        />

        {/* View Mode Switcher */}
        <ViewModeSwitcher
          viewMode={calendar.viewMode}
          onViewModeChange={calendar.setViewMode}
        />

        {/* Period Navigation */}
        <NavigationButtons
          periodTitle={calendar.periodTitle}
          viewMode={calendar.viewMode}
          onNavigate={calendar.navigate}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          displayDates={calendar.displayDates}
          viewMode={calendar.viewMode}
          getWorkoutForDate={workoutData.getWorkoutForDate}
          getDateLog={workoutData.getDateLog}
          onOpenLog={modals.openLogModal}
          onOpenEdit={modals.openEditModal}
        />

        {/* Quick Stats */}
        <QuickStats
          weekDates={calendar.weekDates}
          getWorkoutForDate={workoutData.getWorkoutForDate}
          getDateLog={workoutData.getDateLog}
        />
      </main>
    </div>
  );
}
