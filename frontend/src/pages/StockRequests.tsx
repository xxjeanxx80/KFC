import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { stockRequestsService, itemsService, storesService } from '../services/api-services';
import { enhancedApi } from '../services/enhanced-api';
import type { StockRequest, Item, Store, Supplier, PurchaseOrder } from '../types';
import { useAuth } from '../context/useAuth';

const StockRequests: React.FC = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [isGeneratePOModalOpen, setIsGeneratePOModalOpen] = useState(false);
  const [isCreatePOFormOpen, setIsCreatePOFormOpen] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);
  const [selectedRequestsForPO, setSelectedRequestsForPO] = useState<StockRequest[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<StockRequest | null>(null);
  const { user, isAuthenticated } = useAuth();
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await stockRequestsService.getAll();
      setRequests(data);
      applyFilters(data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 401) {
          return;
        }
      }
      console.error('Failed to fetch stock requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: StockRequest[]) => {
    let filtered = [...data];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  };

  useEffect(() => {
    applyFilters(requests);
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
      'requested': { label: 'REQUESTED', bg: 'bg-blue-100', text: 'text-blue-800' },
      'po_generated': { label: 'PO GENERATED', bg: 'bg-purple-100', text: 'text-purple-800' },
      'cancelled': { label: 'CANCELLED', bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status.toUpperCase(), bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; bg: string; text: string }> = {
      'low': { label: 'LOW', bg: 'bg-gray-100', text: 'text-gray-800' },
      'medium': { label: 'MEDIUM', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'high': { label: 'HIGH', bg: 'bg-red-100', text: 'text-red-800' },
    };
    
    const priorityInfo = priorityMap[priority] || { label: priority.toUpperCase(), bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bg} ${priorityInfo.text}`}>
        {priorityInfo.label}
      </span>
    );
  };

  // handleApprove function removed - not used

  const handleGeneratePO = () => {
    setIsGeneratePOModalOpen(true);
    setSelectedRequestIds([]);
  };

  const handleGeneratePOConfirm = () => {
    if (selectedRequestIds.length === 0) {
      alert('Please select at least one Stock Request to create PO.');
      return;
    }

    // Lấy thông tin các Stock Requests đã chọn
    const selectedRequests = filteredRequests.filter(req => 
      selectedRequestIds.includes(req.id) && req.status === 'requested'
    );

    if (selectedRequests.length === 0) {
      alert('No valid Stock Requests selected.');
      return;
    }

    console.log('Selected requests for PO:', selectedRequests);
    
    // Đóng modal chọn và mở form tạo PO
    setIsGeneratePOModalOpen(false);
    setSelectedRequestsForPO(selectedRequests);
    setIsCreatePOFormOpen(true);
    
    console.log('isCreatePOFormOpen set to:', true);
  };

  const handleCancelRequests = async () => {
    if (selectedRequestIds.length === 0) {
      alert('Please select at least one Stock Request to cancel.');
      return;
    }

    if (!confirm(`Are you sure you want to cancel ${selectedRequestIds.length} selected Stock Request(s)?`)) {
      return;
    }

    try {
      await stockRequestsService.cancelRequests(selectedRequestIds);
      alert(`Successfully cancelled ${selectedRequestIds.length} stock request(s).`);
      setIsGeneratePOModalOpen(false);
      setSelectedRequestIds([]);
      fetchRequests();
    } catch (error: unknown) {
      console.error('Failed to cancel requests:', error);
      let errorMessage = 'Failed to cancel stock requests.';
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { data?: { message?: string } } };
        if (httpError.response?.data?.message) {
          errorMessage = httpError.response.data.message;
        }
      }
      alert(errorMessage);
    }
  };

  const handleToggleRequestSelection = (requestId: number) => {
    setSelectedRequestIds(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleSelectAll = () => {
    const requestedRequests = filteredRequests.filter(req => req.status === 'requested');
    if (selectedRequestIds.length === requestedRequests.length) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(requestedRequests.map(req => req.id));
    }
  };

  const handleCreateRequest = () => {
    setSelectedRequest(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleSaveRequest = () => {
    fetchRequests();
    handleModalClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Manage stock replenishment requests and workflow.</p>
        </div>
        <div className="flex space-x-3">
          {userRole === 'STORE_MANAGER' && (
            <button
              onClick={handleCreateRequest}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 0' }}>
                add
              </span>
              Create Request
            </button>
          )}
          {userRole === 'PROCUREMENT_STAFF' && (
            <button
              onClick={handleGeneratePO}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 0' }}>
                shopping_cart
              </span>
              Generate PO
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="po_generated">PO Generated</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">Loading requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">No stock requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.item?.itemName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{request.item?.sku || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestedQty}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.notes && request.notes.includes('Auto-generated') ? 'Auto by Stock Alert' : `User #${request.requestedBy || 'N/A'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.poId ? (
                        <a 
                          href={`/procurement`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/procurement`;
                          }}
                        >
                          PO-{request.poId}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(request.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* PROCUREMENT_STAFF can cancel or generate PO from stock requests */}
                        {userRole === 'PROCUREMENT_STAFF' && request.status === 'requested' && (
                          <>
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to cancel Stock Request #${request.id}?`)) {
                                  try {
                                    await stockRequestsService.update(request.id, { status: 'cancelled' });
                                    await fetchRequests();
                                    alert('Stock request cancelled successfully.');
                                  } catch (error) {
                                    console.error('Failed to cancel stock request:', error);
                                    alert('Failed to cancel stock request.');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 0' }}>
                                cancel
                              </span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedRequestDetail(request);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="View Details"
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

      {isModalOpen && (
        <StockRequestModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSaveRequest}
          request={selectedRequest}
        />
      )}

      {isGeneratePOModalOpen && (
        <GeneratePOModal
          isOpen={isGeneratePOModalOpen}
          onClose={() => {
            setIsGeneratePOModalOpen(false);
            setSelectedRequestIds([]);
          }}
          requests={filteredRequests.filter(req => req.status === 'requested')}
          selectedRequestIds={selectedRequestIds}
          onToggleSelection={handleToggleRequestSelection}
          onSelectAll={handleSelectAll}
          onGeneratePO={handleGeneratePOConfirm}
          onCancelRequests={handleCancelRequests}
        />
      )}

      {isCreatePOFormOpen && (
        <CreatePOFromRequestsModal
          isOpen={isCreatePOFormOpen}
          onClose={() => {
            setIsCreatePOFormOpen(false);
            setSelectedRequestsForPO([]);
            setSelectedRequestIds([]);
          }}
          requests={selectedRequestsForPO}
          onSuccess={() => {
            setIsCreatePOFormOpen(false);
            setSelectedRequestsForPO([]);
            setSelectedRequestIds([]);
            fetchRequests();
            window.location.href = '/procurement';
          }}
        />
      )}

      {isDetailModalOpen && selectedRequestDetail && (
        <StockRequestDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRequestDetail(null);
          }}
          request={selectedRequestDetail}
        />
      )}
    </div>
  );
};

interface StockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  request?: StockRequest | null;
}

const StockRequestModal: React.FC<StockRequestModalProps> = ({ isOpen, onClose, onSave, request }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [formData, setFormData] = useState({
    storeId: '',
    itemId: '',
    requestedQty: '',
    priority: 'medium',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchStores();
      if (request) {
        setFormData({
          storeId: request.storeId?.toString() || '',
          itemId: request.itemId?.toString() || '',
          requestedQty: request.requestedQty?.toString() || '',
          priority: request.priority || 'medium',
          notes: request.notes || '',
        });
      } else {
        setFormData({
          storeId: user?.storeId?.toString() || '',
          itemId: '',
          requestedQty: '',
          priority: 'medium',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, request, user]);

  const fetchItems = async () => {
    try {
      const data = await itemsService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await storesService.getAll() as Store[];
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeId) {
      newErrors.storeId = 'Store is required';
    }

    if (!formData.itemId) {
      newErrors.itemId = 'Item is required';
    }

    if (!formData.requestedQty || parseInt(formData.requestedQty) <= 0) {
      newErrors.requestedQty = 'Quantity must be greater than 0';
    }

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
      const data = {
        storeId: parseInt(formData.storeId),
        itemId: parseInt(formData.itemId),
        requestedQty: parseInt(formData.requestedQty),
        priority: formData.priority as 'low' | 'medium' | 'high',
        notes: formData.notes || undefined,
        requestedBy: user?.id,
      };

      await stockRequestsService.create(data);
      alert('Stock request created successfully.');
      onSave();
    } catch (error) {
      console.error('Failed to create stock request:', error);
      alert('Failed to create stock request.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Stock Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select
              value={formData.storeId}
              onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.storeId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            {errors.storeId && <p className="mt-1 text-sm text-red-600">{errors.storeId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select
              value={formData.itemId}
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.itemId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemName} ({item.sku})
                </option>
              ))}
            </select>
            {errors.itemId && <p className="mt-1 text-sm text-red-600">{errors.itemId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requested Quantity</label>
            <input
              type="number"
              value={formData.requestedQty}
              onChange={(e) => setFormData({ ...formData, requestedQty: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.requestedQty ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
            />
            {errors.requestedQty && <p className="mt-1 text-sm text-red-600">{errors.requestedQty}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface GeneratePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: StockRequest[];
  selectedRequestIds: number[];
  onToggleSelection: (requestId: number) => void;
  onSelectAll: () => void;
  onGeneratePO: () => void;
  onCancelRequests: () => void;
}

const GeneratePOModal: React.FC<GeneratePOModalProps> = ({
  isOpen,
  onClose,
  requests,
  selectedRequestIds,
  onToggleSelection,
  onSelectAll,
  onGeneratePO,
  onCancelRequests,
}) => {
  if (!isOpen) return null;

  const requestedRequests = requests.filter(req => req.status === 'requested');
  const allSelected = requestedRequests.length > 0 && selectedRequestIds.length === requestedRequests.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Stock Requests to Create PO</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>
              close
            </span>
          </button>
        </div>

        {requestedRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No Stock Requests with REQUESTED status.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={onSelectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600">
                  Selected: {selectedRequestIds.length} / {requestedRequests.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={onSelectAll}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requestedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRequestIds.includes(request.id)}
                          onChange={() => onToggleSelection(request.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{request.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.item?.itemName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{request.item?.sku || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestedQty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.priority === 'high' ? 'bg-red-100 text-red-800' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(request.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedRequestIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={onCancelRequests}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel ({selectedRequestIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={onGeneratePO}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Create PO ({selectedRequestIds.length})
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface CreatePOFromRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: StockRequest[];
  onSuccess: () => void;
}

interface POItem {
  requestId: number;
  itemId: number;
  itemName: string;
  sku: string;
  quantity: number;
  supplierId: string;
  unitPrice: string;
  unit: string;
}

const CreatePOFromRequestsModal: React.FC<CreatePOFromRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onSuccess,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [formData, setFormData] = useState({
    expectedDeliveryDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      console.log('CreatePOFromRequestsModal useEffect:', { isOpen, requestsLength: requests.length, requests });
      fetchSuppliers();
      if (requests.length > 0) {
        initializePOItems();
      }
    }
  }, [isOpen, requests.length]);

  const fetchSuppliers = async () => {
    try {
      const response = await enhancedApi.get<Supplier[]>('/suppliers', {}, { maxRetries: 2, retryDelay: 1000 });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      alert('Failed to load suppliers list.');
    }
  };

  const initializePOItems = () => {
    const items: POItem[] = requests.map(req => ({
      requestId: req.id,
      itemId: req.itemId,
      itemName: req.item?.itemName || 'N/A',
      sku: req.item?.sku || 'N/A',
      quantity: req.requestedQty,
      supplierId: '',
      unitPrice: '',
      unit: req.item?.unit || 'pcs',
    }));
    setPoItems(items);
  };

  const handleSupplierChange = (index: number, supplierId: string) => {
    const newItems = [...poItems];
    newItems[index].supplierId = supplierId;
    setPoItems(newItems);
    
    // Group items by supplier - removed unused state setter
  };

  const handleUnitPriceChange = (index: number, unitPrice: string) => {
    const newItems = [...poItems];
    newItems[index].unitPrice = unitPrice;
    setPoItems(newItems);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    } else {
      const expectedDate = new Date(formData.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expectedDate <= today) {
        newErrors.expectedDeliveryDate = 'Expected delivery date must be a future date';
      }
    }

    poItems.forEach((item, index) => {
      if (!item.supplierId) {
        newErrors[`supplier_${index}`] = 'Please select a supplier';
      }
      if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) {
        newErrors[`unitPrice_${index}`] = 'Price must be greater than 0';
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
      // Group items by supplier and store
      const grouped = new Map<string, { storeId: number; supplierId: number; items: any[] }>();
      
      poItems.forEach(item => {
        const request = requests.find(r => r.id === item.requestId);
        if (!request) return;
        
        const key = `${request.storeId}:${item.supplierId}`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            storeId: request.storeId,
            supplierId: parseInt(item.supplierId),
            items: [],
          });
        }
        
        grouped.get(key)!.items.push({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          unit: item.unit,
        });
      });

      // Create PO for each supplier/store group
      const results: Array<{ poId: number; requestIds: number[] }> = [];
      
      for (const [, group] of grouped) {
        const now = new Date();
        const poNumber = `PO-${now.getTime()}-${group.storeId}-${group.supplierId}`;
        const totalAmount = group.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

        const poData = {
          poNumber,
          supplierId: group.supplierId,
          storeId: group.storeId,
          orderDate: now.toISOString(),
          expectedDeliveryDate: formData.expectedDeliveryDate,
          orderItems: group.items,
          totalAmount,
          status: 'pending_approval',
          notes: formData.notes || `Tạo từ ${group.items.length} Stock Request(s)`,
        };

        const poResponse = await enhancedApi.post<{ success?: boolean; data?: PurchaseOrder } | PurchaseOrder>('/procurement', poData);
        // Controller trả về { success: true, data: result } hoặc PurchaseOrder trực tiếp
        const responseData = poResponse.data as { success?: boolean; data?: PurchaseOrder } | PurchaseOrder;
        const po = (responseData && typeof responseData === 'object' && 'data' in responseData) 
          ? responseData.data 
          : (responseData as PurchaseOrder);
        
        if (!po || !po.id) {
          console.error('Failed to get PO ID from response:', poResponse.data);
          throw new Error('Không thể lấy PO ID từ response');
        }

        console.log('Created PO:', po);

        // Update PO Number để sử dụng PO ID (PO Number = PO-{PO ID})
        await enhancedApi.patch(`/procurement/${po.id}`, {
          poNumber: `PO-${po.id}`,
        });

        // Update stock requests với PO ID
        const requestIdsForPO: number[] = [];
        for (const item of group.items) {
          const request = requests.find(r => r.itemId === item.itemId && r.storeId === group.storeId);
          if (request && request.status === 'requested') {
            // Update request với PO ID và status PO_GENERATED
            await enhancedApi.patch(`/stock-requests/${request.id}`, {
              poId: po.id,
              status: 'po_generated',
            });
            requestIdsForPO.push(request.id);
          }
        }

        results.push({ poId: po.id, requestIds: requestIdsForPO });
      }

      alert(`Successfully created ${results.length} purchase order(s) (PO) from selected Stock Requests.`);
      onSuccess();
    } catch (error: unknown) {
      console.error('Failed to create PO:', error);
      let errorMessage = 'Failed to create PO. Please try again.';
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

  if (!isOpen) {
    return null;
  }

  console.log('CreatePOFromRequestsModal rendering:', { isOpen, requestsLength: requests.length });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Purchase Order from Stock Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Items List</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {poItems.map((item, index) => {
                    const total = item.unitPrice ? (item.quantity * parseFloat(item.unitPrice)) : 0;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3">
                          <select
                            value={item.supplierId}
                            onChange={(e) => handleSupplierChange(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                              errors[`supplier_${index}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select Supplier</option>
                            {suppliers.map((supplier) => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                          {errors[`supplier_${index}`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`supplier_${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                              errors[`unitPrice_${index}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                          {errors[`unitPrice_${index}`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`unitPrice_${index}`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {total.toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                  errors.expectedDeliveryDate ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expectedDeliveryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expectedDeliveryDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Notes (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StockRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: StockRequest;
}

const StockRequestDetailModal: React.FC<StockRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Stock Request Details #{request.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>
              close
            </span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
              <p className="text-sm text-gray-900">#{request.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                request.status === 'requested' ? 'bg-blue-100 text-blue-800' :
                request.status === 'po_generated' ? 'bg-purple-100 text-purple-800' :
                request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.status?.toUpperCase() || 'N/A'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
              <p className="text-sm text-gray-900">{request.item?.itemName || 'N/A'}</p>
              <p className="text-xs text-gray-500">{request.item?.sku || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <p className="text-sm text-gray-900">{request.requestedQty} {request.item?.unit || 'pcs'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                request.priority === 'high' ? 'bg-red-100 text-red-800' :
                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.priority?.toUpperCase() || 'N/A'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
              <p className="text-sm text-gray-900">{request.store?.name || `Store #${request.storeId}`}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
              <p className="text-sm text-gray-900">{request.notes && request.notes.includes('Auto-generated') ? 'Auto by Stock Alert' : `User #${request.requestedBy || 'N/A'}`}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">{format(new Date(request.createdAt), 'MMM d, yyyy HH:mm')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO ID</label>
              <p className="text-sm text-gray-900">
                {request.poId ? (
                  <a 
                    href={`/procurement`} 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/procurement`;
                    }}
                  >
                    PO-{request.poId}
                  </a>
                ) : '-'}
              </p>
            </div>
            {request.notes && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
          <button
            type="button"
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

export default StockRequests;

