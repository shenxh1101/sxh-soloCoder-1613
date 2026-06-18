const pad = (n: number): string => n.toString().padStart(2, '0');

const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

export const formatDate = (date: Date | string): string => {
  const d = parseDate(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDateTime = (date: Date | string): string => {
  const d = parseDate(date);
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatTimeOnly = (timeStr: string): string => {
  if (!timeStr) return '';
  
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  try {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  } catch (e) {
    // ignore
  }
  
  return '';
};

export const getWeekDates = (baseDate?: Date | string): string[] => {
  const base = baseDate ? parseDate(baseDate) : new Date();
  const day = base.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
};

export const getDayName = (dayOfWeek: number): string => {
  const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return names[dayOfWeek] || '';
};

export const isToday = (dateStr: string): boolean => {
  return formatDate(new Date()) === dateStr;
};

export const isThisWeek = (dateStr: string): boolean => {
  const weekDates = getWeekDates();
  return weekDates.includes(dateStr);
};

export const getDayOfMonth = (dateStr: string): number => {
  const d = parseDate(dateStr);
  return d.getDate();
};

export const getExerciseDayLabel = (exercise: { dayOfWeek?: number; dayOfMonth?: number }, cycleType: 'weekly' | 'monthly'): string => {
  if (cycleType === 'weekly' && exercise.dayOfWeek !== undefined) {
    return getDayName(exercise.dayOfWeek);
  }
  if (cycleType === 'monthly' && exercise.dayOfMonth !== undefined) {
    return `每月${exercise.dayOfMonth}日`;
  }
  return '';
};

export const isExerciseOnDate = (
  exercise: { dayOfWeek?: number; dayOfMonth?: number },
  cycleType: 'weekly' | 'monthly',
  dateStr: string
): boolean => {
  if (cycleType === 'weekly' && exercise.dayOfWeek !== undefined) {
    const weekDates = getWeekDates(dateStr);
    const dayIndex = weekDates.indexOf(dateStr);
    return dayIndex === exercise.dayOfWeek;
  }
  if (cycleType === 'monthly' && exercise.dayOfMonth !== undefined) {
    return getDayOfMonth(dateStr) === exercise.dayOfMonth;
  }
  return false;
};

export const isDateInRange = (
  dateStr: string,
  startDate: string,
  endDate: string
): boolean => {
  const d = new Date(dateStr);
  const s = new Date(startDate);
  const e = new Date(endDate);
  return d >= s && d <= e;
};

export const getExpectedExercisesForDate = (
  memberId: string,
  dateStr: string,
  plans: Array<{
    id: string;
    memberId: string;
    cycleType: 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    exercises: Array<{ id: string; dayOfWeek?: number; dayOfMonth?: number }>;
  }>
): Array<{ planId: string; exerciseId: string }> => {
  const result: Array<{ planId: string; exerciseId: string }> = [];
  plans
    .filter((p) => p.memberId === memberId)
    .forEach((plan) => {
      plan.exercises.forEach((exercise) => {
        if (
          isExerciseOnDate(exercise, plan.cycleType, dateStr) &&
          isDateInRange(dateStr, plan.startDate, plan.endDate)
        ) {
          result.push({ planId: plan.id, exerciseId: exercise.id });
        }
      });
    });
  return result;
};
