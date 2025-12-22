import React, { useEffect, useState } from 'react';
import { BarChart, FileText, Download } from 'lucide-react';
import { enhancedApi } from '../services/enhanced-api';
import { reportsService } from '../services/api-services';
import { Button } from '../components/ui';
import { exportToExcel, formatDateForExcel, formatCurrencyForExcel } from '../utils/excelExport';
import type { PurchaseOrder, InventoryBatch } from '../types';
import { format } from 'date-fns';

interface ExpiredItem {
  itemId: number;
  itemName: string;
  sku: string;
  batchNo: string;
  expiryDate: string;
  daysUntilExpiry: number;
  quantityOnHand: number;
  status: string;
}

const Reports: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryBatch[]>([]);
  const [expiredItems, setExpiredItems] = useState<ExpiredItem[]>([]);
  const [expiredFilter, setExpiredFilter] = useState<string>('all');
  const [daysThreshold, setDaysThreshold] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrorStatus(null);
      setErrorMessage('');
      const [poResponse, inventoryResponse, expiredResponse] = await Promise.all([
        enhancedApi.get<PurchaseOrder[]>('/procurement', {}, { maxRetries: 2, retryDelay: 1000 }),
        enhancedApi.get<InventoryBatch[]>('/inventory-batches', {}, { maxRetries: 2, retryDelay: 1000 }),
        reportsService.getExpiredItems(daysThreshold).catch(() => [])
      ]);
      setPurchaseOrders(poResponse.data);
      setInventoryData(inventoryResponse.data);
      setExpiredItems(expiredResponse);
    } catch (err: unknown) {
      const hasResponse = typeof err === 'object' && err !== null && 'response' in (err as object);
      const status = hasResponse
        ? (err as { response?: { status?: number } }).response?.status ?? 0
        : 0;
      setErrorStatus(status);
      const message =
        (hasResponse
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined) ||
        (status === 401
          ? 'Authentication required. Please log in again.'
          : status === 403
          ? 'Access denied. You do not have permission to view this report.'
          : 'Failed to fetch reports data');
      setErrorMessage(message);
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchData();
  };

  const handleExportPurchaseOrders = () => {
    const exportData = purchaseOrders.map(order => ({
      'PO Number': order.poNumber,
      'Supplier': order.supplier?.name || 'N/A',
      'Order Date': formatDateForExcel(order.orderDate),
      'Expected Delivery': formatDateForExcel(order.expectedDeliveryDate || ''),
      'Total Amount': formatCurrencyForExcel(order.totalAmount),
      'Status': order.status.replace('_', ' ').toUpperCase()
    }));
    exportToExcel(exportData, 'Purchase_Orders_Report', 'Purchase Orders');
  };

  const handleExportInventory = () => {
    const exportData = inventoryData.map(batch => ({
      'Item Name': batch.item?.itemName || 'N/A',
      'SKU': batch.item?.sku || 'N/A',
      'Category': batch.item?.category || 'N/A',
      'Batch Number': batch.batchNo,
      'Expiry Date': formatDateForExcel(batch.expiryDate),
      'Quantity': batch.quantityOnHand,
      'Unit': batch.item?.unit || 'N/A',
      'Status': batch.status.replace('_', ' ').toUpperCase()
    }));
    exportToExcel(exportData, 'Inventory_Report', 'Inventory');
  };

  const handleExportExpiredItems = () => {
    const filtered = getFilteredExpiredItems();
    const exportData = filtered.map(item => ({
      'Item Name': item.itemName,
      'SKU': item.sku,
      'Batch Number': item.batchNo,
      'Expiry Date': formatDateForExcel(item.expiryDate),
      'Days Until Expiry': item.daysUntilExpiry,
      'Quantity': item.quantityOnHand,
      'Status': item.status === 'expired' ? 'EXPIRED' : item.status === 'expires_today' ? 'EXPIRES TODAY' : 'NEAR EXPIRY'
    }));
    exportToExcel(exportData, 'Expired_Items_Report', 'Expired Items');
  };

  const getFilteredExpiredItems = () => {
    if (expiredFilter === 'expired') {
      return expiredItems.filter(item => item.daysUntilExpiry < 0);
    } else if (expiredFilter === 'near_expiry') {
      return expiredItems.filter(item => item.daysUntilExpiry >= 0);
    }
    return expiredItems;
  };

  const getExpiredItemsStatusBadge = (status: string, daysUntilExpiry: number) => {
    if (status === 'expired' || daysUntilExpiry < 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">EXPIRED</span>;
    } else if (status === 'expires_today' || daysUntilExpiry === 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">EXPIRES TODAY</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">NEAR EXPIRY</span>;
    }
  };

  const handleExportAll = () => {
    handleExportPurchaseOrders();
    handleExportInventory();
  };

  const getTotalOrderValue = () => {
    return purchaseOrders.reduce((total, order) => total + order.totalAmount, 0);
  };

  const getLowStockItems = () => {
    return inventoryData.filter(batch => batch.status === 'low_stock').length;
  };

  const getOutOfStockItems = () => {
    return inventoryData.filter(batch => batch.status === 'out_of_stock').length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">View performance metrics and download reports.</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      </div>
    );
  }

  if (errorStatus === 401 || errorStatus === 403) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">View performance metrics and download reports.</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-red-600 mb-3">{errorMessage}</p>
          <Button variant="secondary" onClick={handleRetry}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">View performance metrics and download reports.</p>
        </div>
        <Button variant="secondary" className="flex items-center" onClick={handleExportAll}>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
          <p className="text-2xl font-bold text-primary mt-2">{purchaseOrders.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total value: {formatCurrencyForExcel(getTotalOrderValue())}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Low Stock</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{getLowStockItems()}</p>
          <p className="text-sm text-gray-500 mt-1">Items need restocking</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <BarChart className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Out of Stock</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Critical Items</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{getOutOfStockItems()}</p>
          <p className="text-sm text-gray-500 mt-1">Items unavailable</p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Purchase Orders Report</h3>
              <p className="text-sm text-gray-500 mt-1">Export purchase order data to Excel</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <Button variant="secondary" className="flex items-center" onClick={handleExportPurchaseOrders}>
            <Download className="w-4 h-4 mr-2" />
            Export Purchase Orders
          </Button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inventory Report</h3>
              <p className="text-sm text-gray-500 mt-1">Export inventory data to Excel</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Button variant="secondary" className="flex items-center" onClick={handleExportInventory}>
            <Download className="w-4 h-4 mr-2" />
            Export Inventory
          </Button>
        </div>
      </div>

      {/* Expired & Near-Expiry Items Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Expired & Near-Expiry Items</h2>
            <p className="mt-1 text-sm text-gray-500">Monitor items that are expired or approaching expiry date.</p>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              value={daysThreshold}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 7;
                setDaysThreshold(value);
                fetchData();
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Days"
              min="1"
            />
            <span className="flex items-center text-sm text-gray-600">days threshold</span>
            <Button variant="secondary" className="flex items-center" onClick={handleExportExpiredItems}>
              <Download className="w-4 h-4 mr-2" />
              Export Expired Items
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
          <select
            value={expiredFilter}
            onChange={(e) => setExpiredFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All</option>
            <option value="expired">Expired Only</option>
            <option value="near_expiry">Near-Expiry Only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until Expiry</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredExpiredItems().length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No expired or near-expiry items found.</td>
                </tr>
              ) : (
                getFilteredExpiredItems().map((item, index) => (
                  <tr key={`${item.itemId}-${item.batchNo}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.batchNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.daysUntilExpiry < 0 ? `Expired ${Math.abs(item.daysUntilExpiry)} days ago` : `${item.daysUntilExpiry} days`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantityOnHand}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getExpiredItemsStatusBadge(item.status, item.daysUntilExpiry)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
