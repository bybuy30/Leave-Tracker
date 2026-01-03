import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import {
  Header,
  DateTimeBar,
  LeavePolicyCards,
  EmployeesTable,
  AddUserModal,
  FloatingActionButton,
} from '../components';
import {
  addEmployeeToFirestore,
  deleteEmployeeFromFirestore,
  subscribeToEmployees,
} from '../utils/firebaseHelpers';
import { formatEmployee, formatEmployees } from '../utils/employeeFormatter';
import { LEAVE_TYPE_ALLOCATION, TOTAL_LEAVE_ALLOCATION } from '../utils/leaveConfig';
import { useAdmin } from '../contexts/AdminContext';

function HomePage() {
  const navigate = useNavigate();
  const { adminProfile, admin } = useAdmin();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get admin's full name for greeting, fallback to displayName or default
  const adminName = adminProfile?.fullName || admin?.displayName || 'Affan';
  const adminId = admin?.uid; // Get admin UID for filtering employees

  const hydrateEmployees = useCallback((list) => {
    const formatted = formatEmployees(list);
    setEmployees(formatted);
  }, []);

  const buildOptimisticEmployee = useCallback((formData, id) => {
    return formatEmployee({
      id,
      employeeId: formData.employeeId,
      name: formData.name,
      nationality: formData.nationality,
      designation: formData.designation,
      totalLeaves: TOTAL_LEAVE_ALLOCATION,
      leaves: {
        sick: { quota: LEAVE_TYPE_ALLOCATION.sick, taken: 0 },
        casual: { quota: LEAVE_TYPE_ALLOCATION.casual, taken: 0 },
        public: { quota: LEAVE_TYPE_ALLOCATION.public, taken: 0 },
      },
      leavesUsed: 0,
      leavesRemaining: TOTAL_LEAVE_ALLOCATION,
      leaveLogs: [],
      leaveHeatmap: {},
      cycleStartDate: new Date().toISOString(), // Initialize cycle start date
    });
  }, []);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToEmployees(
        adminId,
        (data) => {
          hydrateEmployees(data);
          setLoading(false);
        },
        () => {
          setError('Failed to load employees. Please check your Firebase configuration.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Failed to subscribe to employees:', err);
      setError('Failed to load employees. Please check your Firebase configuration.');
      setLoading(false);
    }
  }, [hydrateEmployees, adminId]);

  const handleEmployeeRowClick = useCallback(
    (employee) => {
      if (!employee?.id) return;
      navigate(`/employees/${employee.id}`);
    },
    [navigate]
  );

  const handleAddEmployee = useCallback(
    async (formData) => {
      if (!adminId) {
        setError('You must be logged in to add employees.');
        throw new Error('You must be logged in to add employees.');
      }
      try {
        setError(null);
        const newId = await addEmployeeToFirestore(formData, adminId);
        setEmployees((prev) => {
          if (prev.some((employee) => employee.id === newId)) {
            return prev;
          }
          const optimisticEmployee = buildOptimisticEmployee(formData, newId);
          return [...prev, optimisticEmployee];
        });
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to add employee:', err);
        const message = err?.message || 'Failed to add employee. Please try again.';
        setError(message);
        throw new Error(message);
      }
    },
    [buildOptimisticEmployee, adminId]
  );

  const handleDeleteEmployee = useCallback(
    async (employeeId) => {
      if (!employeeId || !adminId) return;
      if (!window.confirm('Delete this employee? This action cannot be undone.')) {
        return;
      }

      try {
        setError(null);
        await deleteEmployeeFromFirestore(employeeId, adminId);
      } catch (err) {
        console.error('Failed to delete employee:', err);
        setError(err.message || 'Failed to delete employee. Please try again.');
      }
    },
    [adminId]
  );

  return (
    <div className="min-h-screen bg-[#A2A0FF]">
      <Header onAddClick={() => setIsModalOpen(true)} onSearchChange={setSearchTerm} />
      <DateTimeBar employeeName={adminName} />

      <div className="bg-[#A2A0FF]">
        <LeavePolicyCards />
        {loading ? (
          <div className="px-6 py-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                <p className="mt-4 text-gray-600">Loading employees...</p>
              </div>
            </div>
          </div>
        ) : (
          <EmployeesTable
            employees={employees}
            onRowClick={handleEmployeeRowClick}
            searchTerm={searchTerm}
            onDelete={handleDeleteEmployee}
          />
        )}
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEmployee}
      />
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />
    </div>
  );
}

export default HomePage;
