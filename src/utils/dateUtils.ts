export const getCurrentShift = (): 'Morning' | 'Noon' | 'Night' => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const morningStart = 5 * 60 + 30;
  const noonStart = 13 * 60 + 30;
  const nightStart = 21 * 60 + 30;

  if (totalMinutes >= morningStart && totalMinutes < noonStart) {
    return 'Morning';
  } else if (totalMinutes >= noonStart && totalMinutes < nightStart) {
    return 'Noon';
  } else {
    return 'Night';
  }
};

export const formatSriLankanDateTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Colombo'
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMonthYearKey = (year: number, month: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

export const getCurrentMonthYear = (): { year: number; month: number } => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
};
