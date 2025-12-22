import React, { useEffect, useState } from 'react';
import { Plus, Filter, Eye, Check } from 'lucide-react';
import { format } from 'date-fns';
import { enhancedApi } from '../services/enhanced-api';
import { procurementService, goodsReceiptsService } from '../services/api-services';
import type { PurchaseOrder } from '../types';
import { Badge, Button } from '../components/ui';
import { useAuth } from '../context/useAuth';
import ProcurementModal from '../components/ProcurementModal';
import FilterModal from '../components/FilterModal';
import PODetailModal from '../components/PODetailModal';
import GoodsReceiptModal from '../components/GoodsReceiptModal';

const Procurement: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPODetailModalOpen, setIsPODetailModalOpen] = useState(false);
  const [isGoodsReceiptModalOpen, setIsGoodsReceiptModalOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<number | null>(null);
  const [selectedPOForGRN, setSelectedPOForGRN] = useState<PurchaseOrder | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await enhancedApi.get<PurchaseOrder[]>('/procurement', {}, { maxRetries: 2, retryDelay: 1000 });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
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

  const handleProcurementModalClose = () => {
    setIsProcurementModalOpen(false);
  };

  const handleSaveOrder = () => {
    fetchOrders();
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const handleFilterApply = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    
    let filtered = [...orders];
    
    if (newFilters.status) {
      filtered = filtered.filter(order => order.status === newFilters.status);
    }
    
    if (newFilters.supplier) {
      filtered = filtered.filter(order => order.supplier?.name === newFilters.supplier);
    }
    
    setFilteredOrders(filtered);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  const handleViewPODetails = (poId: number) => {
    setSelectedPOId(poId);
    setIsPODetailModalOpen(true);
  };

  const handleClosePODetail = () => {
    setIsPODetailModalOpen(false);
    setSelectedPOId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
          <p className="mt-1 text-sm text-gray-500">Manage purchase orders and supplier interactions.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" className="flex items-center" onClick={handleFilterClick}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Delivery</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No purchase orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(po.orderDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(po.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(po.status)}>
                        {po.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Only STORE_MANAGER can approve/reject PO */}
                        {userRole === 'STORE_MANAGER' && po.status === 'pending_approval' && (
                          <>
                            <button 
                              type="button"
                              className="text-success hover:text-green-900 cursor-pointer p-1 rounded transition-colors" 
                              title="Approve"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  await enhancedApi.post(`/procurement/${po.id}/approve`, {});
                                  alert('Purchase order approved successfully!');
                                  fetchOrders();
                                } catch (error) {
                                  console.error('Failed to approve PO:', error);
                                  alert('Failed to approve purchase order.');
                                }
                              }}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              type="button"
                              className="text-danger hover:text-red-900 px-3 py-1.5 rounded text-xs font-medium border border-red-300 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap" 
                              title="Reject"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Reject button clicked for PO:', po.id);
                                const reason = prompt('Enter rejection reason:');
                                console.log('Rejection reason:', reason);
                                if (reason && reason.trim()) {
                                  try {
                                    console.log('Sending reject request...');
                                    const response = await enhancedApi.post(`/procurement/${po.id}/reject`, { reason: reason.trim() });
                                    console.log('Reject response:', response);
                                    alert('Purchase order rejected successfully.');
                                    fetchOrders();
                                  } catch (error) {
                                    console.error('Failed to reject PO:', error);
                                    const errorMessage = error instanceof Error ? error.message : 'Failed to reject purchase order.';
                                    alert(errorMessage);
                                  }
                                } else if (reason !== null) {
                                  alert('Rejection reason cannot be empty.');
                                }
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {/* PROCUREMENT_STAFF can send PO after approval */}
                        {userRole === 'PROCUREMENT_STAFF' && po.status === 'approved' && (
                          <button 
                            type="button"
                            className="text-blue-600 hover:text-blue-900 cursor-pointer p-1 rounded transition-colors" 
                            title="Send PO"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                await procurementService.send(po.id);
                                alert('Purchase order sent successfully!');
                                fetchOrders();
                              } catch (error) {
                                console.error('Failed to send PO:', error);
                                alert('Failed to send purchase order.');
                              }
                            }}
                          >
                            Send
                          </button>
                        )}
                        {/* PROCUREMENT_STAFF can edit PO (only if not approved, delivered, or cancelled) */}
                        {userRole === 'PROCUREMENT_STAFF' && 
                         po.status !== 'approved' && 
                         po.status !== 'delivered' && 
                         po.status !== 'cancelled' && (
                          <button className="text-primary hover:text-blue-900" title="Edit">
                            Edit
                          </button>
                        )}
                        {/* INVENTORY_STAFF can receive or reject receipt for PO in SENT status */}
                        {userRole === 'INVENTORY_STAFF' && po.status === 'sent' && (
                          <>
                            <button 
                              type="button"
                              className="text-green-600 hover:text-green-900 px-3 py-1.5 rounded text-xs font-medium border border-green-300 hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap" 
                              title="Nhận hàng"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm('Bạn có chắc chắn muốn nhận hàng này?')) {
                                  try {
                                    await procurementService.receive(po.id);
                                    alert('Đã nhận hàng thành công. Vui lòng điền thông tin GRN.');
                                    // Fetch lại PO với đầy đủ items để có thông tin mới nhất
                                    const updatedPO = await procurementService.getById(po.id);
                                    // Kiểm tra xem PO có items không
                                    if (!updatedPO.items || updatedPO.items.length === 0) {
                                      console.error('PO không có items sau khi receive:', updatedPO);
                                      alert('Lỗi: Purchase Order không có items. Vui lòng thử lại.');
                                      fetchOrders();
                                      return;
                                    }
                                    console.log('PO sau khi receive:', updatedPO);
                                    setSelectedPOForGRN(updatedPO);
                                    setIsGoodsReceiptModalOpen(true);
                                    fetchOrders();
                                  } catch (error: unknown) {
                                    console.error('Failed to receive PO:', error);
                                    let errorMessage = 'Không thể nhận hàng.';
                                    if (error && typeof error === 'object' && 'response' in error) {
                                      const httpError = error as { response?: { data?: { message?: string } } };
                                      if (httpError.response?.data?.message) {
                                        errorMessage = httpError.response.data.message;
                                      }
                                    }
                                    alert(errorMessage);
                                  }
                                }
                              }}
                            >
                              Nhận hàng
                            </button>
                            <button 
                              type="button"
                              className="text-red-600 hover:text-red-900 px-3 py-1.5 rounded text-xs font-medium border border-red-300 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap" 
                              title="Không nhận hàng"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const reason = prompt('Nhập lý do không nhận hàng:');
                                if (reason && reason.trim()) {
                                  try {
                                    await procurementService.rejectReceipt(po.id, reason.trim());
                                    alert('Đã từ chối nhận hàng thành công.');
                                    fetchOrders();
                                  } catch (error: unknown) {
                                    console.error('Failed to reject receipt:', error);
                                    let errorMessage = 'Không thể từ chối nhận hàng.';
                                    if (error && typeof error === 'object' && 'response' in error) {
                                      const httpError = error as { response?: { data?: { message?: string } } };
                                      if (httpError.response?.data?.message) {
                                        errorMessage = httpError.response.data.message;
                                      }
                                    }
                                    alert(errorMessage);
                                  }
                                } else if (reason !== null) {
                                  alert('Lý do không thể để trống.');
                                }
                              }}
                            >
                              Không nhận
                            </button>
                          </>
                        )}
                        {/* INVENTORY_STAFF can create GRN for PO in CONFIRMED status */}
                        {userRole === 'INVENTORY_STAFF' && po.status === 'confirmed' && (
                          <button 
                            type="button"
                            className="text-blue-600 hover:text-blue-900 px-3 py-1.5 rounded text-xs font-medium border border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap" 
                            title="Tạo GRN"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                const poDetails = await procurementService.getById(po.id);
                                setSelectedPOForGRN(poDetails);
                                setIsGoodsReceiptModalOpen(true);
                              } catch (error) {
                                console.error('Failed to fetch PO details:', error);
                                alert('Không thể tải thông tin PO.');
                              }
                            }}
                          >
                            Tạo GRN
                          </button>
                        )}
                        <button 
                          className="text-gray-400 hover:text-gray-600 transition-colors" 
                          title="View Details"
                          onClick={() => handleViewPODetails(po.id)}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ProcurementModal
        isOpen={isProcurementModalOpen}
        onClose={handleProcurementModalClose}
        onSave={handleSaveOrder}
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
              { value: 'draft', label: 'Draft' },
              { value: 'pending_approval', label: 'Pending Approval' },
              { value: 'approved', label: 'Approved' },
              { value: 'sent', label: 'Sent' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' }
            ]
          }
        ]}
        initialFilters={filters}
      />

      <PODetailModal
        isOpen={isPODetailModalOpen}
        onClose={handleClosePODetail}
        poId={selectedPOId}
      />

      {isGoodsReceiptModalOpen && selectedPOForGRN && (
        <GoodsReceiptModal
          isOpen={isGoodsReceiptModalOpen}
          onClose={() => {
            setIsGoodsReceiptModalOpen(false);
            setSelectedPOForGRN(null);
          }}
          purchaseOrder={selectedPOForGRN}
          onSuccess={() => {
            setIsGoodsReceiptModalOpen(false);
            setSelectedPOForGRN(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default Procurement;
