import React, { useEffect, useState } from 'react';
import { reportsService } from '../services/api-services';
import { toast } from 'sonner';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardData {
  totalInventoryValue: number;
  lowStockItems: number;
  pendingPOApprovals: number;
  stockOutRisk: number;
  grossProfit?: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    margin: number;
    period: string;
  };
  itemsBelowSafetyStock?: Array<{
    itemId: number;
    itemName: string;
    sku: string;
    currentStock: number;
    safetyStock: number;
    difference: number;
  }>;
  itemsBelowSafetyStockCount?: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      const dashboardData = await reportsService.getDashboard() as DashboardData;
      setData(dashboardData);
    } catch (error: unknown) {
      console.error('Failed to fetch dashboard data:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status !== 401) {
          toast.error('Failed to load dashboard data');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusText = (label: string, value: number) => {
    switch (label) {
      case 'Total Inventory Value':
        return 'Updated just now';
      case 'Low Stock Items':
        return value > 0 ? 'Action needed' : 'All good';
      case 'Pending PO Approvals':
        return value > 0 ? 'Needs attention' : 'All caught up';
      case 'Stock-out Risk':
        return value > 0 ? 'Critical' : 'Stable';
      case 'Gross Profit (30d)':
        return '';
      default:
        return '';
    }
  };

  const getStatusColor = (label: string, value: number) => {
    switch (label) {
      case 'Low Stock Items':
        return value > 0 ? 'text-orange-500 font-medium' : 'text-gray-400';
      case 'Stock-out Risk':
        return value > 0 ? 'text-red-500 font-medium' : 'text-green-500 font-medium';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load dashboard data</div>
      </div>
    );
  }

  // 4 cards đầu tiên - luôn hiển thị
  const stats = [
    { 
      label: 'Total Inventory Value', 
      value: formatCurrency(data.totalInventoryValue),
      icon: 'monitoring',
      bgGradient: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    { 
      label: 'Low Stock Items', 
      value: data.lowStockItems.toString(),
      icon: 'warning',
      bgGradient: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    { 
      label: 'Pending PO Approvals', 
      value: data.pendingPOApprovals.toString(),
      icon: 'schedule',
      bgGradient: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    { 
      label: 'Stock-out Risk', 
      value: data.stockOutRisk.toString(),
      icon: 'trending_down',
      bgGradient: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  // Chuẩn bị dữ liệu cho biểu đồ Gross Profit
  const grossProfitChartData = data.grossProfit ? [
    {
      name: 'Gross Profit (30d)',
      Revenue: data.grossProfit.totalRevenue,
      Cost: data.grossProfit.totalCost,
      'Gross Profit': data.grossProfit.grossProfit,
    }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Stats Cards - 4 cards đầu tiên thành 1 hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Background Gradient */}
            <div className={`absolute right-0 top-0 h-16 w-16 ${stat.bgGradient} rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110`}></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <div className={`p-1.5 ${stat.iconBg} ${stat.iconColor} rounded-lg`}>
                  <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{stat.value}</h3>
              <p className={`text-xs mt-1 ${getStatusColor(stat.label, Number(stat.value))}`}>
                {getStatusText(stat.label, Number(stat.value))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gross Profit Chart */}
      {data.grossProfit && grossProfitChartData.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Gross Profit (30d)</h3>
            <p className="text-sm text-gray-500 mt-1">
              Margin: <span className="font-medium text-gray-700">{data.grossProfit.margin.toFixed(1)}%</span>
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={grossProfitChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="Revenue" 
                fill="#3b82f6" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="Cost" 
                fill="#ef4444" 
                name="Cost"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="Gross Profit" 
                fill="#10b981" 
                name="Gross Profit"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items Below Safety Stock */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900">Items Below Safety Stock</h3>
            {data.itemsBelowSafetyStockCount !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {data.itemsBelowSafetyStockCount} item{data.itemsBelowSafetyStockCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="p-4 flex-1">
            {data.itemsBelowSafetyStock && data.itemsBelowSafetyStock.length > 0 ? (
              <div className="space-y-3">
                {data.itemsBelowSafetyStock.map((item) => (
                  <div 
                    key={item.itemId} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100"
                  >
                    <div className="p-1.5 bg-white rounded-lg shadow-sm text-orange-500 shrink-0">
                      <span className="material-symbols-outlined text-lg">package_2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">{item.itemName}</h4>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="font-medium text-red-600">Current: {item.currentStock}</span>
                        <span className="text-gray-300">|</span>
                        <span>Safety: {item.safetyStock}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium text-blue-600">Need: {item.difference}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/procurement')}
                      className="text-xs font-medium text-primary hover:text-primary-hover underline underline-offset-2"
                    >
                      Order
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">package_2</span>
                <p className="text-sm">All items are above safety stock</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 rounded-b-lg border-t border-gray-200 text-center">
            <button 
              onClick={() => navigate('/inventory')}
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              View all inventory
            </button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          
          <div className="p-4 flex-1 flex flex-col justify-center">
            {data.lowStockItems > 0 ? (
              <div className="rounded-lg border-l-4 border-primary bg-red-50 p-4 flex gap-3 items-start">
                <div className="text-primary shrink-0">
                  <span className="material-symbols-outlined text-xl">report_problem</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {data.lowStockItems} item{data.lowStockItems !== 1 ? 's' : ''} running low on stock
                  </h4>
                  <p className="mt-1 text-xs text-gray-600">
                    Immediate action recommended to prevent stock-out. Check inventory page for detailed breakdown.
                  </p>
                  <div className="mt-2">
                    <button 
                      onClick={() => navigate('/inventory')}
                      className="text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded shadow-sm hover:bg-primary-hover transition-colors"
                    >
                      Review Alert
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">check_circle</span>
                <p className="text-sm">No low stock alerts</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 rounded-b-lg border-t border-gray-200 text-center">
            <button 
              onClick={() => navigate('/reports')}
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              System Health Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
