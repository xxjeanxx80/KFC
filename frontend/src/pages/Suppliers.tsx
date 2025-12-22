import React, { useEffect, useState } from 'react';
import { Plus, Star, Edit, History, Package } from 'lucide-react';
import { format } from 'date-fns';
import { enhancedApi } from '../services/enhanced-api';
import type { Supplier, PurchaseOrder } from '../types';
import { Button, Badge } from '../components/ui';
import SupplierModal from '../components/SupplierModal';
import { useAuth } from '../context/useAuth';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  // Track active tab and history for each supplier separately
  const [activeTabs, setActiveTabs] = useState<Record<number, 'info' | 'history'>>({});
  const [supplierHistories, setSupplierHistories] = useState<Record<number, PurchaseOrder[]>>({});
  const [historyLoadingStates, setHistoryLoadingStates] = useState<Record<number, boolean>>({});
  const { user } = useAuth();
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';

  useEffect(() => {
    fetchSuppliers();
  }, []);

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

  const fetchSuppliers = async () => {
    try {
      setError(null);
      const response = await enhancedApi.get<Supplier[]>('/suppliers', {}, { maxRetries: 2, retryDelay: 1000 });
      setSuppliers(response.data);
    } catch (error: unknown) {
      console.error('Failed to fetch suppliers:', error);
      const hasResponse = typeof error === 'object' && error !== null && 'response' in (error as object);
      const message =
        hasResponse
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch suppliers'
          : 'Failed to fetch suppliers';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSupplier(undefined);
  };

  const handleSaveSupplier = () => {
    fetchSuppliers();
  };

  const handleViewHistory = async (supplierId: number) => {
    // Set active tab for this specific supplier
    setActiveTabs(prev => ({ ...prev, [supplierId]: 'history' }));
    
    // If history already loaded, don't fetch again
    if (supplierHistories[supplierId]) {
      return;
    }
    
    setHistoryLoadingStates(prev => ({ ...prev, [supplierId]: true }));
    try {
      const response = await enhancedApi.get<PurchaseOrder[]>(`/procurement?supplierId=${supplierId}`, {}, { maxRetries: 2, retryDelay: 1000 });
      setSupplierHistories(prev => ({ ...prev, [supplierId]: response.data || [] }));
    } catch (error: unknown) {
      console.error('Failed to fetch supplier history:', error);
      setSupplierHistories(prev => ({ ...prev, [supplierId]: [] }));
    } finally {
      setHistoryLoadingStates(prev => ({ ...prev, [supplierId]: false }));
    }
  };

  const handleTabChange = (supplierId: number, tab: 'info' | 'history') => {
    setActiveTabs(prev => ({ ...prev, [supplierId]: tab }));
    if (tab === 'history' && !supplierHistories[supplierId]) {
      handleViewHistory(supplierId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage supplier database and performance.</p>
        </div>
        {/* Only PROCUREMENT_STAFF can add/edit suppliers */}
        {userRole === 'PROCUREMENT_STAFF' && (
          <Button className="flex items-center" onClick={() => { setSelectedSupplier(undefined); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center py-10">Loading suppliers...</p>
        ) : error ? (
          <div className="col-span-full text-center py-10">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <button 
              onClick={fetchSuppliers} 
              className="text-primary hover:text-blue-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : suppliers.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">No suppliers found.</p>
        ) : (
          suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-medium">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {supplier.reliabilityScore}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <div className="truncate">{supplier.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <div>{supplier.phone}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Lead Time:</span>
                    <div>{supplier.leadTimeDays} days</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      (activeTabs[supplier.id] || 'info') === 'info'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => handleTabChange(supplier.id, 'info')}
                  >
                    Info
                  </button>
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTabs[supplier.id] === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => handleTabChange(supplier.id, 'history')}
                  >
                    History
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {(activeTabs[supplier.id] || 'info') === 'info' ? (
                  <div className="space-y-4">
                    <div className="flex space-x-3 pt-4">
                      {/* Only PROCUREMENT_STAFF can edit suppliers */}
                      {userRole === 'PROCUREMENT_STAFF' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => handleViewHistory(supplier.id)}
                      >
                        <History className="w-4 h-4 mr-1" />
                        View History
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyLoadingStates[supplier.id] ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading history...</p>
                      </div>
                    ) : (supplierHistories[supplier.id] || []).length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No purchase orders found for this supplier</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(supplierHistories[supplier.id] || []).map((order) => (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{order.poNumber}</h4>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(order.orderDate), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <Badge variant={getStatusVariant(order.status)}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Total:</span>
                                <div className="font-medium">${order.totalAmount}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Items:</span>
                                <div className="font-medium">{order.items?.length || 0}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Delivery:</span>
                                <div className="font-medium">
                                  {order.expectedDeliveryDate ? 
                                    format(new Date(order.expectedDeliveryDate), 'MMM d, yyyy') : 
                                    'Not set'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveSupplier}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default Suppliers;
