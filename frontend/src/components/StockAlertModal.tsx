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
  groupedItems?: Array<{ item: { id: number; itemName: string; sku: string }; totalQuantity: number }>;
}

interface AlertSettings {
  minThreshold: number;
  maxThreshold: number;
  safetyStock: number;
  enabled: boolean;
}

const StockAlertModal: React.FC<StockAlertModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemId,
  itemName,
  currentStock,
  groupedItems
}) => {
  const [settings, setSettings] = useState<AlertSettings>({
    minThreshold: 10,
    maxThreshold: 100,
    safetyStock: 0,
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<{ id: number; itemName: string; sku: string }>>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(itemId || null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItemStock, setSelectedItemStock] = useState<number | undefined>(currentStock);

  const fetchItems = useCallback(async () => {
    try {
      setItemsLoading(true);
      const allItems = await itemsService.getAll();
      setItems(allItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const fetchExistingSettings = useCallback(async (id: number) => {
    try {
      const item = await itemsService.getById(id);
      setSettings({
        minThreshold: item.minStockLevel || 10,
        maxThreshold: item.maxStockLevel || 100,
        safetyStock: item.safetyStock || 0,
        enabled: true
      });
    } catch (error) {
      console.error('Failed to fetch existing settings:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (!itemId) {
        fetchItems();
      } else {
        setSelectedItemId(itemId);
        fetchExistingSettings(itemId);
      }
    }
  }, [isOpen, itemId, fetchItems, fetchExistingSettings]);

  useEffect(() => {
    if (selectedItemId) {
      fetchExistingSettings(selectedItemId);
      // Get current stock from groupedItems if available
      if (groupedItems) {
        const groupedItem = groupedItems.find(gi => gi.item.id === selectedItemId);
        if (groupedItem) {
          setSelectedItemStock(groupedItem.totalQuantity);
        }
      }
    }
  }, [selectedItemId, fetchExistingSettings, groupedItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targetItemId = selectedItemId || itemId;
      if (!targetItemId) {
        alert('Please select an item');
        return;
      }

      await itemsService.update(targetItemId, {
        minStockLevel: settings.minThreshold,
        maxStockLevel: settings.maxThreshold,
        safetyStock: settings.safetyStock || undefined,
      });
      
      alert('Stock alert settings saved successfully!');
      onSave();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to save stock alert settings:', error);
      let errorMessage = 'Failed to save settings. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number; data?: { message?: string } } };
        if (httpError.response?.status === 403) {
          errorMessage = 'Access denied. Please check your permissions or try logging in again.';
        } else if (httpError.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (httpError.response?.data?.message) {
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

  if (!itemId && !selectedItemId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            Please select an item from the list to configure Stock Alert Settings.
          </p>
          {itemsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No items found</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                    selectedItemId === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{item.itemName}</div>
                  <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
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
            <strong>Item:</strong> {itemName || items.find(i => i.id === selectedItemId)?.itemName || 'N/A'}
          </p>
          {(currentStock !== undefined || selectedItemStock !== undefined) && (
            <p className="text-sm text-blue-800">
              <strong>Current Stock:</strong> {currentStock !== undefined ? currentStock : selectedItemStock}
            </p>
          )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Safety Stock
            </label>
            <input
              type="number"
              value={settings.safetyStock}
              onChange={(e) => handleChange('safetyStock', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generate stock request when stock falls below this level. Leave empty to auto-calculate.
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
