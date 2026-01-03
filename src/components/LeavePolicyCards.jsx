import React from 'react';

const leaveTypeColors = {
  sick: { bg: 'bg-red-50', dot: 'bg-red-500' },
  casual: { bg: 'bg-blue-50', dot: 'bg-blue-500' },
  public: { bg: 'bg-green-50', dot: 'bg-green-500' },
};

export const LeavePolicyCards = () => {
  // Static company leave policy - constant values
  const leavePolicy = {
    sick: 3,
    casual: 20,
    public: 12,
  };

  const totalAllowed = leavePolicy.sick + leavePolicy.casual + leavePolicy.public;

  const LeaveCard = ({ type, title, days }) => {
    const colors = leaveTypeColors[type];

    return (
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{days}</p>
              <p className="text-sm text-gray-600">days</p>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 py-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Company Leave Policy</h2>
        
        {/* Total Allowed Leaves Card */}
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">Total Allowed</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">{totalAllowed}</p>
                <p className="text-lg text-gray-600">days per year</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 mb-1">Company Standard</p>
              <p className="text-3xl font-bold text-blue-600">100%</p>
            </div>
          </div>
        </div>

        {/* Leave Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeaveCard type="sick" title="Sick Leaves" days={leavePolicy.sick} />
          <LeaveCard type="casual" title="Casual Leaves" days={leavePolicy.casual} />
          <LeaveCard type="public" title="Public Holidays" days={leavePolicy.public} />
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyCards;
