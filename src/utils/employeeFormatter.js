import { LEAVE_TYPE_ALLOCATION, LEAVE_TYPES, TOTAL_LEAVE_ALLOCATION } from './leaveConfig';

const ensureLeaveCategory = (leaves = {}, type) => {
  const category = leaves[type] || {};
  return {
    quota: typeof category.quota === 'number' ? category.quota : LEAVE_TYPE_ALLOCATION[type],
    taken: typeof category.taken === 'number' ? category.taken : 0,
  };
};

const normalizeLeaveStructure = (leaves = {}) => {
  const normalized = {
    sick: ensureLeaveCategory(leaves, 'sick'),
    casual: ensureLeaveCategory(leaves, 'casual'),
    public: ensureLeaveCategory(leaves, 'public'),
  };

  return normalized;
};

const buildLeaveBreakdown = (leaves) => ({
  sick: {
    used: leaves.sick.taken,
    remaining: Math.max(leaves.sick.quota - leaves.sick.taken, 0),
    total: leaves.sick.quota,
  },
  casual: {
    used: leaves.casual.taken,
    remaining: Math.max(leaves.casual.quota - leaves.casual.taken, 0),
    total: leaves.casual.quota,
  },
  public: {
    used: leaves.public.taken,
    remaining: Math.max(leaves.public.quota - leaves.public.taken, 0),
    total: leaves.public.quota,
  },
});

const formatLogs = (logs = []) => {
  return logs.map((log, index) => {
    const timestamp = log.timestamp || log.date || log.createdAt;
    return {
      id: log.id || `${log.type || 'leave'}-${index}`,
      type: log.type || 'casual',
      date: log.date || (timestamp ? new Date(timestamp).toISOString().split('T')[0] : null),
      timestamp: timestamp || null,
      duration: log.duration || log.hours || 1,
      meta: log.meta || null,
    };
  });
};

// Define a constant for the desired default quotas
const DEFAULT_LEAVE_QUOTAS = {
  sick: { quota: 3, taken: 0 },
  casual: { quota: 20, taken: 0 },
  public: { quota: 12, taken: 0 },
};

export const formatEmployee = (employee) => {
  if (!employee) return null;

  const employeeLeaves = normalizeLeaveStructure(employee.leaves);

  // 1. FORCING THE NEW QUOTAS (3, 20, 12)
  const leaves = {
    sick: {
      quota: DEFAULT_LEAVE_QUOTAS.sick.quota,
      taken: employeeLeaves?.sick?.taken ?? 0,
    },
    casual: {
      quota: DEFAULT_LEAVE_QUOTAS.casual.quota,
      taken: employeeLeaves?.casual?.taken ?? 0,
    },
    public: {
      quota: DEFAULT_LEAVE_QUOTAS.public.quota,
      taken: employeeLeaves?.public?.taken ?? 0,
    },
  };

  const leaveBreakdown = buildLeaveBreakdown(leaves);

  // Recalculate totals based on the fixed quotas
  const totalQuota = leaves.sick.quota + leaves.casual.quota + leaves.public.quota;
  const totalTaken = leaves.sick.taken + leaves.casual.taken + leaves.public.taken;

  // 2. FIX: Use totalQuota directly as the fallback for totalLeaves.
  const totalLeaves = typeof employee.totalLeaves === 'number' ? employee.totalLeaves : totalQuota;
  
  const leavesUsed = typeof employee.leavesUsed === 'number' ? employee.leavesUsed : totalTaken;
  
  const leavesRemaining =
    typeof employee.leavesRemaining === 'number'
      ? employee.leavesRemaining
      : Math.max(totalLeaves - leavesUsed, 0);

  return {
    id: employee.id || employee.employeeId,
    employeeId: employee.employeeId || employee.id,
    name: employee.name || 'Unknown Employee',
    designation: employee.designation || 'N/A',
    nationality: employee.nationality || employee.country || 'Not specified',
    country: employee.country || employee.nationality || 'Not specified',
    avatar:
      employee.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(employee.name || 'employee')}`,
    leaves,
    leaveBreakdown,
    totalLeaves,
    leavesUsed,
    leavesRemaining,
    leaveLogs: formatLogs(employee.leaveLogs || employee.logs || []),
    leaveHeatmap: employee.leaveHeatmap || {},
    createdAt: employee.createdAt || null,
    updatedAt: employee.updatedAt || null,
  };
};

export const formatEmployees = (employees = []) =>
  employees.map((employee) => formatEmployee(employee)).filter(Boolean);

export const buildLeaveSummaries = (employee) => {
  const formatted = formatEmployee(employee);
  if (!formatted) {
    return {
      taken: { sick: 0, casual: 0, public: 0 },
      remaining: { sick: 0, casual: 0, public: 0 },
    };
  }

  const taken = {};
  const remaining = {};
  LEAVE_TYPES.forEach((type) => {
    taken[type] = formatted.leaveBreakdown[type].used;
    remaining[type] = formatted.leaveBreakdown[type].remaining;
  });

  return { taken, remaining };
};