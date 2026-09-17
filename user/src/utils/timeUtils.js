/**
 * Utility functions for time formatting and conversion
 */

/**
 * Format milliseconds to HH:MM:SS format
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string in HH:MM:SS format
 */
export const formatTimeStandard = (ms) => {
  if (!ms) return '00:00:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
};

/**
 * Format milliseconds to readable format (e.g., "2h 15m 30s")
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string in readable format
 */
export const formatTimeReadable = (ms) => {
  if (!ms) return '0s';
  const s = Math.floor(ms / 1000);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  
  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0) result += `${minutes}m `;
  result += `${seconds}s`;
  
  return result.trim();
};

/**
 * Convert HH:MM:SS format to milliseconds
 * @param {string} timeString - Time string in HH:MM:SS format
 * @returns {number} Time in milliseconds
 */
export const timeStringToMs = (timeString) => {
  if (!timeString) return 0;
  
  const parts = timeString.split(':');
  if (parts.length !== 3) return 0;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0;
  
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

/**
 * Calculate total time spent in milliseconds
 * @param {Array} timeEntries - Array of time entries with start and end times
 * @returns {number} Total time in milliseconds
 */
export const calculateTotalTimeSpent = (timeEntries) => {
  if (!timeEntries || !Array.isArray(timeEntries) || timeEntries.length === 0) return 0;
  
  return timeEntries.reduce((total, entry) => {
    if (!entry.startTime || !entry.endTime) return total;
    
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.endTime).getTime();
    
    if (isNaN(start) || isNaN(end) || end < start) return total;
    
    return total + (end - start);
  }, 0);
};