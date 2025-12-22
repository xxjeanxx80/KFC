import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { enhancedApi } from '../services/enhanced-api';
import { apiOperationHandler } from '../services/api-operation-handler';
import type { Supplier, Item } from '../types';
import { Button } from './ui';

interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface OrderItem {
  itemId: string;
  quantity: string;
  unitPrice: string;
}

const ProcurementModal: React.FC<ProcurementModalProps> = ({ isOpen, onClose, onSave }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: ''
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { itemId: '', quantity: '', unitPrice: '' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchItems();
      setFormData({
        supplierId: '',
        expectedDeliveryDate: ''
      });
      setOrderItems([{ itemId: '', quantity: '', unitPrice: '' }]);
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const response = await enhancedApi.get<Supplier[]>('/suppliers', {}, {
        maxRetries: 2,
        retryDelay: 1000
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      alert('Failed to fetch suppliers. Please refresh the page and try again.');
    }
  };

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Please select a supplier';
    }

    if (!formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    } else {
      const expectedDate = new Date(formData.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expectedDate <= today) {
        newErrors.expectedDeliveryDate = 'Expected delivery date must be in the future';
      }
    }

    const validItems = orderItems.filter(item => 
      item.itemId && item.quantity && item.unitPrice
    );

    if (validItems.length === 0) {
      newErrors.items = 'Please add at least one item to the order';
    }

    orderItems.forEach((item, index) => {
      if (item.quantity && (parseInt(item.quantity) <= 0)) {
        newErrors[`quantity_${index}`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice && (parseFloat(item.unitPrice) <= 0)) {
        newErrors[`unitPrice_${index}`] = 'Unit price must be greater than 0';
      }
    });

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
      const validItems = orderItems.filter(item => 
        item.itemId && item.quantity && item.unitPrice
      );

      const totalAmount = validItems.reduce((total, item) => {
        return total + (parseInt(item.quantity) * parseFloat(item.unitPrice));
      }, 0);

      const payload = {
        poNumber: `PO-${Date.now()}`,
        supplierId: parseInt(formData.supplierId),
        storeId: 1, // Default store ID, should be from user context
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: formData.expectedDeliveryDate,
        orderItems: validItems.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          unit: 'pcs' // Default unit
        })),
        totalAmount: totalAmount,
        status: 'pending_approval',
        notes: ''
      };

      console.log('Creating PO with payload:', payload);
      
      const result = await apiOperationHandler.handleOperation(
        () => enhancedApi.post('/procurement', payload, {}, {
          maxRetries: 2,
          retryDelay: 1500,
          onRetry: (error: unknown, attempt: number) => {
            console.warn(`Retry attempt ${attempt} for purchase order creation`, error);
          }
        }),
        {
          operationName: 'Purchase Order Creation',
          showSuccessMessage: true,
          showErrorMessage: true
        }
      );

      if (result.success) {
        onSave();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Failed to create purchase order:', error);
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

  const handleItemChange = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { itemId: '', quantity: '', unitPrice: '' }]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      if (item.quantity && item.unitPrice) {
        return total + (parseInt(item.quantity) * parseFloat(item.unitPrice));
      }
      return total;
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Purchase Order</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.supplierId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            {errors.supplierId && (
              <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
            <input
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.expectedDeliveryDate ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.expectedDeliveryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expectedDeliveryDate}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Order Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-primary hover:text-blue-700 text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Item</label>
                    <select
                      value={item.itemId}
                      onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors[`itemId_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map(itm => (
                        <option key={itm.id} value={itm.id}>{itm.itemName} ({itm.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="1"
                      required
                    />
                    {errors[`quantity_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`quantity_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors[`unitPrice_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0.01"
                      required
                    />
                    {errors[`unitPrice_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`unitPrice_${index}`]}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 mb-2"
                    disabled={orderItems.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create PO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcurementModal;
