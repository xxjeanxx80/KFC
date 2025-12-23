import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, ShoppingCart, Package, AlertTriangle, ChevronRight } from 'lucide-react';
import { enhancedApi } from '../services/enhanced-api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface Notification {
  id: string;
  type: 'po_approval' | 'low_stock' | 'stock_request' | 'out_of_stock' | 'expiry_warning' | 'below_min_threshold' | 'above_max_threshold' | 'auto_stock_request_created';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  link?: string;
  createdAt: string;
  count?: number;
  itemId?: number;
  itemName?: string;
  sku?: string;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    // Only fetch if user is authenticated and token exists
    if (isAuthenticated && token) {
      fetchNotifications();
      // Refresh notifications every 7 seconds for real-time updates
      const interval = setInterval(() => {
        if (isAuthenticated && token) {
          fetchNotifications();
        }
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Tính toán vị trí dropdown từ button
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right,
        });
      }
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      setDropdownPosition(null);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    // Don't fetch if not authenticated or token doesn't exist
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      setLoading(true);
      const response = await enhancedApi.get<Notification[]>('/notifications');
      setNotifications(response.data || []);
    } catch (error: unknown) {
      // Silently fail for 401 errors (user not logged in)
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status !== 401) {
          console.error('Failed to fetch notifications:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'po_approval':
        return <ShoppingCart className="w-5 h-5" />;
      case 'low_stock':
      case 'out_of_stock':
        return <Package className="w-5 h-5" />;
      case 'stock_request':
        return <AlertTriangle className="w-5 h-5" />;
      case 'below_min_threshold':
      case 'above_max_threshold':
        return <AlertTriangle className="w-5 h-5" />;
      case 'auto_stock_request_created':
        return <Bell className="w-5 h-5" />;
      case 'expiry_warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    // Special colors for specific notification types
    if (type === 'below_min_threshold' || type === 'out_of_stock') {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (type === 'above_max_threshold') {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    if (type === 'auto_stock_request_created') {
      return 'text-purple-600 bg-purple-50 border-purple-200';
    }
    
    // Default colors based on priority
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const totalCount = notifications.reduce((sum, n) => sum + (n.count || 1), 0);

  return (
    <>
      <div className="relative z-50" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors z-50"
          title="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          {totalCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white z-50">
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && dropdownPosition && createPortal(
        <div 
          className="fixed w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] flex flex-col"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            zIndex: 99999,
          }}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type, notification.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-0.5 ${getNotificationColor(notification.type, notification.priority).split(' ')[0]}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                          {notification.count && notification.count > 1 && (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {notification.count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {notification.link && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/reports');
                  setIsOpen(false);
                }}
                className="w-full text-sm text-primary hover:text-blue-700 font-medium text-center"
              >
                View All Reports
              </button>
            </div>
          )}
        </div>
      , document.body)}
    </>
  );
};

export default NotificationDropdown;

