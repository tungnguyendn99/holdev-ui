'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Award,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  Settings2,
  X,
} from 'lucide-react';
import {
  calculateDisciplineOverview,
  getWeekdayPlanConfig,
  getWeekendPlanConfig,
  setDailyPlanConfig,
  DailyPlanConfig,
  formatMinutesToDisplay,
} from './disciplineUtils';
import './DisciplineTracker.scss';

interface RecentDisciplineOverviewProps {
  dataDays: Record<string, any>;
  sessions: any[];
  planConfig?: DailyPlanConfig;
  weekendPlanConfig?: DailyPlanConfig;
  onPlanConfigChange?: (newConfig: DailyPlanConfig, isWeekend?: boolean) => void;
}

export const RecentDisciplineOverview: React.FC<RecentDisciplineOverviewProps> = ({
  dataDays,
  sessions = [],
  planConfig,
  weekendPlanConfig,
  onPlanConfigChange,
}) => {
  const [weekdayPlan, setWeekdayPlan] = useState<DailyPlanConfig>(() => {
    return planConfig || getWeekdayPlanConfig();
  });

  const [weekendPlan, setWeekendPlan] = useState<DailyPlanConfig>(() => {
    return weekendPlanConfig || getWeekendPlanConfig();
  });

  useEffect(() => {
    const handleUpdate = () => {
      setWeekdayPlan(getWeekdayPlanConfig());
      setWeekendPlan(getWeekendPlanConfig());
    };
    window.addEventListener('poker_daily_plan_updated', handleUpdate);
    return () => window.removeEventListener('poker_daily_plan_updated', handleUpdate);
  }, []);

  const [isEditingPlan, setIsEditingPlan] = useState<boolean>(false);
  const [tempWeekdayVolume, setTempWeekdayVolume] = useState<number>(weekdayPlan.plannedVolume);
  const [tempWeekdayHours, setTempWeekdayHours] = useState<number>(
    Math.round((weekdayPlan.plannedMinutes / 60) * 10) / 10,
  );
  const [tempWeekendVolume, setTempWeekendVolume] = useState<number>(weekendPlan.plannedVolume);
  const [tempWeekendHours, setTempWeekendHours] = useState<number>(
    Math.round((weekendPlan.plannedMinutes / 60) * 10) / 10,
  );

  const overview = useMemo(() => {
    return calculateDisciplineOverview(dataDays, sessions, weekdayPlan, 8, weekendPlan);
  }, [dataDays, sessions, weekdayPlan, weekendPlan]);

  const {
    totalGrindDays,
    completedDays,
    adherenceRate,
    disciplineScore,
    scoreGrade,
    totalHands,
    totalDurationDisplay,
    sampleDaysCount,
    sampleQuitEarlyCount,
    sampleChasingLossCount,
    recentDaysEvaluations,
    isLowAdherence,
    behaviorPatternDetected,
    behaviorAlertSuggestion,
    behaviorAlertDisclaimer,
  } = overview;

  const handleOpenEditPlan = () => {
    setTempWeekdayVolume(weekdayPlan.plannedVolume);
    setTempWeekdayHours(Math.round((weekdayPlan.plannedMinutes / 60) * 10) / 10);
    setTempWeekendVolume(weekendPlan.plannedVolume);
    setTempWeekendHours(Math.round((weekendPlan.plannedMinutes / 60) * 10) / 10);
    setIsEditingPlan(true);
  };

  const handleSavePlan = () => {
    const updatedWeekdayMins = Math.round((Number(tempWeekdayHours) || 5) * 60);
    const updatedWeekday: DailyPlanConfig = {
      plannedVolume: Number(tempWeekdayVolume) || 1500,
      plannedMinutes: updatedWeekdayMins,
      plannedTimeStr: formatMinutesToDisplay(updatedWeekdayMins),
    };

    const updatedWeekendMins = Math.round((Number(tempWeekendHours) || 2.5) * 60);
    const updatedWeekend: DailyPlanConfig = {
      plannedVolume: Number(tempWeekendVolume) || 750,
      plannedMinutes: updatedWeekendMins,
      plannedTimeStr:
        Number(tempWeekendHours) === 2.5
          ? '2h30'
          : formatMinutesToDisplay(updatedWeekendMins),
    };

    setDailyPlanConfig(updatedWeekday, false);
    setDailyPlanConfig(updatedWeekend, true);
    setWeekdayPlan(updatedWeekday);
    setWeekendPlan(updatedWeekend);
    setIsEditingPlan(false);
    if (onPlanConfigChange) {
      onPlanConfigChange(updatedWeekday, false);
      onPlanConfigChange(updatedWeekend, true);
    }
  };

  return (
    <div className="rdo-container">
      {/* KPI GRID */}
      <div className="rdo-kpi-grid">
        {/* DISCIPLINE SCORE */}
        <div className="rdo-score-card">
          <div
            className="rdo-score-gauge"
            style={
              {
                '--score-percent': disciplineScore,
                '--score-color': scoreGrade.color,
              } as React.CSSProperties
            }
          >
            <div className="rdo-score-inner">
              <span className="rdo-score-number">{disciplineScore}</span>
              <span className="rdo-score-grade">{scoreGrade.letter}</span>
            </div>
          </div>

          <div className="rdo-score-meta">
            <span className="rdo-meta-label">Discipline Score</span>
            <span className="rdo-meta-title">{scoreGrade.label}</span>
            <span className="rdo-meta-desc">
              Chấm điểm dựa trên mức độ tuân thủ kế hoạch & kiểm soát leak tâm lý
            </span>
          </div>
        </div>

        {/* PLAN ADHERENCE RATE */}
        <div className="rdo-kpi-card">
          <div className="rdo-kpi-header">
            <span className="rdo-kpi-title flex items-center gap-1.5">
              <Target size={14} className="text-blue-400" /> Plan Adherence
            </span>
            <span
              className={`rdo-kpi-badge ${
                adherenceRate >= 70 ? 'good' : 'alert'
              }`}
            >
              {completedDays}/{totalGrindDays} ngày đạt
            </span>
          </div>

          <div className="rdo-kpi-main-val">
            <span>{adherenceRate}%</span>
            <span className="sub-unit">adherence</span>
          </div>

          <div className="rdo-kpi-footer">
            <span className="text-[11px] text-zinc-400 font-mono">
              Adherence = (Ngày tuân thủ / Tổng ngày grind) * 100%
            </span>
          </div>
        </div>

        {/* WEEKLY / RECENT CONSISTENCY */}
        <div className="rdo-kpi-card">
          <div className="rdo-kpi-header">
            <span className="rdo-kpi-title flex items-center gap-1.5">
              <Award size={14} className="text-purple-400" /> Weekly Consistency
            </span>
            <button
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition"
              onClick={handleOpenEditPlan}
              title="Cài đặt mục tiêu ngày thường & cuối tuần"
            >
              <Settings2 size={12} /> Plan: T2-T6 ({weekdayPlan.plannedVolume} hands / {weekdayPlan.plannedTimeStr}) • T7-CN ({weekendPlan.plannedVolume} hands / {weekendPlan.plannedTimeStr})
            </button>
          </div>

          <div className="rdo-streak-row">
            {recentDaysEvaluations.length > 0 ? (
              recentDaysEvaluations.map((d, idx) => (
                <div
                  key={d.dateKey || idx}
                  className={`rdo-streak-dot ${
                    d.isCompleted
                      ? 'dot-completed'
                      : d.isQuitEarlyWinning
                      ? 'dot-warning'
                      : 'dot-failed'
                  }`}
                  title={`${d.dateKey} (${d.isWeekendDay ? 'Cuối tuần' : 'Ngày thường'}): ${
                    d.isCompleted
                      ? 'Đạt kế hoạch'
                      : d.isQuitEarlyWinning
                      ? 'Dừng sớm khi Win'
                      : 'Chưa đạt'
                  } (${d.hands.toLocaleString()}/${d.plannedVolume.toLocaleString()} hands, ${d.durationDisplay}/${d.plannedTimeStr})`}
                >
                  {d.isCompleted ? '✓' : d.isQuitEarlyWinning ? '⚡' : '!'}
                </div>
              ))
            ) : (
              <span className="text-xs text-zinc-400">Chưa có dữ liệu session gần đây</span>
            )}
          </div>

          <div className="rdo-kpi-footer">
            <span className="text-zinc-400">
              Tổng grind: <strong className="text-zinc-200">{totalHands.toLocaleString()}</strong> hands ({totalDurationDisplay})
            </span>
          </div>
        </div>
      </div>

      {/* PLAN TARGET EDIT MODAL / INLINE BAR */}
      <AnimatePresence>
        {isEditingPlan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-slate-900/95 border border-blue-500/30 rounded-xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-blue-400" />
                <span className="text-sm font-semibold text-slate-200">
                  Cài đặt Kế hoạch Grind (Daily Plan):
                </span>
              </div>
              <button
                onClick={() => setIsEditingPlan(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-slate-800">
              {/* WEEKDAY PLAN */}
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex flex-col gap-2">
                <span className="text-xs font-semibold text-blue-300 flex items-center gap-1">
                  📅 Ngày thường (Thứ 2 - Thứ 6)
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Volume:</span>
                    <input
                      type="number"
                      value={tempWeekdayVolume}
                      onChange={(e) => setTempWeekdayVolume(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white"
                      step={50}
                      min={100}
                    />
                    <span className="text-xs text-slate-400">hands</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Thời gian:</span>
                    <input
                      type="number"
                      value={tempWeekdayHours}
                      onChange={(e) => setTempWeekdayHours(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white"
                      step={0.5}
                      min={0.5}
                    />
                    <span className="text-xs text-slate-400">giờ</span>
                  </div>
                </div>
              </div>

              {/* WEEKEND PLAN */}
              <div className="p-3 bg-slate-800/60 rounded-lg border border-purple-500/30 flex flex-col gap-2">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                  🌟 Cuối tuần (Thứ 7 & Chủ Nhật)
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Volume:</span>
                    <input
                      type="number"
                      value={tempWeekendVolume}
                      onChange={(e) => setTempWeekendVolume(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white"
                      step={50}
                      min={100}
                    />
                    <span className="text-xs text-slate-400">hands</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Thời gian:</span>
                    <input
                      type="number"
                      value={tempWeekendHours}
                      onChange={(e) => setTempWeekendHours(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white"
                      step={0.5}
                      min={0.5}
                    />
                    <span className="text-xs text-slate-400">giờ ({Math.round(tempWeekendHours * 60)}p)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 pt-2">
              <button
                onClick={() => setIsEditingPlan(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition shadow-sm"
              >
                Lưu cài đặt kế hoạch
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOW ADHERENCE WARNING (IF ADHERENCE < 70%) */}
      {isLowAdherence && (
        <motion.div
          className="rdo-low-adherence-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="rdo-lac-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="rdo-lac-body">
            <span className="rdo-lac-title">
              Cảnh báo: Chỉ số tuân thủ kế hoạch khá thấp ({adherenceRate}%)
            </span>
            <p className="rdo-lac-desc">
              Tỷ lệ hoàn thành kế hoạch hàng ngày của bạn hiện tại chỉ đạt{' '}
              <strong>{adherenceRate}%</strong> (chỉ tiêu tối thiểu là 75%). Bạn đang gặp vấn đề
              về việc duy trì đủ thời gian hoặc volume đã cam kết (Ngày thường: {weekdayPlan.plannedVolume.toLocaleString()} hands & {weekdayPlan.plannedTimeStr}, Cuối tuần: {weekendPlan.plannedVolume.toLocaleString()} hands & {weekendPlan.plannedTimeStr}). Hãy xem lại nguyên nhân: mục tiêu có quá tải hay tâm lý dừng chơi bị chi phối bởi kết quả thắng/thua ngắn hạn?
            </p>
          </div>
        </motion.div>
      )}

      {/* BEHAVIOR PATTERN DETECTED (LEAK DETECTOR) */}
      {behaviorPatternDetected ? (
        <motion.div
          className="rdo-behavior-alert-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="rdo-bac-header">
            <div className="rdo-bac-title-box">
              <div className="rdo-bac-icon">
                <Flame size={18} />
              </div>
              <span className="rdo-bac-title">Behavior Pattern Detected</span>
            </div>
            <span className="rdo-bac-tag">Hệ thống sửa leak tâm lý</span>
          </div>

          <div className="rdo-bac-pattern-text">
            Trong <strong>{sampleDaysCount} ngày</strong> gần nhất, bạn đã{' '}
            <span className="highlight-win">
              kết thúc sớm {sampleQuitEarlyCount} lần khi đang winning
            </span>
            , và{' '}
            <span className="highlight-loss">
              kéo dài {sampleChasingLossCount} lần khi đang losing
            </span>
            .
          </div>

          <div className="rdo-bac-suggestion">
            <span className="suggestion-label">Gợi ý:</span>
            <span>{behaviorAlertSuggestion}</span>
          </div>

          <div className="rdo-bac-disclaimer">
            {behaviorAlertDisclaimer}
          </div>
        </motion.div>
      ) : (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-200">
            <strong>Kỷ luật vững vàng:</strong> Không phát hiện pattern dừng sớm khi win hoặc kéo dài khi thua trong mẫu ngày gần nhất. Tiếp tục thực hiện đúng quy trình!
          </span>
        </div>
      )}
    </div>
  );
};

export default RecentDisciplineOverview;
