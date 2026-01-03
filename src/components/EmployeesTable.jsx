import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export const EmployeesTable = ({ employees, onRowClick, searchTerm = '', onDelete }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Filter and sort employees
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredEmployees = employees.filter((emp) => {
    const name = emp.name?.toLowerCase() || '';
    const designation = emp.designation?.toLowerCase() || '';
    return name.includes(normalizedSearch) || designation.includes(normalizedSearch);
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';

    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <ChevronDown className="w-4 h-4 text-gray-300" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 text-gray-700" />
      : <ChevronDown className="w-4 h-4 text-gray-700" />;
  };

  const calculateTotalLeavesRemaining = (employee) => {
    if (!employee.leaves) return 0;
    const sick = (employee.leaves.sick?.quota || 10) - (employee.leaves.sick?.taken || 0);
    const casual = (employee.leaves.casual?.quota || 12) - (employee.leaves.casual?.taken || 0);
    const pub = (employee.leaves.public?.quota || 12) - (employee.leaves.public?.taken || 0);
    return sick + casual + pub;
  };

  return (
    <div className="px-6 py-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <span className="text-sm text-gray-600">
            {sortedEmployees.length} employee{sortedEmployees.length !== 1 ? 's' : ''}
          </span>
        </div>

        {sortedEmployees.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No employees found</p>
            <p className="text-gray-400 text-sm mt-1">Add a new employee to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('employeeId')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      ID <SortIcon column="employeeId" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Name <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('designation')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Designation <SortIcon column="designation" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('nationality')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Nationality <SortIcon column="nationality" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('leaves')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Leaves Remaining
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-700">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{employee.employeeId}</td>
                    <td 
                      className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onRowClick?.(employee)}
                    >
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.designation}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.nationality}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {calculateTotalLeavesRemaining(employee)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onDelete?.(employee.id)}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesTable;
