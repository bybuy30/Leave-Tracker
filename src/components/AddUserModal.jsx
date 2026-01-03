import React, { useState } from 'react';
import { X } from 'lucide-react';

export const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    nationality: '',
    designation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  React.useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    } else if (formData.designation.trim().length < 2) {
      newErrors.designation = 'Designation must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      await onSubmit({
        employeeId: formData.employeeId.trim(),
        name: formData.name.trim(),
        nationality: formData.nationality.trim(),
        designation: formData.designation.trim(),
      });
      setLoading(false);
      setSuccessMessage('✓ Employee added successfully!');
      
      // Reset form immediately
      setFormData({ employeeId: '', name: '', nationality: '', designation: '' });
      setErrors({});
      
      // Close modal after brief success message
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 1200);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add employee. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="fade-in bg-white rounded-lg shadow-xl max-w-md w-full z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
            <h2 className="text-xl font-bold">Add New Employee</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP001"
                className={`input-field ${errors.employeeId ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
              {errors.employeeId && (
                <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Affan Khadir"
                className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="e.g. India"
                className={`input-field ${errors.nationality ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
              {errors.nationality && (
                <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className={`input-field ${errors.designation ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
              {errors.designation && (
                <p className="text-red-500 text-xs mt-1">{errors.designation}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Adding...
                  </>
                ) : (
                  'Add Employee'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUserModal;
