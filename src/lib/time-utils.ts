/**
 * Time formatting and calculation utilities
 */

export interface FormattedDuration {
  hours: number;
  minutes: number;
  seconds: number;
  display: string;       // "8h 42m 17s"
  displayShort: string;  // "8:42:17"
  totalSeconds: number;
  totalMinutes: number;
}

/**
 * Format seconds into a human-readable duration
 */
export function formatDuration(totalSeconds: number): FormattedDuration {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  let display = '';
  if (h > 0) display += `${h}h `;
  if (m > 0 || h > 0) display += `${m}m `;
  display += `${s}s`;
  display = display.trim();

  const displayShort = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;

  return {
    hours: h,
    minutes: m,
    seconds: s,
    display: display || '0s',
    displayShort,
    totalSeconds,
    totalMinutes: Math.ceil(totalSeconds / 60),
  };
}

/**
 * Calculate adjusted duration at a given playback speed
 */
export function adjustedDuration(seconds: number, speed: number): number {
  if (speed <= 0) return seconds;
  return Math.round(seconds / speed);
}

/**
 * Calculate time saved at a given speed vs 1x
 */
export function timeSaved(originalSeconds: number, speed: number): number {
  return originalSeconds - adjustedDuration(originalSeconds, speed);
}

export interface SpeedComparison {
  speed: number;
  duration: FormattedDuration;
  saved: FormattedDuration;
  savedPercent: number;
}

export const DEFAULT_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3];

/**
 * Build a speed comparison table
 */
export function buildSpeedTable(totalSeconds: number, speeds = DEFAULT_SPEEDS): SpeedComparison[] {
  return speeds.map((speed) => {
    const adjusted = adjustedDuration(totalSeconds, speed);
    const saved = timeSaved(totalSeconds, speed);
    return {
      speed,
      duration: formatDuration(adjusted),
      saved: formatDuration(Math.abs(saved)),
      savedPercent: speed >= 1 ? Math.round((1 - 1 / speed) * 100) : 0,
    };
  });
}

/**
 * Watch planner: calculate finish date given daily budget
 */
export interface WatchPlanResult {
  totalSeconds: number;
  dailyMinutes: number;
  speed: number;
  daysNeeded: number;
  finishDate: string;       // ISO date string
  finishDateFormatted: string; // "Monday, Jan 12, 2026"
  hoursPerDay: number;
  minutesRemainingPerDay: number;
}

export function calculateWatchPlan(
  totalSeconds: number,
  dailyMinutes: number,
  speed: number,
  startDate = new Date()
): WatchPlanResult {
  const adjustedTotal = adjustedDuration(totalSeconds, speed);
  const dailySeconds = dailyMinutes * 60;
  const daysNeeded = dailySeconds > 0 ? Math.ceil(adjustedTotal / dailySeconds) : 0;

  const finish = new Date(startDate);
  finish.setDate(finish.getDate() + daysNeeded);

  const finishDateFormatted = finish.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    totalSeconds: adjustedTotal,
    dailyMinutes,
    speed,
    daysNeeded,
    finishDate: finish.toISOString().split('T')[0],
    finishDateFormatted,
    hoursPerDay: Math.floor(dailyMinutes / 60),
    minutesRemainingPerDay: dailyMinutes % 60,
  };
}

/**
 * Finish-by calculator: given a target date, calculate required daily budget
 */
export interface FinishByResult {
  targetDate: string;
  daysAvailable: number;
  requiredDailyMinutes: number;
  requiredDailyFormatted: string;
  requiredSpeed?: number;
  feasible: boolean;
}

export function calculateFinishBy(
  totalSeconds: number,
  targetDate: Date,
  speed: number,
  startDate = new Date()
): FinishByResult {
  const adjustedTotal = adjustedDuration(totalSeconds, speed);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysAvailable = Math.max(1, Math.ceil((targetDate.getTime() - startDate.getTime()) / msPerDay));
  const secondsPerDay = adjustedTotal / daysAvailable;
  const requiredDailyMinutes = Math.ceil(secondsPerDay / 60);
  const feasible = requiredDailyMinutes <= 24 * 60; // Less than 24h per day

  const h = Math.floor(requiredDailyMinutes / 60);
  const m = requiredDailyMinutes % 60;
  const requiredDailyFormatted = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return {
    targetDate: targetDate.toISOString().split('T')[0],
    daysAvailable,
    requiredDailyMinutes,
    requiredDailyFormatted,
    feasible,
  };
}

/**
 * Describe what portion of a video set a range covers
 */
export function describeRange(start: number, end: number, total: number): string {
  const count = Math.min(end, total) - Math.max(1, start) + 1;
  return `videos ${start}–${Math.min(end, total)} (${count} of ${total})`;
}
