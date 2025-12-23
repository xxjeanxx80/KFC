import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../context/useAuth';
import NotificationDropdown from '../components/NotificationDropdown';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['STORE_MANAGER', 'PROCUREMENT_STAFF', 'ADMIN'] },
    { path: '/inventory', label: 'Inventory', icon: 'inventory_2', roles: ['STORE_MANAGER', 'INVENTORY_STAFF', 'ADMIN'] },
    { path: '/temperature-monitoring', label: 'Temperature Monitoring', icon: 'thermostat', roles: ['STORE_MANAGER', 'INVENTORY_STAFF', 'ADMIN'] },
    { path: '/inventory-transactions', label: 'Inventory Transactions', icon: 'history', roles: ['STORE_MANAGER', 'INVENTORY_STAFF', 'ADMIN'] },
    { path: '/stock-requests', label: 'Stock Requests', icon: 'assignment', roles: ['STORE_MANAGER', 'PROCUREMENT_STAFF', 'ADMIN'] },
    { path: '/procurement', label: 'Procurement', icon: 'shopping_cart', roles: ['STORE_MANAGER', 'PROCUREMENT_STAFF', 'INVENTORY_STAFF', 'ADMIN'] },
    { path: '/suppliers', label: 'Suppliers', icon: 'local_shipping', roles: ['STORE_MANAGER', 'PROCUREMENT_STAFF', 'ADMIN'] },
    { path: '/sales', label: 'Sales', icon: 'point_of_sale', roles: ['STORE_MANAGER', 'ADMIN'] },
    { path: '/reports', label: 'Reports', icon: 'bar_chart', roles: ['STORE_MANAGER', 'ADMIN'] },
    { path: '/users', label: 'User Management', icon: 'people', roles: ['ADMIN'] },
  ];

  // Filter items based on user role
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';
  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(userRole)
  );

  return (
    <div className="flex h-screen bg-background text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg z-20 h-screen">
        {/* Header - Fixed */}
        <div className="h-20 flex items-center px-8 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>fastfood</span>
            KFC SCM
          </h1>
        </div>
        
        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto mt-6 px-4 space-y-1 pb-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  'sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl group relative overflow-hidden transition-all',
                  isActive
                    ? 'bg-red-50 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"></div>
                )}
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="sidebar-link flex items-center gap-3 px-4 py-3 text-primary font-medium hover:bg-red-50 rounded-xl transition-colors w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 relative z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {filteredNavItems.find(item => item.path === location.pathname)?.label || 'Dashboard Overview'}
          </h2>
          
          <div className="flex items-center gap-6 relative z-10">
            <NotificationDropdown />
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{userRole || 'Staff'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
