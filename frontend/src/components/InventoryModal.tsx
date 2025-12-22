import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { enhancedApi } from '../services/enhanced-api';
import { apiOperationHandler } from '../services/api-operation-handler';
import type { Item, InventoryBatch } from '../types';
import { Button } from './ui';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  batch?: InventoryBatch;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSave, batch }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState({
    itemId: '',
    batchNo: '',
    quantityOnHand: '',
    expiryDate: '',
    temperature: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      if (batch) {
        setFormData({
          itemId: batch.itemId.toString(),
          batchNo: batch.batchNo,
          quantityOnHand: batch.quantityOnHand.toString(),
          expiryDate: batch.expiryDate.split('T')[0],
          temperature: batch.temperature?.toString() || ''
        });
      } else {
        setFormData({
          itemId: '',
          batchNo: '',
          quantityOnHand: '',
          expiryDate: '',
          temperature: ''
        });
      }
    }
  }, [isOpen, batch]);

  const fetchItems = async () => {
    try {
      const response = await enhancedApi.get<Item[]>('/items', {}, {
        maxRetries: 2,
        retryDelay: 1000
      });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      alert('Failed to fetch items. Please refresh the page and try again.');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Please select an item';
    }

    if (!formData.batchNo || formData.batchNo.trim() === '') {
      newErrors.batchNo = 'Batch number is required';
    }

    if (!formData.quantityOnHand) {
      newErrors.quantityOnHand = 'Quantity is required';
    } else {
      const quantity = parseInt(formData.quantityOnHand);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantityOnHand = 'Quantity must be greater than 0';
      }
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate <= today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    if (formData.temperature && formData.temperature.trim() !== '') {
      const temp = parseFloat(formData.temperature);
      if (isNaN(temp)) {
        newErrors.temperature = 'Temperature must be a valid number';
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
        itemId: parseInt(formData.itemId),
        batchNo: formData.batchNo,
        quantityOnHand: parseInt(formData.quantityOnHand),
        expiryDate: formData.expiryDate,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined
      };

      const result = await apiOperationHandler.handleOperation(
        async () => {
          if (batch) {
            return await enhancedApi.patch(`/inventory-batches/${batch.id}`, payload, {}, {
              maxRetries: 2,
              retryDelay: 1000
            });
          } else {
            return await enhancedApi.post('/inventory-batches', payload, {}, {
              maxRetries: 2,
              retryDelay: 1000
            });
          }
        },
        {
          operationName: batch ? 'Inventory Update' : 'Inventory Creation',
          showSuccessMessage: true,
          showErrorMessage: true
        }
      );

      if (result.success) {
        onSave();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Failed to save inventory batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <h2 className="text-xl font-semibold">{batch ? 'Update Stock' : 'Add Stock'}</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.itemId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.itemName} ({item.sku})</option>
              ))}
            </select>
            {errors.itemId && (
              <p className="mt-1 text-sm text-red-600">{errors.itemId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.batchNo ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.batchNo && (
              <p className="mt-1 text-sm text-red-600">{errors.batchNo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              name="quantityOnHand"
              value={formData.quantityOnHand}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.quantityOnHand ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
              required
            />
            {errors.quantityOnHand && (
              <p className="mt-1 text-sm text-red-600">{errors.quantityOnHand}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.expiryDate ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.temperature ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Optional"
            />
            {errors.temperature && (
              <p className="mt-1 text-sm text-red-600">{errors.temperature}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (batch ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
