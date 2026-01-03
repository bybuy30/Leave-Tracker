import React, { useState, useEffect } from 'react';
import { Search, Settings, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

export const Header = ({ onAddClick, onSearchChange }) => {
  const navigate = useNavigate();
  const { logout } = useAdmin();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin-auth');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Company Name */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">Leave Tracker</h1>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-grow max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input
                type="text"
                placeholder="Search employee name..."
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="input-field pl-10 bg-black text-white placeholder-gray-300 border-gray-500 focus:border-white"
                aria-label="Search employees"
              />
            </div>
          </div>

          {/* Right Section - Settings + Leaves Tab + Logout */}
          <div className="flex items-center gap-3">
            <button
              className="btn-icon"
              aria-label="Settings"
              title="Settings (UI placeholder)"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 rounded-lg transition-colors">
              Leaves
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;