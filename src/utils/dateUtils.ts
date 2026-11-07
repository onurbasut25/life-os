export const getMondayOfWeek = (d: Date = new Date()): string => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi
  date.setDate(diff);
  return date.toISOString().split('T')[0];
};

export const isDateInCurrentWeek = (dateStr: string): boolean => {
  const monday = getMondayOfWeek();
  const mondayDate = new Date(monday);
  const targetDate = new Date(dateStr);
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(sundayDate.getDate() + 6);
  
  return targetDate >= mondayDate && targetDate <= sundayDate;
};
