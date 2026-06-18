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
