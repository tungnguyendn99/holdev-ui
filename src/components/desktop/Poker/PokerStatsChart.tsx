'use client';

import React, { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import cx from 'classnames';
import './PokerStatsChart.scss';

interface PokerStatsChartProps {
  selectedDate: Dayjs;
  mode: string; // 'month' | 'year'
  dataDays: Record<string, any>;
  dataYear: Record<string, any>;
  detailMonth?: any;
  dataYearStats?: any;
  sessions?: any[];
  onSelectDate?: (date: Dayjs) => void;
  onChangeViewMode?: (mode: string) => void;
  username?: string;
}

const formatDuration = (val: any): string | null => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    const hours = Math.floor(val / 60);
    const mins = Math.round(val % 60);
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    }
    return `${mins}m`;
  }
  return String(val);
};

export const PokerStatsChart: React.FC<PokerStatsChartProps> = ({
  selectedDate,
  mode: parentMode,
  dataDays,
  dataYear,
  detailMonth,
  dataYearStats,
  sessions = [],
  onSelectDate,
  onChangeViewMode,
  username = '',
}) => {
  const { theme } = useTheme();
  // Allow toggling between month and year view if desired, defaulting to parent mode
  const [internalMode, setInternalMode] = useState<'month' | 'year'>(
    parentMode === 'year' ? 'year' : 'month'
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sync internal mode if parent mode changes
  React.useEffect(() => {
    if (parentMode === 'year' || parentMode === 'month') {
      setInternalMode(parentMode);
    }
  }, [parentMode]);

  const isMonthView = internalMode === 'month';

  // Determine Format and Blind to display in badge
  // const displayFormat = useMemo(() => {
  //   if (sessions.length > 0 && sessions[0]?.format) {
  //     return sessions[0].format;
  //   }
  //   return 'NLHE';
  // }, [sessions]);

  // const displayBlind = useMemo(() => {
  //   if (sessions.length > 0 && sessions[0]?.blind) {
  //     return `$${sessions[0].blind.replace(/^\$/, '')}`;
  //   }
  //   return '$0.02/0.05/0.10';
  // }, [sessions]);

  // Navigate prev/next month or year
  const handlePrev = () => {
    if (!onSelectDate) return;
    const newDate = isMonthView
      ? selectedDate.subtract(1, 'month')
      : selectedDate.subtract(1, 'year');
    onSelectDate(newDate);
  };

  const handleNext = () => {
    if (!onSelectDate) return;
    const newDate = isMonthView
      ? selectedDate.add(1, 'month')
      : selectedDate.add(1, 'year');
    onSelectDate(newDate);
  };

  const handleToggleMode = (newMode: 'month' | 'year') => {
    setInternalMode(newMode);
    if (onChangeViewMode) {
      onChangeViewMode(newMode);
    }
  };

  // Build data points for Month or Year
  const chartData = useMemo(() => {
    if (isMonthView) {
      const daysInMonth = selectedDate.daysInMonth();
      let runningProfit = 0;
      let lastDataDay = 0;

      // First find the last day that has played sessions in this month
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = selectedDate.date(d).format('YYYY-MM-DD');
        const dayInfo = dataDays?.[dateKey];
        if (dayInfo && (dayInfo.hands > 0 || dayInfo.count > 0 || dayInfo.profit !== 0)) {
          lastDataDay = d;
        }
      }

      // If selected date is in the month and greater than lastDataDay, or if current month
      const currentSelectedDay = selectedDate.date();
      const activeCutoffDay = Math.max(lastDataDay, currentSelectedDay);

      const items = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = selectedDate.date(d).format('YYYY-MM-DD');
        const dayInfo = dataDays?.[dateKey];
        const dayProfit = dayInfo?.profit ? Number(dayInfo.profit) : 0;
        const dayHands = dayInfo?.hands ? Number(dayInfo.hands) : 0;
        const count = dayInfo?.count ? Number(dayInfo.count) : 0;
        const winrate = dayInfo?.winrate || null;
        let duration = formatDuration(dayInfo?.duration);

        if (!duration && sessions && sessions.length > 0) {
          const daySessions = sessions.filter((s) => {
            if (!s?.startTime) return false;
            return dayjs(s.startTime).format('YYYY-MM-DD') === dateKey;
          });
          if (daySessions.length > 0) {
            const totalMinutes = daySessions.reduce((acc, s) => {
              if (typeof s.duration === 'number') return acc + s.duration;
              if (s.startTime && s.endTime) {
                const diff = dayjs(s.endTime).diff(dayjs(s.startTime), 'minute');
                return acc + (diff > 0 ? diff : 0);
              }
              return acc;
            }, 0);
            if (totalMinutes > 0) {
              duration = formatDuration(totalMinutes);
            } else if (daySessions[0]?.duration) {
              duration = String(daySessions[0].duration);
            }
          }
        }

        const hasData = !!dayInfo && (dayHands > 0 || count > 0 || dayProfit !== 0);

        // Accumulate profit up to this day
        if (d <= activeCutoffDay) {
          runningProfit += dayProfit;
        }

        items.push({
          index: d,
          label: `${d}`,
          dateKey,
          fullDate: selectedDate.date(d).format('MMM D, YYYY'),
          dayProfit,
          accumulatedProfit: d <= activeCutoffDay ? runningProfit : null,
          hands: dayHands,
          count,
          winrate,
          duration,
          hasData,
          isActiveOrPast: d <= activeCutoffDay,
        });
      }

      return {
        items,
        activeCutoffIndex: activeCutoffDay,
        totalHands: items.reduce((sum, item) => sum + item.hands, 0),
        totalProfit: runningProfit,
        xAxisSuffix: '(Date)',
      };
    } else {
      // YEAR VIEW: 12 months
      let runningProfit = 0;
      let lastDataMonth = 0;

      for (let m = 1; m <= 12; m++) {
        const monthKey = selectedDate.month(m - 1).format('YYYY-MM');
        const monthInfo = dataYear?.[monthKey];
        if (monthInfo && (monthInfo.hands > 0 || monthInfo.count > 0 || monthInfo.profit !== 0)) {
          lastDataMonth = m;
        }
      }

      const activeCutoffMonth = Math.max(lastDataMonth, selectedDate.month() + 1);

      const items = [];
      for (let m = 1; m <= 12; m++) {
        const monthKey = selectedDate.month(m - 1).format('YYYY-MM');
        const monthInfo = dataYear?.[monthKey];
        const monthProfit = monthInfo?.profit ? Number(monthInfo.profit) : 0;
        const monthHands = monthInfo?.hands ? Number(monthInfo.hands) : 0;
        const count = monthInfo?.count ? Number(monthInfo.count) : 0;
        const winrate = monthInfo?.winrate || null;
        const duration = formatDuration(monthInfo?.duration);
        const hasData = !!monthInfo && (monthHands > 0 || count > 0 || monthProfit !== 0);

        if (m <= activeCutoffMonth) {
          runningProfit += monthProfit;
        }

        items.push({
          index: m,
          label: `${m}`,
          dateKey: monthKey,
          fullDate: selectedDate.month(m - 1).format('MMMM YYYY'),
          dayProfit: monthProfit,
          accumulatedProfit: m <= activeCutoffMonth ? runningProfit : null,
          hands: monthHands,
          count,
          winrate,
          duration,
          hasData,
          isActiveOrPast: m <= activeCutoffMonth,
        });
      }

      return {
        items,
        activeCutoffIndex: activeCutoffMonth,
        totalHands: items.reduce((sum, item) => sum + item.hands, 0),
        totalProfit: runningProfit,
        xAxisSuffix: '(Month)',
      };
    }
  }, [isMonthView, selectedDate, dataDays, dataYear, sessions]);

  // SVG Dimensions & Calculation
  const width = 1000;
  const height = 360;
  const paddingLeft = 45;
  const paddingRight = 75;
  const paddingTop = 35;
  const paddingBottom = 40;

  const chartInnerWidth = width - paddingLeft - paddingRight;
  const chartInnerHeight = height - paddingTop - paddingBottom;

  // Calculate profit scale (Right Y Axis)
  const { minProfit, maxProfit, yTicks, stepProfit } = useMemo(() => {
    const validAccProfits = chartData.items
      .map((i) => i.accumulatedProfit)
      .filter((v): v is number => v !== null);

    let min = 0;
    let max = 1500;

    if (validAccProfits.length > 0) {
      const minVal = Math.min(...validAccProfits);
      const maxVal = Math.max(...validAccProfits);
      min = Math.min(0, minVal);
      max = Math.max(600, maxVal);
    }

    // Determine nice step
    const range = max - min || 1000;
    let step = 250;
    if (range > 8000) step = 2000;
    else if (range > 4000) step = 1000;
    else if (range > 2000) step = 500;
    else if (range > 1000) step = 250;
    else if (range > 800) step = 100;
    else step = 50;
    console.log('step', step);
    console.log('max', max);
    console.log('min', min);
    console.log('range', range);


    const roundedMin = Math.floor(min / step) * step;
    let roundedMax = Math.ceil(max / step) * step;
    if (roundedMax === roundedMin) {
      roundedMax = roundedMin + step * 5;
    }
    // Make sure we have at least 5 intervals
    while ((roundedMax - roundedMin) / step < 4) {
      roundedMax += step;
    }

    const ticks = [];
    for (let val = roundedMin; val <= roundedMax; val += step) {
      ticks.push(val);
    }

    return {
      minProfit: roundedMin,
      maxProfit: roundedMax,
      yTicks: ticks,
      stepProfit: step,
    };
  }, [chartData]);

  // Calculate hands scale (Left/Bar height)
  const maxHands = useMemo(() => {
    const handsList = chartData.items.map((i) => i.hands);
    const maxVal = Math.max(...handsList, 0);
    return maxVal > 0 ? maxVal * 1.25 : 3000; // Leave 25% headspace
  }, [chartData]);

  // Coordinate helper functions
  const getX = (index: number) => {
    const total = chartData.items.length;
    if (total <= 1) return paddingLeft + chartInnerWidth / 2;
    return paddingLeft + ((index - 1) / (total - 1)) * chartInnerWidth;
  };

  const getYProfit = (val: number) => {
    const ratio = (val - minProfit) / (maxProfit - minProfit);
    return height - paddingBottom - ratio * chartInnerHeight;
  };

  // Line path for accumulated profit
  const { linePoints, linePath } = useMemo(() => {
    const activeItems = chartData.items.filter(
      (item) => item.accumulatedProfit !== null
    );

    if (activeItems.length === 0) {
      return { linePoints: [], linePath: '' };
    }

    const points = activeItems.map((item) => ({
      x: getX(item.index),
      y: getYProfit(item.accumulatedProfit!),
      ...item,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    return { linePoints: points, linePath: path };
  }, [chartData, minProfit, maxProfit]);

  // Active cut-off X position
  const activeCutoffX = chartData.activeCutoffIndex
    ? getX(chartData.activeCutoffIndex)
    : width - paddingRight;

  // Active day / month label
  const headerDateTitle = isMonthView
    ? selectedDate.format('MMMM YYYY')
    : selectedDate.format('YYYY');

  // Bar width
  const barWidth = isMonthView ? 16 : 30;

  // Format currency
  const formatProfit = (val: number) => {
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const formatted = absVal.toLocaleString('en-US');
    return isNeg ? `-$${formatted}` : `$${formatted}`;
  };

  return (
    <div className={cx('poker-stats-chart-card', theme === 'dark' ? 'dark-mode' : 'light-mode')}>
      {/* HEADER SECTION */}
      <div className="poker-chart-header">
        <div className="header-left">
          <button
            onClick={handlePrev}
            className="poker-nav-btn"
            title={isMonthView ? 'Previous month' : 'Previous year'}
          >
            <ChevronLeft size={19} />
          </button>

          <h2 className="poker-chart-title">
            <span className="user-name">{username}</span>
            <span className="separator">—</span>
            <span className="date-title">{headerDateTitle}</span>
          </h2>

          <button
            onClick={handleNext}
            className="poker-nav-btn mr-2"
            title={isMonthView ? 'Next month' : 'Next year'}
          >
            <ChevronRight size={19} />
          </button>

          {/* Tag for Game Type & Stakes */}
          {/* <div className="poker-game-badge">
            <span className="game-type">{displayFormat}</span>
            <span className="game-blind">{displayBlind}</span>
          </div> */}

          {/* Quick View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={cx('mode-btn', isMonthView && 'active')}
              onClick={() => handleToggleMode('month')}
            >
              Month
            </button>
            <button
              className={cx('mode-btn', !isMonthView && 'active')}
              onClick={() => handleToggleMode('year')}
            >
              Year
            </button>
          </div>
        </div>

        {/* Legend / Metrics on the right */}
        <div className="header-right">
          {/* Accumulated Profit */}
          <div className="metric-pill profit-metric">
            <div className="metric-icon line-icon">
              <span className="icon-line" />
              <span className="icon-circle" />
              <span className="icon-line" />
            </div>
            <span className="metric-label">Accumulated Profit</span>
            <span className="metric-val">{formatProfit(chartData.totalProfit)}</span>
          </div>

          {/* Total Hands */}
          <div className="metric-pill hands-metric">
            <div className="metric-icon bars-icon">
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </div>
            <span className="metric-label">Hands</span>
            <span className="metric-val">{chartData.totalHands.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* SVG CHART SECTION */}
      <div className="poker-chart-body">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="poker-chart-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Bar gradient: subtle elegant purple/indigo */}
            <linearGradient id="pokerBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="pokerBarHoverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.45" />
            </linearGradient>

            {/* Glowing gold filter for the profit line */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* HORIZONTAL GRID LINES & RIGHT Y-AXIS LABELS */}
          {yTicks.map((val) => {
            const y = getYProfit(val);
            return (
              <g key={`grid-${val}`} className="grid-row">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="3 4"
                  strokeWidth="1"
                />
                <text
                  x={width - paddingRight + 12}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="inherit"
                  textAnchor="start"
                  className="y-axis-label"
                >
                  {formatProfit(val)}
                </text>
              </g>
            );
          })}

          {/* VERTICAL DOTTED GUIDE LINES FOR EACH COLUMN */}
          {chartData.items.map((item) => {
            const x = getX(item.index);
            return (
              <line
                key={`vgrid-${item.index}`}
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={height - paddingBottom}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeDasharray="2 3"
                strokeWidth="1"
              />
            );
          })}

          {/* FUTURE DAYS CURTAIN (DARKER SHADED OVERLAY LIKE IN SCREENSHOT) */}
          {chartData.activeCutoffIndex < chartData.items.length && (
            <>
              <rect
                x={activeCutoffX}
                y={paddingTop}
                width={width - paddingRight - activeCutoffX}
                height={chartInnerHeight}
                fill="rgba(0, 0, 0, 0.32)"
                className="future-curtain"
              />
              <line
                x1={activeCutoffX}
                y1={paddingTop}
                x2={activeCutoffX}
                y2={height - paddingBottom}
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="1.2"
                strokeDasharray="none"
              />
            </>
          )}

          {/* HANDS BARS (PURPLE COLUMNS) */}
          {chartData.items.map((item) => {
            if (item.hands <= 0) return null;
            const x = getX(item.index);
            const barH = (item.hands / maxHands) * (chartInnerHeight * 0.85);
            const barY = height - paddingBottom - barH;
            const isHovered = hoveredIndex === item.index;

            return (
              <rect
                key={`bar-${item.index}`}
                x={x - barWidth / 2}
                y={barY}
                width={barWidth}
                height={barH}
                rx={3}
                ry={3}
                fill={isHovered ? 'url(#pokerBarHoverGradient)' : 'url(#pokerBarGradient)'}
                className="hand-bar"
              />
            );
          })}

          {/* ACCUMULATED PROFIT LINE (GOLD / WHEAT WITH NODES) */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#e6c17b"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#goldGlow)"
              className="profit-line"
            />
          )}

          {/* LINE POINTS (CIRCLES) */}
          {linePoints.map((pt) => {
            const isLatest = pt.index === chartData.activeCutoffIndex;
            const isHovered = hoveredIndex === pt.index;

            return (
              <circle
                key={`pt-${pt.index}`}
                cx={pt.x}
                cy={pt.y}
                r={isLatest ? 4.5 : isHovered ? 4.5 : 3.2}
                fill={isLatest ? '#fef08a' : '#141628'}
                stroke="#e6c17b"
                strokeWidth={isLatest ? '2.5' : '2'}
                className="profit-point"
              />
            );
          })}

          {/* X-AXIS LABELS */}
          {chartData.items.map((item) => {
            const x = getX(item.index);
            const isCutoff = item.index === chartData.activeCutoffIndex;
            const isLast = item.index === chartData.items.length;

            return (
              <g key={`xlabel-${item.index}`}>
                <text
                  x={x}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  fill={isCutoff ? '#fef08a' : '#64748b'}
                  fontWeight={isCutoff ? 'bold' : 'normal'}
                  fontSize={isCutoff ? '12' : '11'}
                  fontFamily="inherit"
                  className={cx('x-axis-text', isCutoff && 'active-day-label')}
                >
                  {item.label}
                </text>

                {/* Suffix like '(Date)' or '(Month)' on right */}
                {/* {isLast && (
                  <text
                    x={x + 24}
                    y={height - paddingBottom + 20}
                    textAnchor="start"
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="inherit"
                    className="x-axis-suffix"
                  >
                    {chartData.xAxisSuffix}
                  </text>
                )} */}
              </g>
            );
          })}

          {/* INVISIBLE HOVER CAPTURE ZONES PER COLUMN */}
          {chartData.items.map((item) => {
            const x = getX(item.index);
            const stepW = chartInnerWidth / (chartData.items.length - 1 || 1);
            return (
              <rect
                key={`hover-${item.index}`}
                x={x - stepW / 2}
                y={paddingTop}
                width={stepW}
                height={chartInnerHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(item.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (onSelectDate) {
                    if (isMonthView) {
                      onSelectDate(selectedDate.date(item.index));
                    } else {
                      onSelectDate(selectedDate.month(item.index - 1));
                    }
                  }
                }}
              />
            );
          })}
        </svg>

        {/* FLOATING HOVER TOOLTIP */}
        {hoveredIndex !== null && (
          (() => {
            const item = chartData.items.find((i) => i.index === hoveredIndex);
            if (!item) return null;
            const x = getX(item.index);
            const leftPct = (x / width) * 100;

            return (
              <div
                className="poker-chart-tooltip"
                style={{
                  left: `${leftPct}%`,
                  transform: leftPct > 75 ? 'translateX(-100%)' : leftPct < 25 ? 'translateX(0%)' : 'translateX(-50%)',
                }}
              >
                <div className="tooltip-header">{item.fullDate}</div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Profit:</span>
                  <span className={cx('tooltip-val', item.dayProfit >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatProfit(item.dayProfit)}
                  </span>
                </div>
                {item.accumulatedProfit !== null && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">Accumulated:</span>
                    <span className="tooltip-val text-yellow-300">
                      {formatProfit(item.accumulatedProfit)}
                    </span>
                  </div>
                )}
                <div className="tooltip-row">
                  <span className="tooltip-label">Hands:</span>
                  <span className="tooltip-val text-indigo-300">
                    {item.hands.toLocaleString()}
                  </span>
                </div>
                {item.count > 0 && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">Sessions:</span>
                    <span className="tooltip-val text-slate-200">{item.count}</span>
                  </div>
                )}
                {item.duration && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">Duration:</span>
                    <span className="tooltip-val text-cyan-300">{item.duration}</span>
                  </div>
                )}
                {item.winrate && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">Winrate:</span>
                    <span className="tooltip-val text-blue-300">{item.winrate}</span>
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default PokerStatsChart;
