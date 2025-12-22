import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { salesService } from '../services/api-services';
import { enhancedApi } from '../services/enhanced-api';
import type { Item, InventoryBatch } from '../types';
import { Button } from './ui';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  storeId?: number;
}

const SalesModal: React.FC<SalesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  storeId,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableQuantities, setAvailableQuantities] = useState<Record<number, number>>({});
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    unitPrice: '',
    saleDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      // Reset form
      setFormData({
        itemId: '',
        quantity: '',
        unitPrice: '',
        saleDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formData.itemId && storeId) {
      fetchAvailableQuantity(parseInt(formData.itemId));
    }
  }, [isOpen, formData.itemId, storeId]);

  const fetchItems = async () => {
    try {
      const response = await enhancedApi.get<Item[]>('/items', {}, {
        maxRetries: 2,
        retryDelay: 1000
      });
      setItems(response.data.filter(item => item.isActive !== false));
    } catch (error) {
      console.error('Failed to fetch items:', error);
      alert('Không thể tải danh sách items. Vui lòng thử lại.');
    }
  };

  const fetchAvailableQuantity = async (itemId: number) => {
    if (!storeId) return;
    
    try {
      const response = await enhancedApi.get<InventoryBatch[]>(
        '/inventory-batches',
        {},
        { maxRetries: 2, retryDelay: 1000 }
      );
      const batches = (response.data || []) as Array<InventoryBatch & { storeId?: number }>;
      // Filter batches by itemId and storeId, then sum quantityOnHand for in_stock batches
      const totalAvailable = batches
        .filter(batch => 
          batch.itemId === itemId && 
          (batch.storeId === storeId || !batch.storeId) && 
          batch.status === 'in_stock'
        )
        .reduce((sum, batch) => sum + batch.quantityOnHand, 0);
      setAvailableQuantities(prev => ({
        ...prev,
        [itemId]: totalAvailable,
      }));
    } catch (error) {
      console.error('Failed to fetch available quantity:', error);
      setAvailableQuantities(prev => ({
        ...prev,
        [itemId]: 0,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Vui lòng chọn item';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    } else {
      const qty = parseFloat(formData.quantity);
      const itemId = parseInt(formData.itemId);
      const available = availableQuantities[itemId] || 0;
      if (qty > available) {
        newErrors.quantity = `Không đủ hàng tồn kho. Số lượng có sẵn: ${available}`;
      }
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Giá bán phải lớn hơn 0';
    }

    if (!formData.saleDate) {
      newErrors.saleDate = 'Vui lòng chọn ngày bán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!storeId) {
      alert('Không thể xác định store. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);

    try {
      await salesService.create({
        storeId,
        itemId: parseInt(formData.itemId),
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        saleDate: new Date(formData.saleDate).toISOString(),
        notes: formData.notes || undefined,
      });

      alert('Tạo sales transaction thành công!');
      onSave();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create sales:', error);
      let errorMessage = 'Không thể tạo sales transaction. Vui lòng thử lại.';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  const selectedItemId = formData.itemId ? parseInt(formData.itemId) : null;
  const availableQty = selectedItemId ? (availableQuantities[selectedItemId] || 0) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
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
                  <h3 className="text-sm font-medium text-red-800">Vui lòng sửa các lỗi sau:</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            <select
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.itemId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Chọn item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id.toString()}>
                  {item.itemName} ({item.sku})
                </option>
              ))}
            </select>
            {errors.itemId && (
              <p className="mt-1 text-sm text-red-500">{errors.itemId}</p>
            )}
            {selectedItemId && availableQty !== null && (
              <p className="mt-1 text-sm text-gray-500">
                Số lượng có sẵn: <span className="font-medium">{availableQty}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              min="0"
              step="1000"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.unitPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.unitPrice && (
              <p className="mt-1 text-sm text-red-500">{errors.unitPrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="saleDate"
              value={formData.saleDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.saleDate ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.saleDate && (
              <p className="mt-1 text-sm text-red-500">{errors.saleDate}</p>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ghi chú về giao dịch bán hàng..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Create Sale'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesModal;

