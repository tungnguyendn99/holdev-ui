'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import './TodaysMission.scss';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', text: 'Tôi đã xác định thời gian grind hôm nay', checked: false },
  { id: 'c2', text: 'Tôi không đặt profit target để quyết định nghỉ', checked: false },
  { id: 'c3', text: 'Tôi chấp nhận variance trước khi bắt đầu', checked: false },
  { id: 'c4', text: 'Tôi biết dấu hiệu tilt và điều kiện stop', checked: false },
  { id: 'c5', text: 'Tôi đã chọn một kỹ năng cần tập trung', checked: false },
];

const STUDY_TASKS = [
  'River decisions',
  'Preflop ranges',
  'Postflop sizing',
  'Bluff frequencies',
  'Turn play',
  'C-bet strategy',
  '3-bet pots',
  'Multiway pots',
];

const PRIORITIES = ['A-Game', 'Volume', 'Study', 'Recovery', 'Review'];

const TodaysMission = () => {
  const router = useRouter();
  const today = dayjs();
  const dayName = today.format('dddd').toUpperCase();

  // State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [plannedVolume, setPlannedVolume] = useState<number>(1000);
  const [plannedTime, setPlannedTime] = useState<string>('3.5h');
  const [studyTask, setStudyTask] = useState<string>('River decisions');
  const [studyDuration, setStudyDuration] = useState<string>('15 minutes (GTO lab)');
  const [priority, setPriority] = useState<string>('A-Game');
  const [prioritySubtext, setPrioritySubtext] = useState<string>('Process over profit');

  const completedCount = checklist.filter((c) => c.checked).length;
  const totalCount = checklist.length;
  const allCompleted = completedCount === totalCount;
  const progressPercent = (completedCount / totalCount) * 100;

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const handleGoToDashboard = () => {
    router.push('/poker/dashboard');
  };

  return (
    <div className="tm-container">
      {/* HEADER */}
      <div className="tm-header">
        <div className="tm-header-left">
          <span className="tm-day-label">
            {dayName} • DAILY PLAN
          </span>
          <h1 className="tm-title">Today's Mission</h1>
        </div>
        <div className="tm-header-right">
          <motion.span
            className={`tm-status-badge ${allCompleted ? 'completed' : 'pending'}`}
            key={allCompleted ? 'ok' : 'no'}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {allCompleted ? '✓ READY TO GRIND' : 'PRE-CHECK NEEDED'}
          </motion.span>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="tm-metrics-grid">
        <div className="tm-metric-card">
          <span className="tm-metric-label">Planned volume</span>
          <span className="tm-metric-value">{plannedVolume.toLocaleString()}</span>
          <span className="tm-metric-unit">hands</span>
        </div>
        <div className="tm-metric-card">
          <span className="tm-metric-label">Planned time</span>
          <span className="tm-metric-value">{plannedTime}</span>
          <span className="tm-metric-unit">total grind time</span>
        </div>
        <div className="tm-metric-card secondary">
          <span className="tm-metric-label">Study task</span>
          <span className="tm-metric-value-sm">{studyTask}</span>
          <span className="tm-metric-unit">{studyDuration}</span>
        </div>
        <div className="tm-metric-card secondary">
          <span className="tm-metric-label">Today's priority</span>
          <span className="tm-metric-value-sm tm-priority-value">{priority}</span>
          <span className="tm-metric-unit">{prioritySubtext}</span>
        </div>
      </div>

      {/* PRE-SESSION CHECKLIST */}
      <div className="tm-checklist-section">
        <h2 className="tm-section-title">Pre-session checklist</h2>
        <div className="tm-checklist-list">
          {checklist.map((item, idx) => (
            <motion.div
              key={item.id}
              className={`tm-checklist-item ${item.checked ? 'checked' : ''}`}
              onClick={() => toggleCheck(item.id)}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`tm-checkbox ${item.checked ? 'active' : ''}`}>
                <AnimatePresence>
                  {item.checked && (
                    <motion.svg
                      viewBox="0 0 24 24"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <polyline
                        points="4 12 9 17 20 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </div>
              <span className="tm-checklist-text">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* READINESS FOOTER */}
      <div className="tm-readiness">
        <div className="tm-readiness-info">
          <span className="tm-readiness-label">PRE-SESSION READINESS</span>
          <div className="tm-readiness-stats">
            <span className="tm-readiness-count">
              {completedCount}/{totalCount} completed
            </span>
            <span className="tm-readiness-action">Calibrate focus</span>
          </div>
        </div>
        <div className="tm-readiness-bar-outer">
          <motion.div
            className={`tm-readiness-bar-inner ${allCompleted ? 'complete' : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* DASHBOARD NAVIGATION */}
      <div className="tm-dashboard-nav">
        <button className="tm-dashboard-btn" onClick={handleGoToDashboard}>
          <span className="tm-dashboard-btn-icon">📊</span>
          <div className="tm-dashboard-btn-text">
            <span className="tm-dashboard-btn-title">Poker Dashboard</span>
            <span className="tm-dashboard-btn-desc">Calendar & Statistics</span>
          </div>
          <span className="tm-dashboard-btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default TodaysMission;
