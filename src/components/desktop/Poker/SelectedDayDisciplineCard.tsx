'use client';

import React, { useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  Layers,
  Star,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  evaluateDayPlan,
  getDailyPlanConfig,
  DailyPlanConfig,
  formatMinutesToDisplay,
} from './disciplineUtils';
import './DisciplineTracker.scss';

interface SelectedDayDisciplineCardProps {
  selectedDate: Dayjs;
  dayData?: any;
  daySessions?: any[];
  planConfig?: DailyPlanConfig;
}

export const SelectedDayDisciplineCard: React.FC<SelectedDayDisciplineCardProps> = ({
  selectedDate,
  dayData,
  daySessions = [],
  planConfig,
}) => {
  const activePlanConfig = useMemo(() => {
    return planConfig || getDailyPlanConfig();
  }, [planConfig]);

  const dateKey = selectedDate.format('YYYY-MM-DD');

  const evaluation = useMemo(() => {
    return evaluateDayPlan(dateKey, dayData, daySessions, activePlanConfig);
  }, [dateKey, dayData, daySessions, activePlanConfig]);

  const {
    hands,
    durationMinutes,
    durationDisplay,
    profit,
    sessionsCount,
    avgRating,
    hasGrinded,
    isCompleted,
    handsProgress,
    timeProgress,
    isQuitEarlyWinning,
    isChasingLoss,
    alertType,
    alertTitle,
    alertMessage,
    advice,
  } = evaluation;

  const formattedDateStr = selectedDate.format('dddd, DD/MM/YYYY');

  return (
    <motion.div
      className={`sddc-container status-${alertType}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* HEADER */}
      <div className="sddc-header">
        <div className="sddc-date-block">
          <div className="sddc-icon-badge">
            <Calendar size={18} />
          </div>
          <div className="sddc-title-group">
            <span className="sddc-subtitle">Đánh giá kế hoạch ngày</span>
            <span className="sddc-date-text">{formattedDateStr}</span>
          </div>
        </div>

        {/* STATUS BADGE */}
        <div>
          {isCompleted ? (
            <span className="sddc-badge badge-completed">
              <CheckCircle2 size={14} /> ĐẠT CHUẨN KỶ LUẬT
            </span>
          ) : isQuitEarlyWinning ? (
            <span className="sddc-badge badge-warning_win">
              <Flame size={14} /> DỪNG SỚM KHI WIN
            </span>
          ) : isChasingLoss ? (
            <span className="sddc-badge badge-warning_loss">
              <ShieldAlert size={14} /> KÉO DÀI KHI THUA
            </span>
          ) : hasGrinded ? (
            <span className="sddc-badge badge-incomplete">
              <AlertTriangle size={14} /> CHƯA ĐẠT KẾ HOẠCH
            </span>
          ) : (
            <span className="sddc-badge badge-rest">
              <Clock size={14} /> CHƯA CÓ SESSION
            </span>
          )}
        </div>
      </div>

      {/* METRIC PROGRESS METERS */}
      <div className="sddc-metrics-row">
        {/* VOLUME PROGRESS */}
        <div className="sddc-metric-card">
          <div className="sddc-metric-top">
            <span className="sddc-metric-label flex items-center gap-1.5">
              <Layers size={13} className="text-blue-400" /> Planned Volume
            </span>
            <span
              className={`sddc-metric-percent ${
                hands >= activePlanConfig.plannedVolume ? 'complete' : 'pending'
              }`}
            >
              {handsProgress}%
            </span>
          </div>
          <div className="sddc-metric-values">
            <span className="sddc-metric-actual">{hands.toLocaleString()}</span>
            <span className="sddc-metric-target">
              / {activePlanConfig.plannedVolume.toLocaleString()} hands
            </span>
          </div>
          <div className="sddc-progress-track">
            <div
              className={`sddc-progress-bar ${
                hands >= activePlanConfig.plannedVolume ? 'complete' : 'pending'
              }`}
              style={{ width: `${Math.min(100, handsProgress)}%` }}
            />
          </div>
          <div className="sddc-metric-hint">
            {hands >= activePlanConfig.plannedVolume ? (
              <span className="text-emerald-400">
                ✓ Đạt chỉ tiêu ({hands - activePlanConfig.plannedVolume >= 0 ? `+${(hands - activePlanConfig.plannedVolume).toLocaleString()} hands dư` : ''})
              </span>
            ) : (
              <span className="text-amber-400">
                Thiếu {(activePlanConfig.plannedVolume - hands).toLocaleString()} hands
              </span>
            )}
          </div>
        </div>

        {/* TIME PROGRESS */}
        <div className="sddc-metric-card">
          <div className="sddc-metric-top">
            <span className="sddc-metric-label flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" /> Planned Time
            </span>
            <span
              className={`sddc-metric-percent ${
                durationMinutes >= activePlanConfig.plannedMinutes ? 'complete' : 'pending'
              }`}
            >
              {timeProgress}%
            </span>
          </div>
          <div className="sddc-metric-values">
            <span className="sddc-metric-actual">{durationDisplay}</span>
            <span className="sddc-metric-target">
              / {formatMinutesToDisplay(activePlanConfig.plannedMinutes)}
            </span>
          </div>
          <div className="sddc-progress-track">
            <div
              className={`sddc-progress-bar ${
                durationMinutes >= activePlanConfig.plannedMinutes ? 'complete' : 'pending'
              }`}
              style={{ width: `${Math.min(100, timeProgress)}%` }}
            />
          </div>
          <div className="sddc-metric-hint">
            {durationMinutes >= activePlanConfig.plannedMinutes ? (
              <span className="text-emerald-400">✓ Đạt thời gian tối thiểu</span>
            ) : (
              <span className="text-amber-400">
                Thiếu {formatMinutesToDisplay(activePlanConfig.plannedMinutes - durationMinutes)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* QUICK STATS ROW */}
      {hasGrinded && (
        <div className="sddc-quickstats-row">
          <div className="sddc-stat-item">
            <span className="stat-label">Kết quả ngày:</span>
            <span
              className={`stat-val flex items-center gap-1 ${
                profit >= 0 ? 'profit-positive' : 'profit-negative'
              }`}
            >
              {profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {profit >= 0 ? `+$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`}
            </span>
          </div>

          <div className="sddc-stat-item">
            <span className="stat-label">Số sessions:</span>
            <span className="stat-val">{sessionsCount}</span>
          </div>

          {avgRating > 0 && (
            <div className="sddc-stat-item">
              <span className="stat-label">Đánh giá chất lượng:</span>
              <span className="stat-val flex items-center gap-1 text-yellow-400">
                <Star size={13} className="fill-yellow-400" /> {avgRating.toFixed(1)} / 5.0
              </span>
            </div>
          )}
        </div>
      )}

      {/* ALERT BANNER */}
      <div className={`sddc-alert-banner alert-${alertType}`}>
        <div className="sddc-alert-icon">
          {alertType === 'success' && <CheckCircle2 size={18} />}
          {alertType === 'warning_win' && <Flame size={18} />}
          {alertType === 'warning_loss' && <ShieldAlert size={18} />}
          {alertType === 'incomplete' && <AlertTriangle size={18} />}
          {alertType === 'rest' && <Info size={18} />}
        </div>
        <div className="sddc-alert-body">
          <div className="sddc-alert-title">{alertTitle}</div>
          <div className="sddc-alert-message">{alertMessage}</div>
          {advice && <div className="sddc-alert-advice">{advice}</div>}
        </div>
      </div>
    </motion.div>
  );
};

export default SelectedDayDisciplineCard;
