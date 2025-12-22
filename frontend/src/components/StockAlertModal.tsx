import React, { useState, useEffect, useCallback } from 'react';
import { X, Settings } from 'lucide-react';
import { Button } from './ui';
import { itemsService } from '../services/api-services';

interface StockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  itemId?: number;
  itemName?: string;
  currentStock?: number;
}

interface AlertSettings {
  minThreshold: number;
  maxThreshold: number;
  enabled: boolean;
}

const StockAlertModal: React.FC<StockAlertModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemId,
  itemName,
  currentStock = 0
}) => {
  const [settings, setSettings] = useState<AlertSettings>({
    minThreshold: 10,
    maxThreshold: 100,
    enabled: true
  });
  const [loading, setLoading] = useState(false);

  const fetchExistingSettings = useCallback(async () => {
    try {
      if (itemId) {
        const item = await itemsService.getById(itemId);
        setSettings({
          minThreshold: item.minStockLevel || 10,
          maxThreshold: item.maxStockLevel || 100,
          enabled: true
        });
      }
    } catch (error) {
      console.error('Failed to fetch existing settings:', error);
    }
  }, [itemId]);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchExistingSettings();
    }
  }, [isOpen, itemId, fetchExistingSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!itemId) {
        alert('Item ID is required');
        return;
      }

      await itemsService.update(itemId, {
        minStockLevel: settings.minThreshold,
        maxStockLevel: settings.maxThreshold,
      });
      
      alert('Stock alert settings saved successfully!');
      onSave();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to save stock alert settings:', error);
      let errorMessage = 'Failed to save settings. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { data?: { message?: string } } };
        if (httpError.response?.data?.message) {
          errorMessage = httpError.response.data.message;
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AlertSettings, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  if (!itemId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Stock Alert Settings
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Vui lòng chọn một item từ bảng để cấu hình Stock Alert Settings.
          </p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Stock Alert Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Item:</strong> {itemName}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Current Stock:</strong> {currentStock}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Threshold
            </label>
            <input
              type="number"
              value={settings.minThreshold}
              onChange={(e) => handleChange('minThreshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Alert when stock falls below this level
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Threshold
            </label>
            <input
              type="number"
              value={settings.maxThreshold}
              onChange={(e) => handleChange('maxThreshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Alert when stock exceeds this level
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={settings.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              Enable alerts
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
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
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAlertModal;
