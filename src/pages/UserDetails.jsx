import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { AllocateLeaveModal, LeaveBarChart, LeaveHeatmap } from "../components";
import {
  allocateLeaveToEmployee,
  deleteEmployeeFromFirestore,
  subscribeToEmployeeById,
} from "../utils/firebaseHelpers";
import {
  buildLeaveSummaries,
  formatEmployee,
} from "../utils/employeeFormatter";
import { useAdmin } from "../contexts/AdminContext";

const useClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
};

const formatDisplayDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatDisplayTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatTimestamp = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function UserDetailsPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const now = useClock();
  const { admin } = useAdmin();
  const adminId = admin?.uid;

  const remainingLabels = {
    sick: "Sick Leaves - 3 days",
    casual: "Casual Leaves - 20 days",
    public: "Public Holidays - 12 days",
  };

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      setError("You must be logged in to view employee details");
      return;
    }

    setLoading(true);
    setError(null);

    if (!employeeId) {
      setError("Employee not found");
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToEmployeeById(employeeId, adminId, (data) => {
      if (!data) {
        setEmployee(null);
        setError("Employee not found");
        setLoading(false);
        return;
      }
      setEmployee(formatEmployee({ id: employeeId, ...data }));
      setError(null);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, [employeeId, adminId]);

  const leaveSummaries = useMemo(
    () => buildLeaveSummaries(employee),
    [employee]
  );

  const leaveLogEntries = useMemo(() => {
    if (!employee?.leaveLogs) return [];
    return [...employee.leaveLogs].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date).getTime();
      const dateB = new Date(b.timestamp || b.date).getTime();
      return dateB - dateA;
    });
  }, [employee]);

  const handleAllocateLeave = useCallback(
    async (leaveType, selectedDate) => {
      if (!employee || !leaveType || !selectedDate || !adminId) return;
      try {
        setModalError(null);
        setModalLoading(true);
        // Pass the date and adminId to the helper function
        await allocateLeaveToEmployee(employee.id, leaveType, selectedDate, adminId);
        setAllocateModalOpen(false);
      } catch (err) {
        console.error("Failed to allocate leave:", err);
        setModalError(err.message || "Failed to allocate leave.");
      } finally {
        setModalLoading(false);
      }
    },
    [employee, adminId]
  );

  const handleRemoveEmployee = useCallback(async () => {
    if (!employee?.id) return;
    if (!window.confirm("Are you sure you want to remove this employee?"))
      return;

    try {
      setError(null);
      await deleteEmployeeFromFirestore(employee.id);
      navigate("/");
    } catch (err) {
      console.error("Failed to remove employee:", err);
      setError(err.message || "Failed to remove employee.");
    }
  }, [employee, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
        <p className="text-lg text-gray-700 mb-4">
          {error || "Employee not found"}
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 pb-32">
      <div className="px-6 py-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white hover:text-gray-300"
          >
            <ArrowLeft className="text-2xl font-science-gothic w-5 h-5" /> Home
            Page
          </button>
          <div className="text-right">
            <p className="text-base font-semibold font-science-gothic text-gray-300">
              {formatDisplayDate(now)}
            </p>
            <p className="text-2xl font-bold font-science-gothic text-white tabular-nums">
              {formatDisplayTime(now)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-32 h-32 rounded-full border-4 border-gray-100 object-cover"
            />
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">
                {employee.name}
              </h2>
              <p className="text-lg text-gray-600 mt-1">
                {employee.designation}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 justify-center lg:justify-start text-sm text-gray-500">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {employee.country}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> ID: {employee.employeeId}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="card bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Total Leaves
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employee.totalLeaves}
                  </p>
                </div>
                <div className="card bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Used
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employee.leavesUsed}
                  </p>
                </div>
                <div className="card bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Remaining
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employee.leavesRemaining}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Leave Usage Overview
              </h3>
              <span className="text-sm text-gray-500">Live updates</span>
            </div>
            <LeaveBarChart data={leaveSummaries.taken} />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Leaves Remaining
              </h3>
              <span className="text-sm text-gray-500">
                of {employee.totalLeaves} days
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["sick", "casual", "public"].map((type) => (
                <div key={type} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {remainingLabels[type] || type}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {leaveSummaries.remaining[type]}d
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {leaveSummaries.taken[type]}d used of{" "}
                    {employee.leaves[type].quota}d
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Calendar Heatmap
              </h3>
              <span className="text-sm text-gray-500">
                Full year overview of
              </span>
            </div>
            <div className="flex gap-8 items-center">
              <div className="flex-1">
                <LeaveHeatmap
                  leaveLogs={employee.leaveLogs}
                  heatmapData={employee.leaveHeatmap}
                  year={new Date().getFullYear()}
                />
              </div>
              <div className="text-center">
                <link
                  href="https://fonts.googleapis.com/css2?family=Foldit:wght@400;600;800&display=swap"
                  rel="stylesheet"
                />
                <p className="text-[clamp(2rem,8vw,10rem)] font-science-gothic text-[#191A30] text-center leading-none">
                  2026  
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Leave Logs
              </h3>
              <span className="text-sm text-gray-500">Most recent first</span>
            </div>
            {leaveLogEntries.length === 0 ? (
              <p className="text-sm text-gray-500">No leave logs yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {leaveLogEntries.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {log.type} leave
                      </p>
                      {/* ⭐️ FIX 2: Change log.timestamp || log.date to just log.date */}
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(log.date)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {log.duration || 1}d
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-30">
        <button
          className="px-6 py-3 rounded-full text-white font-semibold shadow-lg bg-gray-900 hover:bg-gray-800"
          onClick={() => setAllocateModalOpen(true)}
        >
          Allocate Leave
        </button>
        <button
          className="px-6 py-3 rounded-full text-white font-semibold shadow-lg bg-red-600 hover:bg-red-700"
          onClick={handleRemoveEmployee}
        >
          Remove Employee
        </button>
      </div>

      <AllocateLeaveModal
        isOpen={isAllocateModalOpen}
        onClose={() => {
          setAllocateModalOpen(false);
          setModalError(null);
        }}
        onSubmit={handleAllocateLeave}
        loading={modalLoading}
        error={modalError}
      />
    </div>
  );
}

export default UserDetailsPage;
