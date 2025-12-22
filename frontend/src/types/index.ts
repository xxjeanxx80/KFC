export interface Role {
  id: number;
  code: string;
  name: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string | Role;
  storeId?: number;
  store?: Store;
}

export interface Store {
  id: number;
  code: string;
  name: string;
  location: string;
}

export interface Item {
  id: number;
  itemName: string;
  sku: string;
  category: string;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  isActive?: boolean;
}

export interface InventoryBatch {
  id: number;
  itemId: number;
  item: Item;
  batchNo: string;
  expiryDate: string;
  quantityOnHand: number;
  temperature?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  reliabilityScore: number;
}

export interface PurchaseOrderItem {
  id: number;
  itemId: number;
  item: Item;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplier: Supplier;
  storeId: number;
  store?: Store;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  confirmedBy?: number;
  confirmedAt?: string;
  supplierNotes?: string;
}

export interface GoodsReceipt {
  id: number;
  grnNumber: string;
  poId: number;
  purchaseOrder?: PurchaseOrder;
  receivedDate: string;
  receivedBy: number;
  receivedByUser?: User;
  items: GoodsReceiptItem[];
  createdAt: string;
}

export interface GoodsReceiptItem {
  id: number;
  grnId: number;
  itemId: number;
  item?: Item;
  batchNo: string;
  expiryDate: string;
  receivedQty: number;
}

export interface StockRequest {
  id: number;
  storeId: number;
  store?: Store;
  itemId: number;
  item?: Item;
  requestedQty: number;
  status: 'requested' | 'pending_approval' | 'approved' | 'rejected' | 'po_generated' | 'fulfilled' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  requestedBy?: number;
  approvedBy?: number;
  approvedAt?: string;
  poId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesTransaction {
  id: number;
  storeId: number;
  store?: Store;
  itemId: number;
  item?: Item;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  costPrice?: number;
  totalCost?: number;
  grossProfit?: number;
  saleDate: string;
  createdBy?: number;
  user?: User;
  notes?: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: number;
  batchId: number;
  batch?: InventoryBatch;
  itemId: number;
  item?: Item;
  transactionType: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT';
  quantity: number;
  referenceType: 'PO' | 'GRN' | 'ADJUSTMENT';
  referenceId?: number;
  createdBy?: number;
  user?: User;
  createdAt: string;
}