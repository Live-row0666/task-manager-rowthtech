import moment from 'moment';

// Format date for API calls
export const formatDateForAPI = (date) => {
  return date ? moment(date).format('YYYY-MM-DD') : null;
};

// Format month for API calls
export const formatMonthForAPI = (date) => {
  return date ? moment(date).format('YYYY-MM') : null;
};

// Generate date range array
export const generateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const start = moment(startDate);
  const end = moment(endDate);
  const dates = [];
  
  while (start.isSameOrBefore(end)) {
    dates.push(start.format('YYYY-MM-DD'));
    start.add(1, 'day');
  }
  
  return dates;
};

// Get hours for specific date from daily hours array
export const getHoursForDate = (dailyHours, targetDate) => {
  if (!dailyHours || !Array.isArray(dailyHours)) return 0;
  
  const dayData = dailyHours.find(d => d?.date === targetDate);
  return dayData?.hours || 0;
};

// Get hours for specific day from daily hours array (for monthly view)
export const getHoursForDay = (dailyHours, targetDay) => {
  if (!dailyHours || !Array.isArray(dailyHours)) return 0;
  
  const dayData = dailyHours.find(d => d?.day === targetDay);
  return dayData?.hours || 0;
};

// Format time display
export const formatTime = (timeString) => {
  return timeString ? moment(timeString).format('HH:mm') : 'N/A';
};

// Format date display
export const formatDate = (dateString) => {
  return dateString ? moment(dateString).format('DD-MMM') : 'N/A';
};

// Get task status badge class
export const getTaskStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-success';
    case 'in-progress':
    case 'in progress':
      return 'bg-warning';
    case 'pending':
      return 'bg-info';
    case 'cancelled':
    case 'canceled':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

// Safe data access with fallback
export const safeGet = (obj, path, fallback = 'N/A') => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || fallback;
};