import { useState } from 'react';
import { enhancedApi } from '../services/enhanced-api';
import { toast } from 'sonner';

// Generic CRUD operations
export const createEntity = async (endpoint: string, data: unknown, successMessage: string = 'Created successfully'): Promise<unknown> => {
  try {
    const response = await enhancedApi.post(endpoint, data, {}, { maxRetries: 2, retryDelay: 1000 });
    toast.success(successMessage);
    return response.data;
  } catch (error) {
    console.error(`Failed to create ${endpoint}:`, error);
    toast.error(`Failed to create ${endpoint}. Please try again.`);
    throw error;
  }
};

export const updateEntity = async (endpoint: string, id: number, data: unknown, successMessage: string = 'Updated successfully'): Promise<unknown> => {
  try {
    const response = await enhancedApi.patch(`${endpoint}/${id}`, data, {}, { maxRetries: 2, retryDelay: 1000 });
    toast.success(successMessage);
    return response.data;
  } catch (error) {
    console.error(`Failed to update ${endpoint}:`, error);
    toast.error(`Failed to update ${endpoint}. Please try again.`);
    throw error;
  }
};

export const deleteEntity = async (endpoint: string, id: number, successMessage: string = 'Deleted successfully'): Promise<void> => {
  try {
    await enhancedApi.delete(`${endpoint}/${id}`, {}, { maxRetries: 2, retryDelay: 1000 });
    toast.success(successMessage);
  } catch (error) {
    console.error(`Failed to delete ${endpoint}:`, error);
    toast.error(`Failed to delete ${endpoint}. Please try again.`);
    throw error;
  }
};

export const fetchEntities = async <T = unknown>(endpoint: string): Promise<T> => {
  try {
    const response = await enhancedApi.get(endpoint, {}, { maxRetries: 2, retryDelay: 1000 });
    return response.data as T;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    toast.error(`Failed to fetch ${endpoint}. Please try again.`);
    throw error;
  }
};

// Form validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

export const validateNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Date helpers
export const formatDateForInput = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const isDateExpired = (date: string | Date): boolean => {
  if (!date) return false;
  return new Date(date) < new Date();
};

// Role-based permissions
export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const canEditEntity = (userRole: string, entityType: string): boolean => {
  const permissions: Record<string, string[]> = {
    users: ['ADMIN'],
    inventory: ['INVENTORY_STAFF', 'STORE_MANAGER'],
    procurement: ['PROCUREMENT_STAFF', 'STORE_MANAGER'],
    suppliers: ['PROCUREMENT_STAFF', 'STORE_MANAGER']
  };
  
  return hasPermission(userRole, permissions[entityType] || []);
};

// Status helpers
export const getStatusBadgeVariant = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'danger',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'draft': 'default',
    'sent': 'info',
    'delivered': 'success',
    'cancelled': 'danger',
    'in_stock': 'success',
    'low_stock': 'warning',
    'out_of_stock': 'danger',
    'expired': 'danger',
    'pending_approval': 'warning'
  };
  
  return statusMap[status] || 'default';
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency 
  }).format(amount);
};

// Loading states
export const useLoadingState = <T extends object>(initialState: T): [T, (key: keyof T, value: boolean) => void] => {
  const [loading, setLoading] = useState<T>(initialState);
  
  const setLoadingState = (key: keyof T, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };
  
  return [loading, setLoadingState];
};

// Error handling
export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred') => {
  const hasResponse = typeof error === 'object' && error !== null && 'response' in (error as object);
  if (hasResponse) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    const msg = resp?.data?.message;
    if (typeof msg === 'string') {
      toast.error(msg);
    } else {
      toast.error(defaultMessage);
    }
  } else {
    toast.error(defaultMessage);
  }
  console.error('API Error:', error as unknown);
};

// Modal helpers
export const useModal = <T = unknown>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  
  const openModal = (item: T | null = null) => {
    setSelectedItem(item);
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setSelectedItem(null);
    setIsOpen(false);
  };
  
  return { isOpen, selectedItem, openModal, closeModal };
};

// Filter helpers
export const applyFilters = <T>(items: T[], filters: Record<string, string>, filterFns: Record<string, (item: T, value: string) => boolean>): T[] => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const filterFn = filterFns[key];
      return filterFn ? filterFn(item, value) : true;
    });
  });
};
