/**
 * useModalState - Manages modal visibility states
 */

import { useState, useCallback } from 'react';

export function useModalState() {
  const [showHistory, setShowHistory] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showScheduleConfig, setShowScheduleConfig] = useState(false);
  const [logDate, setLogDate] = useState(null);
  const [editDate, setEditDate] = useState(null);

  const openLogModal = useCallback((date) => {
    setLogDate(date);
    setShowLogModal(true);
  }, []);

  const closeLogModal = useCallback(() => {
    setShowLogModal(false);
  }, []);

  const openEditModal = useCallback((date) => {
    setEditDate(date);
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev);
  }, []);

  const toggleProgressDashboard = useCallback(() => {
    setShowProgressDashboard(prev => !prev);
  }, []);

  const toggleScheduleConfig = useCallback(() => {
    setShowScheduleConfig(prev => !prev);
  }, []);

  return {
    // History
    showHistory,
    setShowHistory,
    toggleHistory,

    // Log modal
    showLogModal,
    setShowLogModal,
    logDate,
    setLogDate,
    openLogModal,
    closeLogModal,

    // Edit modal
    showEditModal,
    setShowEditModal,
    editDate,
    setEditDate,
    openEditModal,
    closeEditModal,

    // Progress dashboard
    showProgressDashboard,
    setShowProgressDashboard,
    toggleProgressDashboard,

    // Schedule config
    showScheduleConfig,
    setShowScheduleConfig,
    toggleScheduleConfig
  };
}
