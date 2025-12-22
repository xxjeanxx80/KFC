import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import InventoryTransactions from './pages/InventoryTransactions';
import StockRequests from './pages/StockRequests';
import Procurement from './pages/Procurement';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomeRedirect />} />
              
              {/* Dashboard - STORE_MANAGER (FULL), PROCUREMENT_STAFF (read-only), ADMIN (optional) */}
              <Route 
                path="dashboard" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'PROCUREMENT_STAFF', 'ADMIN']}>
                    <Dashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Inventory - STORE_MANAGER (view only) and INVENTORY_STAFF (view, update, GRN) */}
              <Route 
                path="inventory" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'INVENTORY_STAFF', 'ADMIN']}>
                    <Inventory />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Inventory Transactions - STORE_MANAGER, INVENTORY_STAFF, ADMIN */}
              <Route 
                path="inventory-transactions" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'INVENTORY_STAFF', 'ADMIN']}>
                    <InventoryTransactions />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Stock Requests - STORE_MANAGER (create), PROCUREMENT_STAFF (approve), ADMIN */}
              <Route 
                path="stock-requests" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'PROCUREMENT_STAFF', 'ADMIN']}>
                    <StockRequests />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Procurement - STORE_MANAGER (approve), PROCUREMENT_STAFF (create/edit), INVENTORY_STAFF (view only) */}
              <Route 
                path="procurement" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'PROCUREMENT_STAFF', 'INVENTORY_STAFF', 'ADMIN']}>
                    <Procurement />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Suppliers - STORE_MANAGER (view only) and PROCUREMENT_STAFF (manage) */}
              <Route 
                path="suppliers" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'PROCUREMENT_STAFF', 'ADMIN']}>
                    <Suppliers />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Sales - STORE_MANAGER, ADMIN */}
              <Route 
                path="sales" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'ADMIN']}>
                    <Sales />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Reports - STORE_MANAGER only */}
              <Route 
                path="reports" 
                element={
                  <RoleProtectedRoute allowedRoles={['STORE_MANAGER', 'ADMIN']}>
                    <Reports />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Users - ADMIN only */}
              <Route 
                path="users" 
                element={
                  <RoleProtectedRoute allowedRoles={['ADMIN']}>
                    <Users />
                  </RoleProtectedRoute>
                } 
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;