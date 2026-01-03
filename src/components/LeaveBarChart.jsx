import React from 'react';

const LABELS = {
  sick: 'Sick',
  casual: 'Casual',
  public: 'Public Holidays',
};

const COLORS = {
  sick: 'bg-red-500',
  casual: 'bg-blue-500', // This is the active color based on the image
  public: 'bg-green-500',
};

// Assuming 'font-science-gothic' is configured to use the desired font.
const FONT_CLASS = 'font-sans text-lg tracking-wider'; 

export const LeaveBarChart = ({ data = { sick: 0, casual: 1, public: 0 } }) => {
  const entries = Object.entries(data);
  const total = Math.max(
    1,
    entries.reduce((sum, [, value]) => sum + (value || 0), 0)
  );

  return (
    <div className="space-y-4">
      {/* Labels Section: Justified, Larger Font */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        {entries.map(([type, value]) => (
          <div
            key={type}
            className={`flex items-center gap-2 ${FONT_CLASS}`}
            style={{ flexBasis: '33.33%', justifyContent: 'center' }}
          >
            <span
              className={`inline-block w-4 h-4 rounded-full ${COLORS[type]}`}
            />
            <span className="font-semibold text-gray-900">
              {LABELS[type] || type}: <span className="font-bold">{value || 0}d</span>
            </span>
          </div>
        ))}
      </div>

      {/* Bar Graph Section: Thinner, Squared Corners, and Downwards Orientation (achieved by pt-2) */}
      <div className="pt-2"> 
        {/* h-4 for thinner bar, no rounded class for squared corners */}
        <div className="w-full h-4 bg-gray-100 overflow-hidden flex shadow-inner"> 
          {entries.map(([type, value]) => {
            const width = ((value || 0) / total) * 100;
            return (
              <div
                key={type}
                className={`${COLORS[type]} h-full relative text-xs font-bold text-white transition-all duration-500`}
                style={{ width: `${width}%` }}
              >
                {value > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center px-2 drop-shadow-sm">
                    {value}d
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaveBarChart;