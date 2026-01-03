import React from 'react';

export const FloatingActionButton = ({ onClick }) => {
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label="Add new employee"
      title="Add new employee"
    >
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};

export default FloatingActionButton;
