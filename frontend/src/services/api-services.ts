import { enhancedApi } from './enhanced-api';
import type { 
  User, 
  Supplier, 
  PurchaseOrder, 
  InventoryBatch, 
  Item,
  StockRequest,
  GoodsReceipt,
  SalesTransaction,
  InventoryTransaction,
  TemperatureLog
} from '../types';

// ==================== AUTH ====================
export const authService = {
  login: async (username: string, password: string) => {
    const response = await enhancedApi.post<{ access_token: string; user: User }>(
      '/auth/login',
      { username, password }
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await enhancedApi.get('/auth/profile');
    return response.data;
  },
};

// ==================== USERS ====================
export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await enhancedApi.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await enhancedApi.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await enhancedApi.post<User>('/users', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await enhancedApi.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await enhancedApi.delete(`/users/${id}`);
  },
};

// ==================== SUPPLIERS ====================
export const suppliersService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await enhancedApi.get<Supplier[]>('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await enhancedApi.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Supplier>): Promise<Supplier> => {
    const response = await enhancedApi.post<Supplier>('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
    const response = await enhancedApi.patch<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await enhancedApi.delete(`/suppliers/${id}`);
  },
};

// ==================== PROCUREMENT ====================
export const procurementService = {
  getAll: async (params?: { status?: string; supplierId?: number }): Promise<PurchaseOrder[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId.toString());
    
    const url = `/procurement${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await enhancedApi.get<PurchaseOrder[]>(url);
    return response.data;
  },

  getPendingApprovals: async (): Promise<PurchaseOrder[]> => {
    const response = await enhancedApi.get<PurchaseOrder[]>('/procurement?status=pending_approval');
    return response.data;
  },

  getById: async (id: number): Promise<PurchaseOrder> => {
    const response = await enhancedApi.get<PurchaseOrder>(`/procurement/${id}`);
    const po = response.data;
    // Kiểm tra xem PO có items không
    if (!po.items || po.items.length === 0) {
      console.warn('PO không có items:', po);
    }
    return po;
  },

  create: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<PurchaseOrder>('/procurement', data);
    return response.data;
  },

  update: async (id: number, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await enhancedApi.patch<PurchaseOrder>(`/procurement/${id}`, data);
    return response.data;
  },

  approve: async (id: number): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<PurchaseOrder>(`/procurement/${id}/approve`, {});
    return response.data;
  },

  reject: async (id: number, reason?: string): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<PurchaseOrder>(`/procurement/${id}/reject`, { reason });
    return response.data;
  },

  send: async (id: number): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<PurchaseOrder>(`/procurement/${id}/send`, {});
    return response.data;
  },

  confirm: async (id: number, data?: { expectedDeliveryDate?: string; supplierNotes?: string }): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<{ success: boolean; data: PurchaseOrder }>(`/procurement/${id}/confirm`, data || {});
    return response.data.data || response.data;
  },

  receive: async (id: number): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<{ success: boolean; data: PurchaseOrder }>(`/procurement/${id}/receive`, {});
    const po = response.data.data || response.data;
    // Đảm bảo response có structure đúng
    if (!po) {
      throw new Error('Không nhận được dữ liệu PO từ server');
    }
    return po;
  },

  rejectReceipt: async (id: number, rejectionReason: string): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<{ success: boolean; data: PurchaseOrder }>(`/procurement/${id}/reject-receipt`, { rejectionReason });
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await enhancedApi.delete(`/procurement/${id}`);
  },
};

// ==================== INVENTORY ====================
export const inventoryService = {
  getAllBatches: async (): Promise<InventoryBatch[]> => {
    const response = await enhancedApi.get<InventoryBatch[]>('/inventory-batches');
    return response.data;
  },

  getBatchById: async (id: number): Promise<InventoryBatch> => {
    const response = await enhancedApi.get<InventoryBatch>(`/inventory-batches/${id}`);
    return response.data;
  },

  createBatch: async (data: Partial<InventoryBatch>): Promise<InventoryBatch> => {
    const response = await enhancedApi.post<InventoryBatch>('/inventory-batches', data);
    return response.data;
  },

  updateBatch: async (id: number, data: Partial<InventoryBatch>): Promise<InventoryBatch> => {
    const response = await enhancedApi.patch<InventoryBatch>(`/inventory-batches/${id}`, data);
    return response.data;
  },

  deleteBatch: async (id: number): Promise<void> => {
    await enhancedApi.delete(`/inventory-batches/${id}`);
  },
};

// ==================== ITEMS ====================
export const itemsService = {
  getAll: async (): Promise<Item[]> => {
    const response = await enhancedApi.get<Item[]>('/items');
    return response.data;
  },

  getById: async (id: number): Promise<Item> => {
    const response = await enhancedApi.get<Item>(`/items/${id}`);
    return response.data;
  },

  create: async (data: Partial<Item>): Promise<Item> => {
    const response = await enhancedApi.post<Item>('/items', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Item>): Promise<Item> => {
    const response = await enhancedApi.patch<Item>(`/items/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await enhancedApi.delete(`/items/${id}`);
  },
};

// ==================== GOODS RECEIPTS ====================
export const goodsReceiptsService = {
  getAll: async (): Promise<GoodsReceipt[]> => {
    const response = await enhancedApi.get<GoodsReceipt[]>('/goods-receipts');
    return response.data;
  },

  getById: async (id: number): Promise<GoodsReceipt> => {
    const response = await enhancedApi.get<GoodsReceipt>(`/goods-receipts/${id}`);
    return response.data;
  },

  create: async (data: {
    poId: number;
    receivedDate: string;
    receivedBy: number;
    items: Array<{
      itemId: number;
      batchNo: string;
      expiryDate: string;
      receivedQty: number;
      temperature?: number;
    }>;
  }): Promise<GoodsReceipt> => {
    const response = await enhancedApi.post<GoodsReceipt>('/goods-receipts', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await enhancedApi.delete(`/goods-receipts/${id}`);
  },
};

// ==================== STOCK REQUESTS ====================
export const stockRequestsService = {
  getAll: async (): Promise<StockRequest[]> => {
    const response = await enhancedApi.get<StockRequest[]>('/stock-requests');
    return response.data;
  },

  getById: async (id: number): Promise<StockRequest> => {
    const response = await enhancedApi.get<StockRequest>(`/stock-requests/${id}`);
    return response.data;
  },

  create: async (data: Partial<StockRequest>): Promise<StockRequest> => {
    const response = await enhancedApi.post<StockRequest>('/stock-requests', data);
    return response.data;
  },

  update: async (id: number, data: { poId?: number; status?: 'requested' | 'po_generated' | 'cancelled' }): Promise<StockRequest> => {
    const response = await enhancedApi.patch<StockRequest>(`/stock-requests/${id}`, data);
    return response.data;
  },

  generatePOFromRequests: async (requestIds: number[]): Promise<Array<{ poId: number; requestIds: number[] }>> => {
    const response = await enhancedApi.post<Array<{ poId: number; requestIds: number[] }>>('/stock-requests/generate-po', { requestIds });
    return response.data;
  },

  cancelRequests: async (requestIds: number[]): Promise<{ cancelled: number; requestIds: number[] }> => {
    const response = await enhancedApi.post<{ cancelled: number; requestIds: number[] }>('/stock-requests/cancel', { requestIds });
    return response.data;
  },

  autoGeneratePO: async (storeId?: number): Promise<Array<{ poId: number; requestIds: number[] }>> => {
    const url = storeId ? `/stock-requests/auto-po?storeId=${storeId}` : '/stock-requests/auto-po';
    const response = await enhancedApi.post<Array<{ poId: number; requestIds: number[] }>>(url, {});
    return response.data;
  },

  autoReplenish: async (storeId?: number): Promise<Array<{ itemId: number; stockRequestId?: number; poId?: number }>> => {
    const url = storeId ? `/stock-requests/auto-replenish?storeId=${storeId}` : '/stock-requests/auto-replenish';
    const response = await enhancedApi.post<Array<{ itemId: number; stockRequestId?: number; poId?: number }>>(url, {});
    return response.data;
  },

  expressOrder: async (itemId: number, storeId: number, requestedQty: number): Promise<PurchaseOrder> => {
    const response = await enhancedApi.post<PurchaseOrder>('/stock-requests/express-order', {
      itemId,
      storeId,
      requestedQty,
    });
    return response.data;
  },
};

// ==================== SALES ====================
export const salesService = {
  getAll: async (storeId?: number): Promise<SalesTransaction[]> => {
    const url = storeId ? `/sales?storeId=${storeId}` : '/sales';
    const response = await enhancedApi.get<SalesTransaction[]>(url);
    return response.data;
  },

  getById: async (id: number): Promise<SalesTransaction> => {
    const response = await enhancedApi.get<SalesTransaction>(`/sales/${id}`);
    return response.data;
  },

  create: async (data: {
    storeId: number;
    itemId: number;
    quantity: number;
    unitPrice: number;
    saleDate: string;
    notes?: string;
  }): Promise<SalesTransaction> => {
    const response = await enhancedApi.post<{ success: boolean; data: SalesTransaction }>('/sales', data);
    return response.data.data || response.data;
  },
};

// ==================== REPORTS ====================
export const reportsService = {
  getDashboard: async () => {
    const response = await enhancedApi.get('/reports/dashboard');
    return response.data;
  },

  getInventoryReport: async () => {
    const response = await enhancedApi.get('/reports/inventory');
    return response.data;
  },

  getProcurementReport: async () => {
    const response = await enhancedApi.get('/reports/procurement');
    return response.data;
  },

  getSalesReport: async (storeId?: number) => {
    const url = storeId ? `/reports/sales?storeId=${storeId}` : '/reports/sales';
    const response = await enhancedApi.get(url);
    return response.data;
  },

  getLowStockAlerts: async () => {
    const response = await enhancedApi.get('/reports/low-stock-alerts');
    return response.data;
  },

  getExpiredItems: async (daysThreshold?: number): Promise<Array<{
    itemId: number;
    itemName: string;
    sku: string;
    batchNo: string;
    expiryDate: string;
    daysUntilExpiry: number;
    quantityOnHand: number;
    status: string;
  }>> => {
    const url = daysThreshold 
      ? `/reports/expired-items?daysThreshold=${daysThreshold}`
      : '/reports/expired-items';
    const response = await enhancedApi.get<Array<{
      itemId: number;
      itemName: string;
      sku: string;
      batchNo: string;
      expiryDate: string;
      daysUntilExpiry: number;
      quantityOnHand: number;
      status: string;
    }>>(url);
    return response.data || [];
  },
};

// ==================== STORES ====================
export const storesService = {
  getAll: async () => {
    const response = await enhancedApi.get('/stores');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await enhancedApi.get(`/stores/${id}`);
    return response.data;
  },
};

// ==================== ROLES ====================
export const rolesService = {
  getAll: async () => {
    const response = await enhancedApi.get('/roles');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await enhancedApi.get(`/roles/${id}`);
    return response.data;
  },
};

// ==================== NOTIFICATIONS ====================
export const notificationsService = {
  getAll: async () => {
    const response = await enhancedApi.get('/notifications');
    return response.data;
  },
};

// ==================== INVENTORY TRANSACTIONS ====================
export const inventoryTransactionsService = {
  getAll: async (filters?: {
    transactionType?: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT';
    itemId?: number;
    batchId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<InventoryTransaction[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.transactionType) queryParams.append('transactionType', filters.transactionType);
    if (filters?.itemId) queryParams.append('itemId', filters.itemId.toString());
    if (filters?.batchId) queryParams.append('batchId', filters.batchId.toString());
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    
    const url = `/inventory-transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await enhancedApi.get<InventoryTransaction[]>(url);
    return response.data;
  },

  getById: async (id: number): Promise<InventoryTransaction> => {
    const response = await enhancedApi.get<InventoryTransaction>(`/inventory-transactions/${id}`);
    return response.data;
  },
};

// ==================== ADMIN ====================
export const adminService = {
  adjustInventory: async (data: {
    itemId: number;
    storeId: number;
    batchNo: string;
    quantityChange: number;
    expiryDate?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; data: InventoryBatch }> => {
    const response = await enhancedApi.post<{ success: boolean; message: string; data: InventoryBatch }>(
      '/admin/inventory/adjust',
      data
    );
    return response.data;
  },

  setTemperature: async (data: {
    batchId: number;
    temperature: number;
  }): Promise<{ success: boolean; message: string; data: InventoryBatch }> => {
    const response = await enhancedApi.post<{ success: boolean; message: string; data: InventoryBatch }>(
      '/admin/temperature/set',
      data
    );
    return response.data;
  },
};

// ==================== TEMPERATURE ====================
export const temperatureService = {
  getBatchesWithAlerts: async (): Promise<InventoryBatch[]> => {
    const response = await enhancedApi.get<InventoryBatch[]>('/temperature/alerts');
    return response.data;
  },

  checkAlerts: async (): Promise<{ message: string }> => {
    const response = await enhancedApi.post<{ message: string }>('/temperature/check', {});
    return response.data;
  },
};

