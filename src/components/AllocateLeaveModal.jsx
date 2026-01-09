import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MAX_CONTINUOUS_LEAVE } from '../utils/leaveConfig';

const leaveOptions = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'annual', label: 'Annual Leave' },
  { value: 'public', label: 'Public Holiday' },
];

// Helper to get today's date in YYYY-MM-DD format for the date input default
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  // Get month and day, ensuring they are padded with a leading zero if needed
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to check if a date is a weekend (Saturday = 6, Sunday = 0)
const isWeekend = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export const AllocateLeaveModal = ({ isOpen, onClose, onSubmit, loading, error }) => {
  const [selectedType, setSelectedType] = useState('sick');
  // NEW STATE: To hold the date selected by the user
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  // NEW STATE: To hold optional public holiday description
  const [holidayName, setHolidayName] = useState('');
  // NEW STATE: To hold validation error for weekend selection
  const [dateError, setDateError] = useState('');

  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setSelectedType('sick');
      // ⭐️ Reset the date when the modal closes
      setSelectedDate(getTodayDateString());
      // Reset public holiday name when modal closes
      setHolidayName('');
      // Reset date error when modal closes
      setDateError('');
      setDuration(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

const handleDateChange = (newDate) => {
  setSelectedDate(newDate);
  if (isWeekend(newDate)) {
    setDateError('Weekends (Saturday and Sunday) cannot be selected. Please choose a weekday.');
  } else {
    setDateError('');
  }
};

const handleSubmit = (event) => {
  event.preventDefault();
  
  // Check for all required validations
  if (!selectedType || !selectedDate || duration < 1) return;
  
  // Check if selected date is a weekend
  if (isWeekend(selectedDate)) {
    setDateError('Weekends (Saturday and Sunday) cannot be selected. Please choose a weekday.');
    return;
  }
  
  if (selectedType === 'public' && !holidayName.trim()) {
    return;
  }
  
  if (duration > MAX_CONTINUOUS_LEAVE[selectedType]) {
    return;
  }
  
  const meta = { 
    holidayName: selectedType === 'public' ? holidayName : null,
    duration: duration
  };
  onSubmit?.(selectedType, selectedDate, meta); 
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-900 text-white">
          <h2 className="text-lg font-semibold">Allocate Leave</h2>
          <button onClick={onClose} aria-label="Close allocate leave modal" className="p-2 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ⭐️ NEW DATE INPUT FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="leave-date">Leave Date</label>
            <input
              id="leave-date"
              type="date"
              value={selectedDate}
              onChange={(event) => handleDateChange(event.target.value)}
              className={`input-field ${dateError ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={loading}
              required
            />
            {dateError && (
              <p className="text-red-500 text-xs mt-1">{dateError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Weekdays only (Monday - Friday)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="leave-type">Leave Type</label>
            <select
              id="leave-type"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="input-field"
              disabled={loading}
            >
              {leaveOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* ⭐️ Conditional holiday description input for Public Holiday type */}
          {selectedType === 'public' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="holiday-name">Holiday Description</label>
              <input
                id="holiday-name"
                type="text"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="e.g., New Year's Day"
                className="input-field"
                disabled={loading}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
            <input
              type="number"
              min="1"
              max={MAX_CONTINUOUS_LEAVE[selectedType]}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="input-field"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Max allowed for {selectedType}: {MAX_CONTINUOUS_LEAVE[selectedType]} days
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Granting...' : 'Grant Leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocateLeaveModal;