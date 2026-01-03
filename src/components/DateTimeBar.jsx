import React, { useState, useEffect, useMemo } from 'react';

// Helper function to determine the time-based greeting
const getGreetingForHour = (hour) => {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Main component: Displays current date, time, and a personalized greeting
export const DateTimeBar = ({ employeeName = 'Affan' }) => {
  const [dateTime, setDateTime] = useState(new Date());

  // Set up a timer to update the current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Memoize the greeting so it only recalculates when the hour changes
  const greeting = useMemo(() => getGreetingForHour(dateTime.getHours()), [dateTime]);

  // Formats the date string (e.g., Friday, November 28, 2025)
  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  // Formats the time string (e.g., 05:40:00 PM)
  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    // Increased vertical padding (py-10) for a larger background section
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-10 px-6 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Date and Time Section (Top Row - Aligned Left/Right) */}
        <div className="flex justify-between items-start gap-4 border-b border-gray-700 pb-6">
          
          {/* LEFT: Current Time */}
          <div className="flex flex-col items-start">
            <p className="text-xs uppercase tracking-widest text-gray-400">Current Time</p>
            <p className="font-display text-4xl sm:text-5xl font-bold tabular-nums">
              {formatTime(dateTime)}
            </p>
          </div>

          {/* RIGHT: Today's Date */}
          <div className="flex flex-col items-end text-right">
            <p className="text-xs uppercase tracking-widest text-gray-400">Today</p>
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {formatDate(dateTime)}
            </p>
          </div>
        </div>

        {/* Greeting Section (Bottom Row - Centralized and Bigger) */}
        <div className="w-full text-center pt-2">
            {/* Lighter font for "hello, Affan" */}
            <p className="text-xl text-gray-300 capitalize mb-1">
              hello, <span className="font-semibold text-white">{employeeName}</span>
            </p>
            
            {/* Bigger, bold, and centralized greeting */}
            {/* Added line-height-tight and py-2 for better vertical spacing */}
            <p className="font-extrabold text-5xl sm:text-6xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200 leading-tight py-2">
                {greeting}
            </p>
        </div>
        
      </div>
    </div>
  );
};

export default DateTimeBar;