import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminService, itemsService, storesService } from '../services/api-services';
import type { Item, Store } from '../types';

interface AdminAdjustInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AdminAdjustInventoryModal: React.FC<AdminAdjustInventoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    storeId: '',
    batchNo: '',
    quantityChange: '',
    expiryDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchStores();
      // Reset form
      setFormData({
        itemId: '',
        storeId: '',
        batchNo: '',
        quantityChange: '',
        expiryDate: '',
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      const allItems = await itemsService.getAll();
      setItems(allItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const allStores = await storesService.getAll();
      setStores(allStores);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Item is required';
    }
    if (!formData.storeId) {
      newErrors.storeId = 'Store is required';
    }
    if (!formData.batchNo || formData.batchNo.trim() === '') {
      newErrors.batchNo = 'Batch No is required';
    }
    if (!formData.quantityChange || formData.quantityChange === '0') {
      newErrors.quantityChange = 'Quantity change is required and cannot be zero';
    } else {
      const qty = parseInt(formData.quantityChange);
      if (isNaN(qty)) {
        newErrors.quantityChange = 'Quantity change must be a valid number';
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
      const quantityChange = parseInt(formData.quantityChange);
      
      await adminService.adjustInventory({
        itemId: parseInt(formData.itemId),
        storeId: parseInt(formData.storeId),
        batchNo: formData.batchNo.trim(),
        quantityChange,
        expiryDate: formData.expiryDate || undefined,
        notes: formData.notes || undefined,
      });

      alert('Inventory adjusted successfully!');
      onSave();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to adjust inventory:', error);
      let errorMessage = 'Failed to adjust inventory. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number; data?: { message?: string } } };
        if (httpError.response?.data?.message) {
          errorMessage = httpError.response.data.message;
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Adjust Inventory (Admin)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            {itemsLoading ? (
              <div className="text-sm text-gray-500">Loading items...</div>
            ) : (
              <select
                name="itemId"
                value={formData.itemId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.itemId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.itemName} ({item.sku})
                  </option>
                ))}
              </select>
            )}
            {errors.itemId && <p className="text-xs text-red-500 mt-1">{errors.itemId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store <span className="text-red-500">*</span>
            </label>
            <select
              name="storeId"
              value={formData.storeId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.storeId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} ({store.code})
                </option>
              ))}
            </select>
            {errors.storeId && <p className="text-xs text-red-500 mt-1">{errors.storeId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.batchNo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter batch number"
            />
            {errors.batchNo && <p className="text-xs text-red-500 mt-1">{errors.batchNo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Change <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantityChange"
              value={formData.quantityChange}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.quantityChange ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Positive to increase, negative to decrease"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use positive number to increase, negative number to decrease inventory
            </p>
            {errors.quantityChange && <p className="text-xs text-red-500 mt-1">{errors.quantityChange}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required when creating a new batch
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this adjustment"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adjusting...' : 'Adjust Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAdjustInventoryModal;

