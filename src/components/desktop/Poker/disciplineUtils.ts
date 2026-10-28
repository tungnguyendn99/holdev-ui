import dayjs, { Dayjs } from 'dayjs';

export interface DailyPlanConfig {
  plannedVolume: number; // e.g. 1500
  plannedMinutes: number; // e.g. 300 (5 hours)
  plannedTimeStr: string; // e.g. '5h'
}

export const DEFAULT_DAILY_PLAN: DailyPlanConfig = {
  plannedVolume: 1500,
  plannedMinutes: 300,
  plannedTimeStr: '5h',
};

export const getDailyPlanConfig = (): DailyPlanConfig => {
  if (typeof window === 'undefined') return DEFAULT_DAILY_PLAN;
  try {
    const saved = localStorage.getItem('poker_daily_plan');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.plannedVolume && parsed.plannedMinutes) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading poker_daily_plan', e);
  }
  return DEFAULT_DAILY_PLAN;
};

export const setDailyPlanConfig = (config: Partial<DailyPlanConfig>) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getDailyPlanConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('poker_daily_plan', JSON.stringify(updated));
    window.dispatchEvent(new Event('poker_daily_plan_updated'));
  } catch (e) {
    console.error('Error saving poker_daily_plan', e);
  }
};

/**
 * Parses duration value to integer minutes.
 * Accepts:
 * - number (already in minutes)
 * - string like "5h", "4h 30m", "45m", "02:30"
 * - startTime and endTime timestamps to calculate difference
 */
export const parseDurationToMinutes = (
  val: any,
  startTime?: any,
  endTime?: any,
): number => {
  if (typeof val === 'number' && !isNaN(val)) {
    return val;
  }

  if (startTime && endTime) {
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    if (start.isValid() && end.isValid()) {
      const diff = end.diff(start, 'minute');
      if (diff > 0) return diff;
    }
  }

  if (typeof val === 'string' && val.trim() !== '') {
    const clean = val.trim();
    let total = 0;
    const hMatch = clean.match(/(\d+(?:\.\d+)?)\s*h/i);
    const mMatch = clean.match(/(\d+)\s*m/i);

    if (hMatch) {
      total += parseFloat(hMatch[1]) * 60;
    }
    if (mMatch) {
      total += parseInt(mMatch[1], 10);
    }
    if (total > 0) return Math.round(total);

    if (clean.includes(':')) {
      const parts = clean.split(':');
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
      }
    }

    const num = Number(clean);
    if (!isNaN(num) && num > 0) return Math.round(num);
  }

  return 0;
};

export const formatMinutesToDisplay = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export interface DayEvaluation {
  dateKey: string;
  hands: number;
  durationMinutes: number;
  durationDisplay: string;
  profit: number;
  sessionsCount: number;
  avgRating: number;
  hasGrinded: boolean;
  isCompleted: boolean;
  handsProgress: number;
  timeProgress: number;
  overallProgress: number;
  isQuitEarlyWinning: boolean;
  isChasingLoss: boolean;
  statusText: string;
  alertType: 'success' | 'warning_win' | 'warning_loss' | 'incomplete' | 'rest';
  alertTitle: string;
  alertMessage: string;
  advice: string;
}

/**
 * Evaluates a single day against the daily plan.
 * Rule: nếu hands hoặc duration < value kế hoạch đã đề ra => ngày đó chưa hoàn thành theo kế hoạch.
 */
export const evaluateDayPlan = (
  dateKey: string,
  dayData: any,
  daySessions: any[] = [],
  planConfig: DailyPlanConfig = DEFAULT_DAILY_PLAN,
): DayEvaluation => {
  const { plannedVolume, plannedMinutes } = planConfig;

  // Aggregate hands
  let hands = 0;
  if (daySessions && daySessions.length > 0) {
    hands = daySessions.reduce((acc, s) => acc + (Number(s.hands) || 0), 0);
  } else if (dayData?.hands !== undefined) {
    hands = Number(dayData.hands) || 0;
  }

  // Aggregate duration
  let durationMinutes = 0;
  if (daySessions && daySessions.length > 0) {
    durationMinutes = daySessions.reduce((acc, s) => {
      const mins = parseDurationToMinutes(s.duration, s.startTime, s.endTime);
      return acc + mins;
    }, 0);
  } else if (dayData?.duration) {
    durationMinutes = parseDurationToMinutes(dayData.duration);
  }

  // Aggregate profit
  let profit = 0;
  if (daySessions && daySessions.length > 0) {
    profit = daySessions.reduce((acc, s) => acc + (Number(s.result) || 0), 0);
  } else if (dayData?.profit !== undefined) {
    profit = Number(dayData.profit) || 0;
  }

  // Sessions count
  const sessionsCount =
    daySessions && daySessions.length > 0
      ? daySessions.length
      : Number(dayData?.count) || 0;

  // Avg rating
  let avgRating = 0;
  if (daySessions && daySessions.length > 0) {
    const validRatings = daySessions.filter((s) => Number(s.rating) > 0);
    if (validRatings.length > 0) {
      avgRating =
        validRatings.reduce((acc, s) => acc + Number(s.rating), 0) /
        validRatings.length;
    }
  }

  const hasGrinded = sessionsCount > 0 || hands > 0 || durationMinutes > 0;
  const isCompleted =
    hasGrinded && hands >= plannedVolume && durationMinutes >= plannedMinutes;

  const handsProgress = Math.min(
    100,
    Math.round((hands / (plannedVolume || 1)) * 100),
  );
  const timeProgress = Math.min(
    100,
    Math.round((durationMinutes / (plannedMinutes || 1)) * 100),
  );
  const overallProgress = Math.min(
    100,
    Math.round(((handsProgress + timeProgress) / 2)),
  );

  // Behavioral leaks detection
  // 1. Quit early while winning: Ended early (< planned hands or < planned duration) despite having positive profit
  const isQuitEarlyWinning =
    hasGrinded && profit > 0 && !isCompleted;

  // 2. Chasing losses / over-grind: In the red (< 0) and grinded past planned time (+15% margin) or huge hands

  const isChasingLoss =
    hasGrinded &&
    profit < 0 &&
    (durationMinutes > plannedMinutes * 1.15 || hands > plannedVolume * 1.2);

  let alertType: 'success' | 'warning_win' | 'warning_loss' | 'incomplete' | 'rest' =
    'rest';
  let alertTitle = '';
  let alertMessage = '';
  let advice = '';
  let statusText = 'Chưa có session';

  if (!hasGrinded) {
    alertType = 'rest';
    statusText = 'Rest Day / Không có Session';
    alertTitle = 'Ngày nghỉ hoặc chưa có session';
    alertMessage =
      'Chưa có dữ liệu session nào được ghi nhận cho ngày này. Hãy hoàn thành pre-checklist ở Today’s Mission trước khi bắt đầu grind.';
    advice = 'Xác định rõ thời gian và volume trước khi ngồi vào bàn.';
  } else if (isCompleted) {
    alertType = 'success';
    statusText = 'Hoàn thành kế hoạch';
    alertTitle = 'Tuyệt vời! Đạt 100% kỷ luật kế hoạch ngày';
    alertMessage = `Bạn đã hoàn thành đủ ${hands.toLocaleString()} hands (kế hoạch ${plannedVolume.toLocaleString()}) và ${formatMinutesToDisplay(durationMinutes)} grind time (kế hoạch ${formatMinutesToDisplay(plannedMinutes)}).`;
    advice =
      'Duy trì sự ổn định này. Chất lượng ra quyết định và quy trình grind dài hạn sẽ đưa bạn đến chiến thắng bền vững.';
  } else if (isQuitEarlyWinning) {
    alertType = 'warning_win';
    statusText = 'Chưa hoàn thành — Dừng sớm khi Win';
    alertTitle = 'Cảnh báo Leak: Dừng sớm để bảo toàn chiến thắng (Lock Win)';
    alertMessage = `Bạn đang có lợi nhuận +$${profit.toLocaleString()} nhưng đã dừng chơi khi mới đạt ${hands.toLocaleString()}/${plannedVolume.toLocaleString()} hands và ${formatMinutesToDisplay(durationMinutes)}/${formatMinutesToDisplay(plannedMinutes)}.`;
    advice =
      '“Being up is not a reason to stop. Thắng không phải lý do để kết thúc ngày sớm nếu bạn vẫn đang chơi A-game. Đánh giá quyết định dừng dựa trên sự tập trung và năng lượng, không dựa trên profit ngắn hạn.”';
  } else if (isChasingLoss) {
    alertType = 'warning_loss';
    statusText = 'Chưa hoàn thành — Cố gỡ khi Thua';
    alertTitle = 'Cảnh báo Leak: Kéo dài session khi đang thua (Chasing Losses)';
    alertMessage = `Bạn đang âm -$${Math.abs(profit).toLocaleString()} và đã kéo dài thời gian grind lên ${formatMinutesToDisplay(durationMinutes)} (vượt mức kế hoạch ${formatMinutesToDisplay(plannedMinutes)}).`;
    advice =
      '“Losing is not a signal to grind harder. Tiền đã mất không thuộc về ván tiếp theo. Hãy dừng lại theo đúng kế hoạch để bảo vệ tâm lý và chất lượng ra quyết định.”';
  } else {
    alertType = 'incomplete';
    statusText = 'Chưa hoàn thành kế hoạch';
    alertTitle = 'Cảnh báo: Ngày chưa đạt đủ khối lượng kế hoạch';
    const missingHands = Math.max(0, plannedVolume - hands);
    const missingMins = Math.max(0, plannedMinutes - durationMinutes);
    alertMessage = `Bạn chưa đạt tiêu chuẩn kế hoạch: ${missingHands > 0 ? `Còn thiếu ${missingHands.toLocaleString()} hands` : ''
      }${missingHands > 0 && missingMins > 0 ? ' và ' : ''}${missingMins > 0 ? `thiếu ${formatMinutesToDisplay(missingMins)} thời lượng` : ''
      }.`;
    advice =
      'Đánh giá lại: Bạn dừng sớm do mệt mỏi, mất tập trung (đúng đắn) hay do thiếu kỷ luật thực thi? Hãy giữ nguyên kế hoạch vào ngày tiếp theo.';
  }

  return {
    dateKey,
    hands,
    durationMinutes,
    durationDisplay: formatMinutesToDisplay(durationMinutes),
    profit,
    sessionsCount,
    avgRating,
    hasGrinded,
    isCompleted,
    handsProgress,
    timeProgress,
    overallProgress,
    isQuitEarlyWinning,
    isChasingLoss,
    statusText,
    alertType,
    alertTitle,
    alertMessage,
    advice,
  };
};

export interface DisciplineOverview {
  totalGrindDays: number;
  completedDays: number;
  adherenceRate: number; // 0 - 100 %
  disciplineScore: number; // 0 - 100
  scoreGrade: {
    letter: string;
    label: string;
    color: string;
    badgeClass: string;
  };
  totalHands: number;
  totalDurationMinutes: number;
  totalDurationDisplay: string;
  totalProfit: number;
  quitEarlyWinningCount: number;
  chasingLossCount: number;
  sampleDaysCount: number;
  sampleQuitEarlyCount: number;
  sampleChasingLossCount: number;
  recentDaysEvaluations: DayEvaluation[];
  isLowAdherence: boolean;
  behaviorPatternDetected: boolean;
  behaviorAlertMessage: string;
  behaviorAlertSuggestion: string;
  behaviorAlertDisclaimer: string;
}

/**
 * Calculates overall discipline metrics across sessions and dataDays.
 * Formula:
 * Adherence = (Số ngày tuân thủ kế hoạch / tổng ngày đã grind) * 100%
 */
export const calculateDisciplineOverview = (
  dataDays: Record<string, any> = {},
  sessions: any[] = [],
  planConfig: DailyPlanConfig = DEFAULT_DAILY_PLAN,
  sampleWindowDays: number = 8,
): DisciplineOverview => {
  // Map all sessions by day
  const sessionsByDay: Record<string, any[]> = {};
  sessions.forEach((s) => {
    if (s?.startTime) {
      const date = dayjs(s.startTime).format('YYYY-MM-DD');
      if (!sessionsByDay[date]) sessionsByDay[date] = [];
      sessionsByDay[date].push(s);
    }
  });

  // Combine unique dates from dataDays and sessions
  const allDateKeys = Array.from(
    new Set([...Object.keys(dataDays), ...Object.keys(sessionsByDay)]),
  ).sort();

  const dailyEvals: DayEvaluation[] = [];

  allDateKeys.forEach((dateKey) => {
    const dayData = dataDays[dateKey];
    const daySessions = sessionsByDay[dateKey] || [];
    const evaluation = evaluateDayPlan(
      dateKey,
      dayData,
      daySessions,
      planConfig,
    );

    // Only count days where the user actually grinded
    if (evaluation.hasGrinded) {
      dailyEvals.push(evaluation);
    }
  });

  const totalGrindDays = dailyEvals.length;
  const completedDays = dailyEvals.filter((d) => d.isCompleted).length;
  const adherenceRate =
    totalGrindDays > 0 ? Math.round((completedDays / totalGrindDays) * 100) : 0;

  const totalHands = dailyEvals.reduce((acc, d) => acc + d.hands, 0);
  const totalDurationMinutes = dailyEvals.reduce(
    (acc, d) => acc + d.durationMinutes,
    0,
  );
  const totalProfit = dailyEvals.reduce((acc, d) => acc + d.profit, 0);

  const quitEarlyWinningCount = dailyEvals.filter(
    (d) => d.isQuitEarlyWinning,
  ).length;
  const chasingLossCount = dailyEvals.filter((d) => d.isChasingLoss).length;

  // Window for behavior alerts (e.g. recent 8 grind days)
  const recentSlice = dailyEvals.slice(-sampleWindowDays);
  const sampleDaysCount = recentSlice.length;
  const sampleQuitEarlyCount = recentSlice.filter(
    (d) => d.isQuitEarlyWinning,
  ).length;
  const sampleChasingLossCount = recentSlice.filter(
    (d) => d.isChasingLoss,
  ).length;

  // Discipline Score calculation (0 - 100)
  // Base adherence: 70% weight
  // Average Rating: 20% weight
  // Behavioral Leak deductions: 10% weight
  const validRatings = dailyEvals.filter((d) => d.avgRating > 0);
  const avgRatingOverall =
    validRatings.length > 0
      ? validRatings.reduce((acc, d) => acc + d.avgRating, 0) /
      validRatings.length
      : 4.0; // fallback to good rating if not rated

  const adherencePart = adherenceRate * 0.7;
  const ratingPart = (avgRatingOverall / 5) * 20;
  const leakPenalty = (quitEarlyWinningCount * 3 + chasingLossCount * 3);
  const mindsetPart = Math.max(0, 10 - leakPenalty);

  let disciplineScore = 100;
  if (totalGrindDays > 0) {
    disciplineScore = Math.min(
      100,
      Math.max(0, Math.round(adherencePart + ratingPart + mindsetPart)),
    );
  }

  // Score grade
  let scoreGrade = {
    letter: 'S',
    label: 'Kỷ luật thép (Master)',
    color: '#10b981',
    badgeClass: 'grade-s',
  };

  if (disciplineScore >= 90) {
    scoreGrade = {
      letter: 'A+',
      label: 'Kỷ luật xuất sắc (Elite)',
      color: '#10b981',
      badgeClass: 'grade-aplus',
    };
  } else if (disciplineScore >= 80) {
    scoreGrade = {
      letter: 'A',
      label: 'Vững vàng (A-Game Solid)',
      color: '#3b82f6',
      badgeClass: 'grade-a',
    };
  } else if (disciplineScore >= 70) {
    scoreGrade = {
      letter: 'B',
      label: 'Khá (Cần siết kỷ luật)',
      color: '#8b5cf6',
      badgeClass: 'grade-b',
    };
  } else if (disciplineScore >= 50) {
    scoreGrade = {
      letter: 'C',
      label: 'Cảnh báo rò rỉ (Leaking)',
      color: '#f59e0b',
      badgeClass: 'grade-c',
    };
  } else {
    scoreGrade = {
      letter: 'D',
      label: 'Nguy hiểm (Critical Risk)',
      color: '#ef4444',
      badgeClass: 'grade-d',
    };
  }

  const isLowAdherence = totalGrindDays >= 3 && adherenceRate < 70;
  const behaviorPatternDetected =
    sampleQuitEarlyCount > 0 || sampleChasingLossCount > 0;

  const behaviorAlertMessage =
    sampleDaysCount > 0
      ? `Trong ${sampleDaysCount} ngày gần nhất, bạn đã kết thúc sớm ${sampleQuitEarlyCount} lần khi đang winning, và kéo dài ${sampleChasingLossCount} lần khi đang losing.`
      : '';

  const behaviorAlertSuggestion =
    'Giữ nguyên kế hoạch ở ngày tiếp theo. Đánh giá lại quyết định dừng dựa trên chất lượng chơi, không dựa trên profit.';

  const behaviorAlertDisclaimer =
    'Cảnh báo này không nên mặc định kết luận mọi lần dừng sớm đều là sai. Nếu bạn mệt, mất tập trung hoặc bắt đầu tilt, dừng chơi có thể là quyết định đúng.';

  return {
    totalGrindDays,
    completedDays,
    adherenceRate,
    disciplineScore,
    scoreGrade,
    totalHands,
    totalDurationMinutes,
    totalDurationDisplay: formatMinutesToDisplay(totalDurationMinutes),
    totalProfit,
    quitEarlyWinningCount,
    chasingLossCount,
    sampleDaysCount,
    sampleQuitEarlyCount,
    sampleChasingLossCount,
    recentDaysEvaluations: dailyEvals.slice(-14), // Last 14 grind days
    isLowAdherence,
    behaviorPatternDetected,
    behaviorAlertMessage,
    behaviorAlertSuggestion,
    behaviorAlertDisclaimer,
  };
};
