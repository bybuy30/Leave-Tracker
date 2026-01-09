import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  runTransaction,
  // ⭐️ ADDED: 'where' is needed if you use any query outside of transaction (though we removed the old broken one)
where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { LEAVE_TYPE_ALLOCATION, TOTAL_LEAVE_ALLOCATION, shouldStartNewCycle } from "./leaveConfig";

const buildDefaultLeaves = () => ({
  sick: { taken: 0, quota: LEAVE_TYPE_ALLOCATION.sick },
  annual: { taken: 0, quota: LEAVE_TYPE_ALLOCATION.annual },
  public: { taken: 0, quota: LEAVE_TYPE_ALLOCATION.public },
});

/**
 * Check if a date is a weekend
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is Saturday or Sunday
 */
const isWeekend = (date) => {
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Generate dates for a leave range, excluding weekends
 * @param {string} dateKey - Start date in YYYY-MM-DD format
 * @param {number} consecutiveDays - Number of working days to allocate
 * @returns {string[]} - Array of date strings excluding weekends
 */
const generateLeaveDatesExcludingWeekends = (dateKey, consecutiveDays) => {
  const dates = [];
  const startDate = new Date(dateKey);
  let currentDate = new Date(startDate);
  
  // First, check if the start date is a weekend
  if (isWeekend(currentDate)) {
    // Skip to the next Monday if start date is weekend
    const dayOfWeek = currentDate.getUTCDay();
    if (dayOfWeek === 6) { // Saturday
      currentDate.setUTCDate(currentDate.getUTCDate() + 2); // Move to Monday
    } else if (dayOfWeek === 0) { // Sunday
      currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Move to Monday
    }
  }
  
  // Generate dates for the specified number of working days
  let workingDaysAdded = 0;
  while (workingDaysAdded < consecutiveDays) {
    if (!isWeekend(currentDate)) {
      const currentDateKey = currentDate.toISOString().split('T')[0];
      dates.push(currentDateKey);
      workingDaysAdded++;
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return dates;
};

/**
 * Check and reset leave cycle if 365 days have passed
 * This function updates the employee document if a new cycle should start
 * @param {string} employeeId - The employee ID
 * @returns {Promise<boolean>} - True if cycle was reset, false otherwise
 */
export const checkAndResetCycle = async (employeeId) => {
  if (!employeeId) return false;
  
  try {
    const employeeRef = doc(db, "employees", employeeId);
    
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(employeeRef);
      if (!snapshot.exists()) return;
      
      const data = snapshot.data();
      const cycleStartDate = data.cycleStartDate;
      
      if (shouldStartNewCycle(cycleStartDate)) {
        // Reset leave quota for new cycle
        const resetLeaves = buildDefaultLeaves();
        const newCycleStartDate = new Date().toISOString();
        
        // Filter leave logs to only include logs from current cycle
        // Keep all historical logs but reset current cycle leaves
        const allLogs = Array.isArray(data.leaveLogs) ? [...data.leaveLogs] : [];
        
        // Calculate new totals based on reset leaves
        const totalTaken = 0; // Reset to 0 for new cycle
        const leavesRemaining = TOTAL_LEAVE_ALLOCATION;
        
        transaction.update(employeeRef, {
          leaves: resetLeaves,
          leavesUsed: totalTaken,
          leavesRemaining,
          cycleStartDate: newCycleStartDate,
          updatedAt: serverTimestamp(),
        });
      }
    });
    
    return true;
  } catch (error) {
    console.error("Error checking/resetting cycle:", error);
    return false;
  }
};

const getRandomId = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (error) {
    // ignore
  }
  return `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Add a new employee to Firestore
 * @param {Object} employeeData - Employee data
 * @param {string} adminId - Admin UID who owns this employee
 */
export const addEmployeeToFirestore = async (employeeData, adminId) => {
  if (!adminId) {
    throw new Error("Admin ID is required to add an employee");
  }
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, "employees"), {
      employeeId: employeeData.employeeId,
      name: employeeData.name,
      nationality: employeeData.nationality,
      designation: employeeData.designation,
      adminId: adminId, // Associate employee with admin
      totalLeaves: TOTAL_LEAVE_ALLOCATION,
      leaves: buildDefaultLeaves(),
      leavesUsed: 0,
      leavesRemaining: TOTAL_LEAVE_ALLOCATION,
      leaveLogs: [],
      leaveHeatmap: {},
      cycleStartDate: now.toISOString(), // Initialize cycle start date
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw new Error(error.message);
  }
};

/**
 * Fetch all employees from Firestore for a specific admin
 * @param {string} adminId - Admin UID to filter employees
 */
export const fetchEmployeesFromFirestore = async (adminId) => {
  if (!adminId) {
    throw new Error("Admin ID is required to fetch employees");
  }
  try {
    const q = query(
      collection(db, "employees"),
      where("adminId", "==", adminId),
      orderBy("name", "asc")
    );
    const querySnapshot = await getDocs(q);
    const employees = [];

    querySnapshot.forEach((doc) => {
      employees.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error(error.message);
  }
};

/**
 * Set up real-time listener for employees for a specific admin
 * @param {string} adminId - Admin UID to filter employees
 * @param {Function} callback - Callback function to receive employees
 * @param {Function} onError - Error callback
 */
export const subscribeToEmployees = (adminId, callback, onError) => {
  if (!adminId) {
    const error = new Error("Admin ID is required to subscribe to employees");
    onError?.(error);
    throw error;
  }
  try {
    const q = query(
      collection(db, "employees"),
      where("adminId", "==", adminId),
      orderBy("name", "asc")
    );
    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const employees = [];
        querySnapshot.forEach((docSnapshot) => {
          const employeeId = docSnapshot.id;
          // Check and reset cycle if needed for each employee (async, non-blocking)
          checkAndResetCycle(employeeId).catch(console.error);
          
          employees.push({
            id: employeeId,
            ...docSnapshot.data(),
          });
        });
        callback(employees);
      },
      (error) => {
        console.error("Error listening to employees:", error);
        onError?.(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up listener:", error);
    onError?.(error);
    throw new Error(error.message);
  }
};

/**
 * Subscribe to a single employee document
 * @param {string} employeeId - Employee document ID
 * @param {string} adminId - Admin UID to verify ownership
 * @param {Function} callback - Callback function to receive employee data
 */
export const subscribeToEmployeeById = (employeeId, adminId, callback) => {
  if (!employeeId) return () => {};
  if (!adminId) {
    callback(null);
    return () => {};
  }
  const employeeRef = doc(db, "employees", employeeId);
  return onSnapshot(employeeRef, async (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      // Verify that the employee belongs to the current admin
      if (data.adminId !== adminId) {
        callback(null); // Return null if employee doesn't belong to this admin
        return;
      }
      // Check and reset cycle if needed (async, non-blocking)
      checkAndResetCycle(employeeId).catch(console.error);
      
      callback({
        id: snapshot.id,
        ...data,
      });
    } else {
      callback(null);
    }
  });
};

// Update employee leave record
 
export const updateEmployeeLeaveToFirestore = async (employeeId, leaveData) => {
  try {
    await updateDoc(doc(db, "employees", employeeId), {
      leaves: leaveData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating leave:", error);
    throw new Error(error.message);
  }
};

/**
 * Delete an employee from Firestore
 * @param {string} employeeId - Employee document ID
 * @param {string} adminId - Admin UID to verify ownership
 */
export const deleteEmployeeFromFirestore = async (employeeId, adminId) => {
  if (!adminId) {
    throw new Error("Admin ID is required to delete an employee");
  }
  try {
    const employeeRef = doc(db, "employees", employeeId);
    // Verify ownership before deleting
    const employeeSnap = await getDoc(employeeRef);
    
    if (!employeeSnap.exists()) {
      throw new Error("Employee not found");
    }
    
    const employeeData = employeeSnap.data();
    if (employeeData.adminId !== adminId) {
      throw new Error("You don't have permission to delete this employee");
    }
    
    await deleteDoc(employeeRef);
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw new Error(error.message);
  }
};

/**
 * Log leave activity for an employee
 */
export const logLeaveToFirestore = async (employeeId, leaveLog) => {
  try {
    const employeeRef = doc(db, "employees", employeeId);
    const employeeSnap = await getDocs(
      query(collection(db, "employees"), orderBy("name"))
    );

    let currentData = null;
    employeeSnap.forEach((doc) => {
      if (doc.id === employeeId) {
        currentData = doc.data();
      }
    });

    if (currentData) {
      const updatedLogs = [...(currentData.leaveLogs || []), leaveLog];
      await updateDoc(employeeRef, {
        leaveLogs: updatedLogs,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error logging leave:", error);
    throw new Error(error.message);
  }
};

/**
 * Allocate leave to an employee and append a leave log.
 * Enforces one leave per employee per day using a Firestore transaction check.
 * @param {string} employeeId
 * @param {'sick'|'annual'|'public'} leaveType
 * @param {string} dateKey - The YYYY-MM-DD date string for the leave
 * @param {string} adminId - Admin UID to verify ownership
 * @param {string} holidayDescription - Optional description for public holidays
 * @returns {Promise<void>}
 */

export const allocateLeaveToEmployee = async (employeeId, leaveType, dateKey, adminId, holidayDescription, consecutiveDays = 1) => {
  if (!employeeId || !leaveType || !dateKey) {
    throw new Error("Missing employeeId, leaveType, or dateKey.");
  }
  if (!adminId) {
    throw new Error("Admin ID is required to allocate leave.");
  }
  if (consecutiveDays < 1) {
    throw new Error("Consecutive days must be at least 1.");
  }

  // Check if the start date is a weekend
  const startDate = new Date(dateKey);
  if (isWeekend(startDate)) {
    throw new Error("Holidays cannot be assigned on weekends. Please select a weekday.");
  }

  const employeeRef = doc(db, "employees", employeeId);
  const now = new Date();
  
  // Generate dates excluding weekends
  const heatmapDates = generateLeaveDatesExcludingWeekends(dateKey, consecutiveDays);
  
  // Create a single log entry with the total duration
  const logEntry = {
    id: getRandomId(),
    type: leaveType,
    date: dateKey,
    timestamp: now.toISOString(),
    duration: consecutiveDays,
  };
  
  if (leaveType === 'public' && holidayDescription) {
    logEntry.holidayDescription = holidayDescription;
  }
  
  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(employeeRef);
      if (!snapshot.exists()) {
        throw new Error("Employee not found.");
      }

      const data = snapshot.data();
      
      // Verify ownership
      if (data.adminId !== adminId) {
        throw new Error("You don't have permission to allocate leave to this employee.");
      }
      const existingLogs = Array.isArray(data.leaveLogs)
        ? [...data.leaveLogs]
        : [];
      
      const datesInRange = heatmapDates;
      const conflictingDates = datesInRange.filter(date => 
        existingLogs.some(log => {
          // For multi-day logs, check if date falls within the range
          const logStart = new Date(log.date);
          const logEnd = new Date(logStart);
          logEnd.setDate(logEnd.getDate() + (log.duration - 1));
          const checkDate = new Date(date);
          return checkDate >= logStart && checkDate <= logEnd;
        })
      );
      
      if (conflictingDates.length > 0) {
        throw new Error(
          `Leave already allocated for ${conflictingDates.join(', ')}. Only one leave is allowed per day.`
        );
      }
      
      // Check if a new cycle should start (365 days have passed)
      let cycleStartDate = data.cycleStartDate;
      let currentLeaves = { ...buildDefaultLeaves(), ...(data.leaves || {}) };
      
      if (shouldStartNewCycle(cycleStartDate)) {
        // Reset leave quota for new cycle
        currentLeaves = buildDefaultLeaves();
        cycleStartDate = new Date().toISOString();
      } else if (!cycleStartDate) {
        // If no cycle start date exists, initialize it
        cycleStartDate = new Date().toISOString();
      }
      
      const targetLeave = currentLeaves[leaveType];
      const leavesNeeded = consecutiveDays;
      const leavesAvailable = targetLeave.quota - targetLeave.taken;
      
      if (leavesNeeded > leavesAvailable) {
        throw new Error(
          `Cannot allocate ${leavesNeeded} consecutive ${leaveType} leaves. Only ${leavesAvailable} remaining.`
        );
      }

      const updatedLeaves = {
        ...currentLeaves,
        [leaveType]: {
          ...targetLeave,
          taken: targetLeave.taken + consecutiveDays,
        },
      };

      const updatedLogs = [...existingLogs, logEntry];

      const totalTaken = Object.values(updatedLeaves).reduce(
        (sum, category) => sum + (category.taken || 0),
        0
      );
      const totalLeaves = data.totalLeaves || TOTAL_LEAVE_ALLOCATION;
      const leavesRemaining = Math.max(totalLeaves - totalTaken, 0);

      const existingHeatmap = data.leaveHeatmap || {};
      const updatedHeatmap = { ...existingHeatmap };
      
      // Update heatmap for each consecutive day
      heatmapDates.forEach((dateStr) => {
        const currentDay = existingHeatmap[dateStr] || { total: 0 };
        const updatedDay = {
          ...currentDay,
          total: (currentDay.total || 0) + 1,
          [leaveType]: (currentDay[leaveType] || 0) + 1,
        };
        updatedHeatmap[dateStr] = updatedDay;
      });

      transaction.update(employeeRef, {
        leaves: updatedLeaves,
        leavesUsed: totalTaken,
        leavesRemaining,
        leaveLogs: updatedLogs,
        leaveHeatmap: updatedHeatmap,
        cycleStartDate, // Update cycle start date
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error("Error allocating leave:", error);
    // Re-throw the error so the calling function can catch it and display the message.
    throw error;
  }
};