export const TOTAL_LEAVE_ALLOCATION = 35;
export const CYCLE_DAYS = 365;

export const LEAVE_TYPE_ALLOCATION = {
  sick: 12,
  casual: 12,
  public: 11,
};

export const LEAVE_TYPES = Object.keys(LEAVE_TYPE_ALLOCATION);

/**
 * Check if a new cycle should start (365 days have passed)
 * @param {string|Date} cycleStartDate - The start date of the current cycle
 * @returns {boolean} - True if a new cycle should start
 */
export const shouldStartNewCycle = (cycleStartDate) => {
  if (!cycleStartDate) return true; // If no cycle start date, start a new cycle
  
  const startDate = typeof cycleStartDate === 'string' 
    ? new Date(cycleStartDate) 
    : cycleStartDate;
  
  if (isNaN(startDate.getTime())) return true; // Invalid date, start new cycle
  
  const now = new Date();
  const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  
  return daysDiff >= CYCLE_DAYS;
};

/**
 * Get the number of days remaining in the current cycle
 * @param {string|Date} cycleStartDate - The start date of the current cycle
 * @returns {number} - Days remaining in the cycle
 */
export const getDaysRemainingInCycle = (cycleStartDate) => {
  if (!cycleStartDate) return CYCLE_DAYS;
  
  const startDate = typeof cycleStartDate === 'string' 
    ? new Date(cycleStartDate) 
    : cycleStartDate;
  
  if (isNaN(startDate.getTime())) return CYCLE_DAYS;
  
  const now = new Date();
  const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, CYCLE_DAYS - daysDiff);
};


