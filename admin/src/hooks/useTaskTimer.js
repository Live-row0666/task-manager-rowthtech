import { useState, useEffect, useRef } from 'react';

const useTaskTimer = (task, isInProgress) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  useEffect(() => {
    if (isInProgress && task) {
      const savedData = localStorage.getItem(`timer_${task._id}`);
      const timerData = savedData ? JSON.parse(savedData) : null;
      
      if (timerData) {
        setElapsedTime(timerData.elapsedTime || 0);
        setIsPaused(timerData.isPaused || false);
        pausedTimeRef.current = timerData.pausedTime || 0;
        startTimeRef.current = timerData.startTime || Date.now();
      } else {
        startTimeRef.current = Date.now();
        setElapsedTime(0);
        setIsPaused(false);
        pausedTimeRef.current = 0;
      }
    }
  }, [isInProgress, task]);

  useEffect(() => {
    if (isInProgress && !isPaused && task) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const totalElapsed = Math.floor((currentTime - startTimeRef.current - pausedTimeRef.current) / 1000);
        setElapsedTime(Math.max(0, totalElapsed));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isInProgress, isPaused, task]);

  useEffect(() => {
    if (task && isInProgress) {
      const timerData = {
        elapsedTime,
        isPaused,
        startTime: startTimeRef.current,
        pausedTime: pausedTimeRef.current
      };
      localStorage.setItem(`timer_${task._id}`, JSON.stringify(timerData));
    }
  }, [elapsedTime, isPaused, task, isInProgress]);

  const pauseTimer = () => {
    if (!isPaused) {
      pausedTimeRef.current += Date.now() - startTimeRef.current - pausedTimeRef.current;
    }
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (isPaused) {
      startTimeRef.current = Date.now();
    }
    setIsPaused(false);
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    if (task) {
      localStorage.removeItem(`timer_${task._id}`);
    }
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    if (task) {
      localStorage.removeItem(`timer_${task._id}`);
    }
    setElapsedTime(0);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    elapsedTime,
    isPaused,
    formattedTime: formatTime(elapsedTime),
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer
  };
};

export default useTaskTimer;