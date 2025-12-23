import React from 'react';
import { X, Thermometer, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { InventoryBatch, Item } from '../types';

interface GroupedInventoryItem {
  item: Item;
  totalQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'full_stock';
  batches: InventoryBatch[];
}

interface BatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupedItem: GroupedInventoryItem;
}

const BatchDetailModal: React.FC<BatchDetailModalProps> = ({ isOpen, onClose, groupedItem }) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
      'in_stock': { label: 'IN STOCK', bg: 'bg-green-100', text: 'text-green-800' },
      'low_stock': { label: 'LOW STOCK', bg: 'bg-orange-100', text: 'text-orange-800' },
      'out_of_stock': { label: 'OUT OF STOCK', bg: 'bg-red-100', text: 'text-red-800' },
      'full_stock': { label: 'FULL STOCK', bg: 'bg-blue-100', text: 'text-blue-800' },
      'expired': { label: 'EXPIRED', bg: 'bg-red-100', text: 'text-red-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status.toUpperCase(), bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getTemperatureStatus = (batch: InventoryBatch): { status: 'ok' | 'warning' | 'alert'; color: string; icon: React.ReactNode } => {
    if (!batch.item || batch.temperature === null || batch.temperature === undefined) {
      return { status: 'ok', color: 'text-gray-500', icon: <Thermometer className="w-4 h-4" /> };
    }

    const item = batch.item;
    const storageType = item.storageType || 'cold';
    const minTemp = item.minTemperature ?? (storageType === 'frozen' ? -18 : 2);
    const maxTemp = item.maxTemperature ?? (storageType === 'frozen' ? -15 : 8);
    const currentTemp = batch.temperature;

    if (currentTemp < minTemp || currentTemp > maxTemp) {
      const diff = currentTemp < minTemp ? minTemp - currentTemp : currentTemp - maxTemp;
      if (diff > 5) {
        return { status: 'alert', color: 'text-red-600', icon: <XCircle className="w-4 h-4" /> };
      }
      return { status: 'warning', color: 'text-yellow-600', icon: <AlertTriangle className="w-4 h-4" /> };
    }

    const nearMin = Math.abs(currentTemp - minTemp) <= 1;
    const nearMax = Math.abs(currentTemp - maxTemp) <= 1;
    if (nearMin || nearMax) {
      return { status: 'warning', color: 'text-yellow-500', icon: <AlertTriangle className="w-4 h-4" /> };
    }

    return { status: 'ok', color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{groupedItem.item.itemName}</h2>
            <p className="text-sm text-gray-500 mt-1">SKU: {groupedItem.item.sku}</p>
            <p className="text-sm text-gray-600 mt-1">
              Total Quantity: <span className="font-semibold">{groupedItem.totalQuantity} {groupedItem.item.unit}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Batch No</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Expiry Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Quantity</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Temperature</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupedItem.batches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No batches found.</td>
                </tr>
              ) : (
                groupedItem.batches.map((batch) => {
                  const tempStatus = getTemperatureStatus(batch);
                  return (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{batch.batchNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(batch.expiryDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {batch.quantityOnHand} {groupedItem.item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {batch.temperature !== null && batch.temperature !== undefined ? (
                          <div className={`flex items-center gap-2 ${tempStatus.color}`}>
                            {tempStatus.icon}
                            <span className="text-sm font-medium">
                              {batch.temperature.toFixed(1)}°C
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(batch.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailModal;

