import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { enhancedApi } from '../services/enhanced-api';
import { apiOperationHandler } from '../services/api-operation-handler';
import type { Supplier } from '../types';
import { Button } from './ui';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  supplier?: Supplier;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, supplier }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    leadTimeDays: '',
    reliabilityScore: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          email: supplier.email,
          phone: supplier.phone,
          leadTimeDays: supplier.leadTimeDays.toString(),
          reliabilityScore: supplier.reliabilityScore.toString()
        });
      } else {
        setFormData({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          leadTimeDays: '',
          reliabilityScore: ''
        });
      }
    }
  }, [isOpen, supplier]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Supplier name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Supplier name must be at least 2 characters long';
    }

    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (formData.phone && formData.phone.trim() !== '') {
      const phoneRegex = /^[+]?[\d\s()-]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
    }

    if (formData.leadTimeDays && (parseInt(formData.leadTimeDays) < 0)) {
      newErrors.leadTimeDays = 'Lead time cannot be negative';
    }

    if (formData.reliabilityScore && formData.reliabilityScore.trim() !== '') {
      const score = parseFloat(formData.reliabilityScore);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.reliabilityScore = 'Reliability score must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        ...formData,
        leadTimeDays: parseInt(formData.leadTimeDays) || 0,
        reliabilityScore: parseFloat(formData.reliabilityScore) || 0
      };

      const result = await apiOperationHandler.handleOperation(
        async () => {
          if (supplier) {
            return await enhancedApi.patch(`/suppliers/${supplier.id}`, payload, {}, {
              maxRetries: 2,
              retryDelay: 1000
            });
          } else {
            return await enhancedApi.post('/suppliers', payload, {}, {
              maxRetries: 2,
              retryDelay: 1000
            });
          }
        },
        {
          operationName: supplier ? 'Supplier Update' : 'Supplier Creation',
          showSuccessMessage: true,
          showErrorMessage: true
        }
      );

      if (result.success) {
        onSave();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Failed to save supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (Days)</label>
            <input
              type="number"
              name="leadTimeDays"
              value={formData.leadTimeDays}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.leadTimeDays ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
            />
            {errors.leadTimeDays && (
              <p className="mt-1 text-sm text-red-600">{errors.leadTimeDays}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reliability Score (0-100)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              name="reliabilityScore"
              value={formData.reliabilityScore}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.reliabilityScore ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reliabilityScore && (
              <p className="mt-1 text-sm text-red-600">{errors.reliabilityScore}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (supplier ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
