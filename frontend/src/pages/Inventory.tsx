import React, { useEffect, useState } from 'react';
import { Eye, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { enhancedApi } from '../services/enhanced-api';
import { stockRequestsService } from '../services/api-services';
import type { InventoryBatch, Item } from '../types';
import { useAuth } from '../context/useAuth';
import InventoryModal from '../components/InventoryModal';
import FilterModal from '../components/FilterModal';
import StockAlertModal from '../components/StockAlertModal';
import BatchDetailModal from '../components/BatchDetailModal';
import AdminAdjustInventoryModal from '../components/AdminAdjustInventoryModal';

interface GroupedInventoryItem {
  item: Item;
  totalQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'full_stock';
  batches: InventoryBatch[];
}

const Inventory: React.FC = () => {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedInventoryItem[]>([]);
  const [filteredGroupedItems, setFilteredGroupedItems] = useState<GroupedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStockAlertModalOpen, setIsStockAlertModalOpen] = useState(false);
  const [isBatchDetailModalOpen, setIsBatchDetailModalOpen] = useState(false);
  const [isExpressOrderModalOpen, setIsExpressOrderModalOpen] = useState(false);
  const [isAdminAdjustModalOpen, setIsAdminAdjustModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | undefined>();
  const [selectedGroupedItem, setSelectedGroupedItem] = useState<GroupedInventoryItem | null>(null);
  const [selectedItemForAlert, setSelectedItemForAlert] = useState<{id: number, name: string, stock: number} | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { user } = useAuth();
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';

  useEffect(() => {
    fetchInventory();
  }, []);

  const calculateStatus = (totalQuantity: number, minStockLevel: number, maxStockLevel: number): 'in_stock' | 'low_stock' | 'out_of_stock' | 'full_stock' => {
    if (totalQuantity === 0) {
      return 'out_of_stock';
    }
    if (totalQuantity < minStockLevel) {
      return 'low_stock';
    }
    if (totalQuantity >= maxStockLevel) {
      return 'full_stock';
    }
    return 'in_stock';
  };

  const groupBatchesBySKU = (batches: InventoryBatch[]): GroupedInventoryItem[] => {
    const groupedMap = new Map<string, GroupedInventoryItem>();

    batches.forEach((batch) => {
      if (!batch.item || !batch.item.sku) return;

      const sku = batch.item.sku;
      
      if (!groupedMap.has(sku)) {
        groupedMap.set(sku, {
          item: batch.item,
          totalQuantity: 0,
          status: 'in_stock',
          batches: [],
        });
      }

      const groupedItem = groupedMap.get(sku)!;
      groupedItem.batches.push(batch);
      groupedItem.totalQuantity += batch.quantityOnHand;
    });

    // Calculate status for each grouped item
    const groupedArray = Array.from(groupedMap.values());
    groupedArray.forEach((item) => {
      item.status = calculateStatus(
        item.totalQuantity,
        item.item.minStockLevel,
        item.item.maxStockLevel
      );
    });

    return groupedArray;
  };

  const fetchInventory = async () => {
    try {
      const response = await enhancedApi.get<InventoryBatch[]>('/inventory-batches', {}, { maxRetries: 2, retryDelay: 1000 });
      setBatches(response.data);
      const grouped = groupBatchesBySKU(response.data);
      setGroupedItems(grouped);
      setFilteredGroupedItems(grouped);
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
    
    let filtered = [...groupedItems];
    
    if (newFilters.status) {
      filtered = filtered.filter(item => item.status === newFilters.status);
    }
    
    if (newFilters.category) {
      filtered = filtered.filter(item => item.item.category === newFilters.category);
    }
    
    setFilteredGroupedItems(filtered);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  // Pagination
  const totalPages = Math.ceil(filteredGroupedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroupedItems = filteredGroupedItems.slice(startIndex, endIndex);

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
          {userRole === 'ADMIN' && (
            <button 
              onClick={() => {
                setIsAdminAdjustModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              Adjust Inventory
            </button>
          )}
          {(userRole === 'STORE_MANAGER' || userRole === 'PROCUREMENT_STAFF' || userRole === 'ADMIN') && (
            <button 
              onClick={() => {
                setIsExpressOrderModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">flash_on</span>
              Express Order
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Total Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading inventory data...</td>
                </tr>
              ) : paginatedGroupedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No inventory items found.</td>
                </tr>
              ) : (
                paginatedGroupedItems.map((groupedItem) => {
                  const category = groupedItem.item?.category || 'Other';
                  const icon = getItemIcon(category);
                  const iconColor = getItemIconColor(category);
                  
                  return (
                    <tr key={groupedItem.item.sku} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined">{icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{groupedItem.item?.itemName}</p>
                            <p className="text-xs text-gray-500">{category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{groupedItem.item?.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {groupedItem.totalQuantity} {groupedItem.item?.unit || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(groupedItem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {(userRole === 'STORE_MANAGER' || userRole === 'INVENTORY_STAFF') && (
                            <button
                              onClick={() => {
                                setSelectedItemForAlert({
                                  id: groupedItem.item.id,
                                  name: groupedItem.item.itemName,
                                  stock: groupedItem.totalQuantity
                                });
                                setIsStockAlertModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Stock Alert Settings"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedGroupedItem(groupedItem);
                              setIsBatchDetailModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
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
              {Math.min(endIndex, filteredGroupedItems.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-900 mx-1">{filteredGroupedItems.length}</span> entries
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
              { value: 'full_stock', label: 'Full Stock' }
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
        groupedItems={groupedItems}
      />

      {/* Express Order Modal */}
      {isExpressOrderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <span className="material-symbols-outlined text-[20px] mr-2">flash_on</span>
                Express Order
              </h2>
              <button 
                onClick={() => setIsExpressOrderModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select an item to create an Express Order. This will automatically create and send a Purchase Order.
            </p>
            {groupedItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No items found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groupedItems.map((groupedItem) => {
                  const safetyStock = groupedItem.item?.safetyStock || 0;
                  const requestedQty = safetyStock > 0 ? safetyStock + 20 : (groupedItem.item?.minStockLevel || 10) + 20;
                  
                  return (
                    <button
                      key={groupedItem.item.id}
                      onClick={async () => {
                        const storeId = user?.storeId || 1;
                        
                        if (confirm(`Create Express Order for ${groupedItem.item?.itemName}?\nRequested Quantity: ${requestedQty}\nThis will automatically create and send a Purchase Order.`)) {
                          try {
                            await stockRequestsService.expressOrder(
                              groupedItem.item.id,
                              storeId,
                              requestedQty
                            );
                            alert('Express Order created successfully!');
                            setIsExpressOrderModalOpen(false);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            fetchInventory();
                          } catch (error) {
                            console.error('Failed to create express order:', error);
                            alert('Failed to create express order. Please try again.');
                          }
                        }
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{groupedItem.item?.itemName}</div>
                          <div className="text-sm text-gray-500">SKU: {groupedItem.item?.sku}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Current Stock: {groupedItem.totalQuantity} {groupedItem.item?.unit || ''} | 
                            Requested Qty: {requestedQty}
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(groupedItem.status)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsExpressOrderModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGroupedItem && (
        <BatchDetailModal
          isOpen={isBatchDetailModalOpen}
          onClose={() => {
            setIsBatchDetailModalOpen(false);
            setSelectedGroupedItem(null);
          }}
          groupedItem={selectedGroupedItem}
        />
      )}

      <AdminAdjustInventoryModal
        isOpen={isAdminAdjustModalOpen}
        onClose={() => setIsAdminAdjustModalOpen(false)}
        onSave={() => {
          fetchInventory();
          setIsAdminAdjustModalOpen(false);
        }}
      />
    </div>
  );
};

export default Inventory;
