import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, MapPin } from "lucide-react";

import {
  AllocateLeaveModal,
  LeaveBarChart,
  LeaveHeatmap,
} from "../components";

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

/* -------------------- Utilities -------------------- */

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
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* -------------------- Page -------------------- */

function UserDetailsPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const now = useClock();
  const { admin } = useAdmin();
  const adminId = admin?.uid;

  const remainingLabels = {
    sick: "Sick Leaves - 3 days",
    annual: "Annual Leaves - 20 days",
    public: "Public Holidays - 12 days",
  };

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  /* -------------------- Data Subscription -------------------- */

  useEffect(() => {
    if (!adminId) {
      setError("You must be logged in to view employee details");
      setLoading(false);
      return;
    }

    if (!employeeId) {
      setError("Employee not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToEmployeeById(
      employeeId,
      adminId,
      (data) => {
        if (!data) {
          setEmployee(null);
          setError("Employee not found");
          setLoading(false);
          return;
        }

        setEmployee(formatEmployee({ id: employeeId, ...data }));
        setLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [employeeId, adminId]);

  /* -------------------- Derived Data -------------------- */

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

  /* -------------------- Actions -------------------- */

  const handleAllocateLeave = useCallback(
    async (leaveType, selectedDate, meta) => {
      if (!employee || !leaveType || !selectedDate || !adminId) return;

      try {
        setModalError(null);
        setModalLoading(true);

        await allocateLeaveToEmployee(
          employee.id,
          leaveType,
          selectedDate,
          adminId,
          meta?.holidayName,
          meta?.duration
        );

        setAllocateModalOpen(false);
      } catch (err) {
        console.error(err);
        setModalError(err.message || "Failed to allocate leave.");
      } finally {
        setModalLoading(false);
      }
    },
    [employee, adminId]
  );

  const handleRemoveEmployee = useCallback(async () => {
    if (!employee?.id) return;
    if (!window.confirm("Are you sure you want to remove this employee?")) return;

    try {
      await deleteEmployeeFromFirestore(employee.id);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to remove employee.");
    }
  }, [employee, navigate]);

  /* -------------------- States -------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading employee details…</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-lg text-gray-700 mb-4">
          {error || "Employee not found"}
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Go Back Home
        </button>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="relative min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="px-6 py-6 sticky top-0 z-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Home Page
          </button>

          <div className="text-right">
            <p className="text-gray-300 font-semibold">
              {formatDisplayDate(now)}
            </p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {formatDisplayTime(now)}
            </p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
            />

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold">{employee.name}</h2>
              <p className="text-gray-600 mt-1">{employee.designation}</p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {employee.country}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" /> ID: {employee.employeeId}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">
              Leave Usage Overview
            </h3>
            <LeaveBarChart data={leaveSummaries.taken} />
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4">
              Leaves Remaining
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["sick", "annual", "public"].map((type) => (
                <div key={type} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase">
                    {remainingLabels[type]}
                  </p>
                  <p className="text-3xl font-bold">
                    {leaveSummaries.remaining[type]}d
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Heatmap */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">
            Calendar Heatmap
          </h3>
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
        </section>

        {/* Leave Logs */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">Leave Logs</h3>

          {leaveLogEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No leave logs yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {leaveLogEntries.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between bg-gray-50 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {log.type === "public"
                        ? log.holidayDescription
                          ? `Public Holiday - ${log.holidayDescription}`
                          : "Public Holiday"
                        : `${log.type} leave`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(log.date)}
                    </p>
                  </div>
                  <span className="font-bold">{log.duration || 1}d</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <button
          onClick={() => setAllocateModalOpen(true)}
          className="px-6 py-3 rounded-full bg-gray-900 text-white font-semibold shadow-lg hover:bg-gray-800"
        >
          Allocate Leave
        </button>
        <button
          onClick={handleRemoveEmployee}
          className="px-6 py-3 rounded-full bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700"
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
