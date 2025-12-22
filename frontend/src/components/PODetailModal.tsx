import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { PurchaseOrder } from '../types';
import { Badge } from './ui';
import { enhancedApi } from '../services/enhanced-api';

interface PODetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  poId: number | null;
}

const PODetailModal: React.FC<PODetailModalProps> = ({ isOpen, onClose, poId }) => {
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && poId) {
      fetchPODetails();
    } else {
      setPo(null);
      setError(null);
    }
  }, [isOpen, poId]);

  const fetchPODetails = async () => {
    if (!poId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await enhancedApi.get<PurchaseOrder>(`/procurement/${poId}`, {}, { maxRetries: 2, retryDelay: 1000 });
      setPo(response.data);
    } catch (err) {
      console.error('Failed to fetch PO details:', err);
      setError('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'delivered': return 'success';
      case 'pending_approval': return 'warning';
      case 'sent': return 'info';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-gray-900">Purchase Order Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading purchase order details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchPODetails}
                className="text-primary hover:text-blue-700 font-medium"
              >
                Retry
              </button>
            </div>
          ) : po ? (
            <>
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">PO Number</label>
                    <p className="text-lg font-semibold text-gray-900">{po.poNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge variant={getStatusVariant(po.status)}>
                        {po.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Supplier</label>
                    <p className="text-gray-900">{po.supplier?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Store</label>
                    <p className="text-gray-900">{po.store?.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Date</label>
                    <p className="text-gray-900">
                      {format(new Date(po.orderDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expected Delivery</label>
                    <p className="text-gray-900">
                      {po.expectedDeliveryDate 
                        ? format(new Date(po.expectedDeliveryDate), 'MMM d, yyyy')
                        : 'Not set'}
                    </p>
                  </div>
                  {po.actualDeliveryDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Actual Delivery</label>
                      <p className="text-gray-900">
                        {format(new Date(po.actualDeliveryDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-xl font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Info */}
              {(po.approvedBy || po.rejectionReason) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Approval Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {po.approvedBy && po.approvedAt && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Approved By</label>
                          <p className="text-gray-900">User ID: {po.approvedBy}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Approved At</label>
                          <p className="text-gray-900">
                            {format(new Date(po.approvedAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </>
                    )}
                    {po.rejectionReason && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                        <p className="text-gray-900 bg-red-50 border border-red-200 rounded-md p-3 mt-1">
                          {po.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {po.items && po.items.length > 0 ? (
                        po.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.item?.itemName || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {item.item?.sku || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalAmount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          Grand Total:
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {po.notes && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-200 rounded-md p-3 mt-1">
                    {po.notes}
                  </p>
                </div>
              )}

              {po.supplierNotes && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-sm font-medium text-gray-500">Supplier Notes</label>
                  <p className="text-gray-900 bg-blue-50 border border-blue-200 rounded-md p-3 mt-1">
                    {po.supplierNotes}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PODetailModal;

