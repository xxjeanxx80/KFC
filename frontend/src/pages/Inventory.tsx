import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { enhancedApi } from '../services/enhanced-api';
import type { InventoryBatch } from '../types';
import { useAuth } from '../context/useAuth';
import InventoryModal from '../components/InventoryModal';
import FilterModal from '../components/FilterModal';
import StockAlertModal from '../components/StockAlertModal';

const Inventory: React.FC = () => {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<InventoryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStockAlertModalOpen, setIsStockAlertModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | undefined>();
  const [selectedItemForAlert, setSelectedItemForAlert] = useState<{id: number, name: string, stock: number} | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { user } = useAuth();
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await enhancedApi.get<InventoryBatch[]>('/inventory-batches', {}, { maxRetries: 2, retryDelay: 1000 });
      setBatches(response.data);
      setFilteredBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
      'in_stock': { label: 'IN STOCK', bg: 'bg-green-100', text: 'text-green-800' },
      'low_stock': { label: 'LOW STOCK', bg: 'bg-orange-100', text: 'text-orange-800' },
      'out_of_stock': { label: 'OUT OF STOCK', bg: 'bg-red-100', text: 'text-red-800' },
      'expired': { label: 'EXPIRED', bg: 'bg-red-100', text: 'text-red-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status.toUpperCase(), bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getItemIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Meat': 'lunch_dining',
      'Chicken': 'lunch_dining',
      'Frozen': 'fastfood',
      'Beverage': 'local_drink',
      'Beverages': 'local_drink',
      'Vegetables': 'eco',
      'Bakery': 'bakery_dining',
      'Dry Goods': 'set_meal',
      'Sides': 'fastfood',
      'Packaging': 'inventory_2',
    };
    
    return iconMap[category] || 'inventory_2';
  };

  const getItemIconColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Meat': 'bg-orange-100 text-orange-600',
      'Chicken': 'bg-orange-100 text-orange-600',
      'Frozen': 'bg-yellow-100 text-yellow-600',
      'Beverage': 'bg-red-100 text-red-600',
      'Beverages': 'bg-red-100 text-red-600',
      'Vegetables': 'bg-green-100 text-green-600',
      'Bakery': 'bg-orange-100 text-orange-600',
      'Dry Goods': 'bg-red-100 text-red-600',
      'Sides': 'bg-yellow-100 text-yellow-600',
      'Packaging': 'bg-blue-100 text-blue-600',
    };
    
    return colorMap[category] || 'bg-gray-100 text-gray-600';
  };

  const handleAddStock = () => {
    setSelectedBatch(undefined);
    setIsModalOpen(true);
  };

  const handleAdjustStock = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBatch(undefined);
  };

  const handleSaveBatch = () => {
    fetchInventory();
  };

  const handleStockAlert = (batch: InventoryBatch) => {
    setSelectedItemForAlert({
      id: batch.item.id,
      name: batch.item.itemName,
      stock: batch.quantityOnHand
    });
    setIsStockAlertModalOpen(true);
  };

  const handleStockAlertClose = () => {
    setIsStockAlertModalOpen(false);
    setSelectedItemForAlert(null);
  };

  const handleStockAlertSave = () => {
    fetchInventory();
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const handleFilterApply = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    let filtered = [...batches];
    
    if (newFilters.status) {
      filtered = filtered.filter(batch => batch.status === newFilters.status);
    }
    
    if (newFilters.category) {
      filtered = filtered.filter(batch => batch.item.category === newFilters.category);
    }
    
    setFilteredBatches(filtered);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  // Pagination
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track stock levels, batches, and expiry dates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleFilterClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
          {(userRole === 'STORE_MANAGER' || userRole === 'INVENTORY_STAFF') && (
            <button 
              onClick={() => {
                // Hiển thị modal với danh sách items để chọn
                setIsStockAlertModalOpen(true);
                setSelectedItemForAlert(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-primary text-primary rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              Stock Alerts
            </button>
          )}
          {userRole === 'INVENTORY_STAFF' && (
            <button 
              onClick={handleAddStock}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Stock (GRN)
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-240px)] min-h-[500px]">
        <div className="table-container overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Item Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Batch No</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Loading inventory data...</td>
                </tr>
              ) : paginatedBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No inventory items found.</td>
                </tr>
              ) : (
                paginatedBatches.map((batch) => {
                  const category = batch.item?.category || 'Other';
                  const icon = getItemIcon(category);
                  const iconColor = getItemIconColor(category);
                  
                  return (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined">{icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{batch.item?.itemName}</p>
                            <p className="text-xs text-gray-500">{category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{batch.item?.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{batch.batchNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(batch.expiryDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {batch.quantityOnHand} {batch.item?.unit || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(batch.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {userRole === 'INVENTORY_STAFF' && (
                            <button 
                              onClick={() => handleAdjustStock(batch)}
                              className="text-gray-400 hover:text-primary transition-colors p-1"
                              title="Adjust stock"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          )}
                          {(userRole === 'STORE_MANAGER' || userRole === 'INVENTORY_STAFF') && (
                            <button 
                              onClick={() => handleStockAlert(batch)}
                              className="text-gray-400 hover:text-primary transition-colors p-1"
                              title="Stock alerts"
                            >
                              <span className="material-symbols-outlined text-[20px]">settings</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900 mx-1">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-gray-900 mx-1">
              {Math.min(endIndex, filteredBatches.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-900 mx-1">{filteredBatches.length}</span> entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      
      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveBatch}
        batch={selectedBatch}
      />
      
      <FilterModal
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'in_stock', label: 'In Stock' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
              { value: 'expired', label: 'Expired' }
            ]
          },
          {
            key: 'category',
            label: 'Category',
            options: [
              { value: 'Chicken', label: 'Chicken' },
              { value: 'Beverages', label: 'Beverages' },
              { value: 'Sides', label: 'Sides' },
              { value: 'Packaging', label: 'Packaging' }
            ]
          }
        ]}
        initialFilters={filters}
      />
      
      <StockAlertModal
        isOpen={isStockAlertModalOpen}
        onClose={handleStockAlertClose}
        onSave={handleStockAlertSave}
        itemId={selectedItemForAlert?.id}
        itemName={selectedItemForAlert?.name}
        currentStock={selectedItemForAlert?.stock}
      />
    </div>
  );
};

export default Inventory;
