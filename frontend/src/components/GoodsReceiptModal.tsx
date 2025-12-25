import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { goodsReceiptsService } from '../services/api-services';
import { useAuth } from '../context/useAuth';
import type { PurchaseOrder, PurchaseOrderItem } from '../types';
import { Button } from './ui';

interface GoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder;
  onSuccess: () => void;
}

interface GRNItem {
  itemId: number;
  itemName: string;
  orderedQty: number;
  batchNo: string;
  expiryDate: string;
  receivedQty: number;
  temperature?: string;
}

const GoodsReceiptModal: React.FC<GoodsReceiptModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);
  const [receivedDate, setReceivedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  useEffect(() => {
    if (isOpen && purchaseOrder) {
      console.log('Purchase Order received in modal:', purchaseOrder);
      
      // Check if PO has items
      if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
        console.error('Purchase Order has no items:', purchaseOrder);
        alert('Purchase Order has no items. Please check again.');
        onClose();
        return;
      }

      // Function to generate batch number from SKU and current date
      const generateBatchNo = (sku: string): string => {
        if (!sku || sku.length === 0) {
          return '';
        }
        // Get first 3 characters of SKU (uppercase)
        const skuPrefix = sku.substring(0, 3).toUpperCase();
        // Format current date: ddMMyyyy
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateStr = `${day}${month}${year}`;
        // Format: SKU_PREFIX - ddMMyyyy
        return `${skuPrefix}-${dateStr}`;
      };

      // Initialize GRN items from PO items
      const items: GRNItem[] = purchaseOrder.items.map((poItem: PurchaseOrderItem) => {
        // Ensure itemId and quantity exist
        if (!poItem.itemId || !poItem.quantity) {
          console.error('PO Item missing information:', poItem);
        }
        
        // Get item name from relation or fallback
        let itemName = `Item ${poItem.itemId}`;
        let sku = '';
        if (poItem.item) {
          itemName = poItem.item.itemName || itemName;
          sku = poItem.item.sku || '';
        }
        
        // Auto-generate batch number from SKU
        const batchNo = generateBatchNo(sku);
        
        return {
          itemId: poItem.itemId,
          itemName: itemName,
          orderedQty: poItem.quantity,
          batchNo: batchNo,
          expiryDate: '',
          receivedQty: poItem.quantity, // Default to receive full ordered quantity
          temperature: '',
        };
      });
      
      console.log('GRN Items initialized:', items);
      console.log('Number of items:', items.length);
      setGrnItems(items);
      setReceivedDate(format(new Date(), 'yyyy-MM-dd'));
      setErrors({});
    } else if (isOpen && !purchaseOrder) {
      console.error('Purchase Order is null or undefined');
      alert('No Purchase Order information. Please try again.');
      onClose();
    }
  }, [isOpen, purchaseOrder, onClose]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!receivedDate) {
      newErrors.receivedDate = 'Received date is required';
    }

    grnItems.forEach((item, index) => {
      if (!item.batchNo || !item.batchNo.trim()) {
        newErrors[`batchNo_${index}`] = 'Batch number is required';
      }
      if (!item.expiryDate) {
        newErrors[`expiryDate_${index}`] = 'Expiry date is required';
      }
      if (!item.receivedQty || item.receivedQty <= 0) {
        newErrors[`receivedQty_${index}`] = 'Received quantity must be greater than 0';
      }
      if (item.receivedQty > item.orderedQty) {
        newErrors[`receivedQty_${index}`] = 'Received quantity cannot exceed ordered quantity';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleItemChange = (index: number, field: keyof GRNItem, value: string | number) => {
    const updatedItems = [...grnItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setGrnItems(updatedItems);
    // Clear error for this field when user changes it
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      alert('Unable to identify user. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const grnData = {
        poId: purchaseOrder.id,
        receivedDate: new Date(receivedDate).toISOString(),
        receivedBy: user.id,
        items: grnItems.map((item) => ({
          itemId: item.itemId,
          batchNo: item.batchNo.trim(),
          expiryDate: new Date(item.expiryDate).toISOString(),
          receivedQty: item.receivedQty,
          temperature: item.temperature ? parseFloat(item.temperature) : undefined,
        })),
      };

      await goodsReceiptsService.create(grnData);
      alert('GRN created successfully! The system has automatically created inventory batches and transactions.');
      onSuccess();
    } catch (error: unknown) {
      console.error('Failed to create GRN:', error);
      const httpError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        httpError.response?.data?.message || 'Unable to create GRN. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Goods Receipt Note (GRN)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PO Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Purchase Order Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">PO Number:</span> {purchaseOrder.poNumber}
            </div>
            <div>
              <span className="font-medium">Supplier:</span>{' '}
              {purchaseOrder.supplier?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Store:</span>{' '}
              {purchaseOrder.store?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Order Date:</span>{' '}
              {format(new Date(purchaseOrder.orderDate), 'dd/MM/yyyy')}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Received Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => {
                setReceivedDate(e.target.value);
                if (errors.receivedDate) {
                  const newErrors = { ...errors };
                  delete newErrors.receivedDate;
                  setErrors(newErrors);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.receivedDate ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.receivedDate && (
              <p className="mt-1 text-sm text-red-500">{errors.receivedDate}</p>
            )}
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-2">Received Items Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Ordered Qty
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Batch No <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Expiry Date <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Received Qty <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Temperature (°C)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grnItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                        No items in Purchase Order. Please check again.
                      </td>
                    </tr>
                  ) : (
                    grnItems.map((item, index) => (
                      <tr key={`${item.itemId}-${index}`}>
                        <td className="px-4 py-2 text-sm">{item.itemName}</td>
                        <td className="px-4 py-2 text-sm">{item.orderedQty}</td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.batchNo}
                            onChange={(e) =>
                              handleItemChange(index, 'batchNo', e.target.value)
                            }
                            className={`w-full px-2 py-1 border rounded ${
                              errors[`batchNo_${index}`]
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                          {errors[`batchNo_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`batchNo_${index}`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) =>
                              handleItemChange(index, 'expiryDate', e.target.value)
                            }
                            className={`w-full px-2 py-1 border rounded ${
                              errors[`expiryDate_${index}`]
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                          {errors[`expiryDate_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`expiryDate_${index}`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            max={item.orderedQty}
                            value={item.receivedQty}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'receivedQty',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-full px-2 py-1 border rounded ${
                              errors[`receivedQty_${index}`]
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                          {errors[`receivedQty_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`receivedQty_${index}`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={item.temperature || ''}
                            onChange={(e) =>
                              handleItemChange(index, 'temperature', e.target.value)
                            }
                            placeholder="Temperature"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buttons */}
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
              {loading ? 'Creating...' : 'Create GRN'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoodsReceiptModal;

