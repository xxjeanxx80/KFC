import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { salesService } from '../services/api-services';
import type { SalesTransaction } from '../types';
import { Button } from '../components/ui';
import { useAuth } from '../context/useAuth';
import SalesModal from '../components/SalesModal';

const Sales: React.FC = () => {
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const { user } = useAuth();
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';
  const storeId = user?.storeId;

  useEffect(() => {
    if (userRole === 'STORE_MANAGER' || userRole === 'ADMIN') {
      fetchSales();
    }
  }, [userRole, storeId]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const salesData = await salesService.getAll(storeId);
      setSales(salesData);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getGrossProfitColor = (profit: number | undefined) => {
    if (profit === undefined || profit === null) return 'text-gray-500';
    if (profit > 0) return 'text-green-600 font-semibold';
    if (profit < 0) return 'text-red-600 font-semibold';
    return 'text-gray-500';
  };

  const handleSalesModalClose = () => {
    setIsSalesModalOpen(false);
  };

  const handleSaveSale = () => {
    fetchSales();
  };

  if (userRole !== 'STORE_MANAGER' && userRole !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Bạn không có quyền truy cập trang này.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý giao dịch bán hàng và tính toán lợi nhuận.</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center"
          onClick={() => setIsSalesModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Sale
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No sales transactions found.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(sale.saleDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.item?.itemName || `Item ${sale.itemId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(sale.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(sale.totalCost)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getGrossProfitColor(sale.grossProfit)}`}>
                      {formatCurrency(sale.grossProfit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SalesModal
        isOpen={isSalesModalOpen}
        onClose={handleSalesModalClose}
        onSave={handleSaveSale}
        storeId={storeId}
      />
    </div>
  );
};

export default Sales;

