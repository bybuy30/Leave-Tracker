import React, { useState } from 'react';
import { X, Calendar, BarChart3 } from 'lucide-react';
import { leaveTypeColors } from '../data/mockData';

export const ProfileDrawer = ({ employee, isOpen, onClose, onAllocateLeave, onRemoveEmployee }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !employee) return null;

  const getLeaveTakenStats = () => {
    const stats = {
      sick: employee.leaveBreakdown?.sick?.used || 0,
      casual: employee.leaveBreakdown?.casual?.used || 0,
      public: employee.leaveBreakdown?.public?.used || 0,
    };
    return stats;
  };

  const leaveTaken = getLeaveTakenStats();
  const maxLeaveValue = Math.max(leaveTaken.sick, leaveTaken.casual, leaveTaken.public) || 1;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="slide-in-right fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Employee Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Avatar and Basic Info */}
          <div className="text-center mb-8">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-100"
            />
            <h3 className="text-2xl font-bold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{employee.designation}</p>
            <p className="text-sm text-gray-500 mt-1">{employee.country}</p>
            <p className="text-xs text-gray-400 mt-2 font-mono">{employee.id}</p>
          </div>

          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            <div className="card">
              <p className="text-xs text-gray-600 mb-1">Total Leaves</p>
              <p className="text-3xl font-bold text-gray-900">{employee.totalLeaves}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card">
                <p className="text-xs text-gray-600 mb-1">Used</p>
                <p className="text-2xl font-bold text-red-600">{employee.leavesUsed}</p>
              </div>
              <div className="card">
                <p className="text-xs text-gray-600 mb-1">Remaining</p>
                <p className="text-2xl font-bold text-green-600">{employee.leavesRemaining}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'breakdown'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Breakdown
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'logs'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Logs
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4 mb-8">
              {/* Leave Taken Chart */}
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Leave Utilization
              </h4>
              <div className="space-y-3">
                {Object.entries(leaveTaken).map(([type, value]) => {
                  const colors = leaveTypeColors[type];
                  const percentage = (value / maxLeaveValue) * 100;
                  const labels = {
                    casual: 'Casual',
                    sick: 'Sick',
                    public: 'Public',
                  };
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{labels[type]}</span>
                        <span className="text-xs font-semibold text-gray-900">{value}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${colors.dot}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="space-y-4 mb-8">
              <h4 className="font-semibold text-gray-900">Leave Type Breakdown</h4>
              {['casual', 'sick', 'public'].map(type => {
                const breakdown = employee.leaveBreakdown?.[type];
                const colors = leaveTypeColors[type];
                const labels = {
                  casual: 'Casual Leaves',
                  sick: 'Sick Leaves',
                  public: 'Public Holidays',
                };
                if (!breakdown) return null;
                return (
                  <div key={type} className={`card ${colors.bg}`}>
                    <p className={`text-sm font-semibold ${colors.text} mb-2`}>{labels[type]}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-600">Used</p>
                        <p className="text-lg font-bold text-gray-900">{breakdown.used}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Remaining</p>
                        <p className="text-lg font-bold text-gray-900">{breakdown.remaining}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg font-bold text-gray-900">{breakdown.total}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3 mb-8">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Leave Logs
              </h4>
              {employee.leaveLogs && employee.leaveLogs.length > 0 ? (
                <div className="space-y-2">
                  {employee.leaveLogs.map((log, idx) => {
                    const colors = leaveTypeColors[log.type];
                    return (
                      <div key={idx} className={`card ${colors.bg}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-xs font-semibold ${colors.text}`}>
                              {log.type.charAt(0).toUpperCase() + log.type.slice(1)} Leave
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{log.date}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-700">{log.duration}d</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4">No leave logs available</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 border-t border-gray-200 pt-6">
            <button
              onClick={() => onAllocateLeave?.(employee)}
              className="btn-primary w-full"
              title="Allocate leave (UI placeholder - Firebase integration needed)"
            >
              Allocate Leave
            </button>
            <button
              onClick={() => onRemoveEmployee?.(employee.id)}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              title="Remove employee (UI placeholder - Firebase integration needed)"
            >
              Remove Employee
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;
