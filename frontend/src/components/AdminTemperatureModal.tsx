import React, { useState, useEffect } from 'react';
import { X, Thermometer } from 'lucide-react';
import { Button } from './ui';
import { adminService } from '../services/api-services';
import type { InventoryBatch } from '../types';

interface AdminTemperatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch?: InventoryBatch | null;
  batches?: InventoryBatch[];
}

const AdminTemperatureModal: React.FC<AdminTemperatureModalProps> = ({
  isOpen,
  onClose,
  batch,
  batches = [],
}) => {
  const [formData, setFormData] = useState({
    batchId: '',
    temperature: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (batch) {
        setFormData({
          batchId: batch.id.toString(),
          temperature: batch.temperature?.toString() || '',
        });
      } else {
        setFormData({
          batchId: '',
          temperature: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, batch]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.batchId) {
      newErrors.batchId = 'Batch is required';
    }
    if (!formData.temperature || isNaN(parseFloat(formData.temperature))) {
      newErrors.temperature = 'Temperature is required and must be a number';
    } else {
      const temp = parseFloat(formData.temperature);
      if (temp < -30 || temp > 50) {
        newErrors.temperature = 'Temperature must be between -30°C and 50°C';
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
      await adminService.setTemperature({
        batchId: parseInt(formData.batchId),
        temperature: parseFloat(formData.temperature),
      });
      alert('Temperature set successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to set temperature:', error);
      alert(`Failed to set temperature: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectedBatch = batches.find(b => b.id.toString() === formData.batchId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Thermometer className="w-6 h-6 mr-2 text-gray-600" />
            Set Temperature
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Set temperature for a batch. This will override the simulator for 1 minute.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-1">
              Batch
            </label>
            <select
              id="batchId"
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              disabled={!!batch}
              className={`w-full px-3 py-2 border ${
                errors.batchId ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                batch ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select a batch</option>
              {batches
                .filter(b => b.quantityOnHand > 0)
                .map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batchNo} - {b.item?.itemName || 'N/A'} ({b.temperature?.toFixed(1) || 'N/A'}°C)
                  </option>
                ))}
            </select>
            {errors.batchId && <p className="text-red-500 text-xs mt-1">{errors.batchId}</p>}
          </div>

          {selectedBatch && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-600 mb-1">Item: {selectedBatch.item?.itemName}</p>
              <p className="text-xs text-gray-600 mb-1">SKU: {selectedBatch.item?.sku}</p>
              <p className="text-xs text-gray-600 mb-1">
                Storage Type: {selectedBatch.item?.storageType === 'frozen' ? 'Frozen' : 'Cold'}
              </p>
              {selectedBatch.item && (
                <p className="text-xs text-gray-600">
                  Range:{' '}
                  {selectedBatch.item.storageType === 'frozen'
                    ? `${selectedBatch.item.minTemperature ?? -18}°C - ${selectedBatch.item.maxTemperature ?? -15}°C`
                    : `${selectedBatch.item.minTemperature ?? 2}°C - ${selectedBatch.item.maxTemperature ?? 8}°C`}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              id="temperature"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              step="0.1"
              min="-30"
              max="50"
              className={`w-full px-3 py-2 border ${
                errors.temperature ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter temperature"
            />
            {errors.temperature && (
              <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Setting...' : 'Set Temperature'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTemperatureModal;

