import React, { useMemo } from 'react';
import { LEAVE_TYPES } from '../utils/leaveConfig';

const INTENSITY_CLASSES = [
  'bg-gray-100 border-gray-200',
  'bg-[#212338] border-[#212338]',
];

const HOLIDAY_CLASS = 'bg-[#212338] border-[#212338]';

const DAYS_IN_WEEK = 7;
const TOTAL_WEEKS = 54; 

const formatDateLabel = (date) =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const getIntensityLevel = (total) => {
  if (!total) return 0;
  return 1;
};

const normalizeHeatmapEntry = (entry = {}) => {
  const normalized = {
    total: entry.total || 0,
    types: {},
  };
  LEAVE_TYPES.forEach((type) => {
    const value = entry[type] ?? entry?.types?.[type] ?? 0;
    if (value) {
      normalized.types[type] = value;
    }
  });
  return normalized;
};

const mergeHeatmapSources = (heatmapData = {}, leaveLogs = []) => {
  const map = new Map();

  Object.entries(heatmapData || {}).forEach(([dateKey, entry]) => {
    map.set(dateKey, normalizeHeatmapEntry(entry));
  });

  leaveLogs.forEach((log) => {
    const rawDate = log.date || log.timestamp;
    if (!rawDate) return;
    const dateKey = rawDate.split('T')[0];
    const duration = log.duration || 1;
    const type = log.type || 'annual';
    const current = map.get(dateKey) || { total: 0, types: {} };
    // Only count non-holiday leaves in total
    if (type !== 'public') {
      current.total += duration;
    }
    current.types[type] = (current.types[type] || 0) + duration;
    map.set(dateKey, current);
  });

  return map;
};

const buildYearGrid = (year, aggregatedMap) => {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const startDate = new Date(startOfYear);
  // Align to Sunday
  startDate.setUTCDate(startOfYear.getUTCDate() - startOfYear.getUTCDay());

  const weeks = [];
  const monthLabels = [];
  let lastMonthLabel = null;

  for (let weekIndex = 0; weekIndex < TOTAL_WEEKS; weekIndex += 1) {
    const weekDays = [];

    for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex += 1) {
      const day = new Date(startDate);
      day.setUTCDate(startDate.getUTCDate() + weekIndex * DAYS_IN_WEEK + dayIndex);
      const key = day.toISOString().split('T')[0];
      const aggregatedEntry = aggregatedMap.get(key);
      weekDays.push({
        key,
        date: day,
        total: aggregatedEntry?.total || 0,
        types: aggregatedEntry?.types || {},
      });
    }
    weeks.push(weekDays);

    const labelDay = weekDays.find((d) => d.date.getUTCDate() === 1);
    if (labelDay) {
      const label = labelDay.date.toLocaleString('en-US', { month: 'short' });
      if (label !== lastMonthLabel) {
        monthLabels.push(label);
        lastMonthLabel = label;
      } else {
        monthLabels.push('');
      }
    } else {
      monthLabels.push('');
    }
  }

  return { weeks, monthLabels };
};

export const LeaveHeatmap = ({ leaveLogs = [], heatmapData = {}, year = new Date().getFullYear() }) => {
  const aggregated = useMemo(
    () => mergeHeatmapSources(heatmapData, leaveLogs),
    [heatmapData, leaveLogs]
  );
  const { weeks, monthLabels } = useMemo(
    () => buildYearGrid(year, aggregated),
    [year, aggregated]
  );

  return (
    <div className="space-y-3 overflow-x-auto">
      <div className="flex gap-1 pl-8">
        {monthLabels.map((label, index) => (
          <div key={index} className="w-4 text-center text-xs text-gray-500">
            {label}
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="flex flex-col gap-1 pr-2 text-xs text-gray-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day.charAt(0)}</span>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => {
                const isHoliday = day.types?.public && !day.types?.sick && !day.types?.annual;
                const level = isHoliday ? 0 : getIntensityLevel(day.total);
                const isCurrentYear = day.date.getUTCFullYear() === year;
                const cellClass = isHoliday 
                  ? HOLIDAY_CLASS 
                  : INTENSITY_CLASSES[level];
                
                return (
                  <div key={day.key} className="group relative">
                    <div
                      className={`w-4 h-4 rounded-sm border ${cellClass} ${
                        isCurrentYear ? '' : 'opacity-30'
                      }`}
                    />
                    <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col rounded-md bg-gray-900 text-white text-xs px-3 py-2 shadow-lg whitespace-nowrap z-20">
                      <span className="font-semibold">{formatDateLabel(day.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveHeatmap;