import React from 'react';
import { formatTimeStandard, formatTimeReadable } from '../utils/timeUtils';

/**
 * TimeDisplay component for showing elapsed time in different formats
 * @param {Object} props Component props
 * @param {number} props.timeInMs Time in milliseconds
 * @param {string} props.format Format to display ('standard' for HH:MM:SS or 'readable' for 2h 15m 30s)
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} Formatted time display
 */
const TimeDisplay = ({ timeInMs, format = 'standard', className = '' }) => {
  return (
    <span className={className}>
      {format === 'readable' ? formatTimeReadable(timeInMs) : formatTimeStandard(timeInMs)}
    </span>
  );
};

export default TimeDisplay;