import React, { useEffect, useState } from 'react';
import { AlertTriangle, Thermometer, CheckCircle, XCircle } from 'lucide-react';
import { inventoryService, temperatureService } from '../services/api-services';
import type { InventoryBatch } from '../types';
import { useAuth } from '../context/useAuth';
import AdminTemperatureModal from '../components/AdminTemperatureModal';

const TemperatureMonitoring: React.FC = () => {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [alertBatches, setAlertBatches] = useState<InventoryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'alerts' | 'cold' | 'frozen'>('all');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const { user } = useAuth();
  const userRole = user ? (typeof user.role === 'string' ? user.role : user.role.code) : '';

  useEffect(() => {
    fetchBatches();
    // Refresh every 10 seconds để cập nhật nhiệt độ real-time
    const interval = setInterval(() => {
      fetchBatches();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const allBatches = await inventoryService.getAllBatches();
      const alerts = await temperatureService.getBatchesWithAlerts();
      
      setBatches(allBatches.filter(b => b.quantityOnHand > 0 && b.temperature !== null && b.temperature !== undefined));
      setAlertBatches(alerts);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureStatus = (batch: InventoryBatch): { status: 'ok' | 'warning' | 'alert'; color: string; icon: React.ReactNode } => {
    if (!batch.item || batch.temperature === null || batch.temperature === undefined) {
      return { status: 'ok', color: 'text-gray-500', icon: <Thermometer className="w-5 h-5" /> };
    }

    const item = batch.item;
    const storageType = item.storageType || 'cold';
    const minTemp = item.minTemperature ?? (storageType === 'frozen' ? -18 : 2);
    const maxTemp = item.maxTemperature ?? (storageType === 'frozen' ? -15 : 8);
    const currentTemp = batch.temperature;

    if (currentTemp < minTemp || currentTemp > maxTemp) {
      const diff = currentTemp < minTemp ? minTemp - currentTemp : currentTemp - maxTemp;
      if (diff > 5) {
        return { status: 'alert', color: 'text-red-600', icon: <XCircle className="w-5 h-5" /> };
      }
      return { status: 'warning', color: 'text-yellow-600', icon: <AlertTriangle className="w-5 h-5" /> };
    }

    // Check if near threshold (±1°C)
    const nearMin = Math.abs(currentTemp - minTemp) <= 1;
    const nearMax = Math.abs(currentTemp - maxTemp) <= 1;
    if (nearMin || nearMax) {
      return { status: 'warning', color: 'text-yellow-500', icon: <AlertTriangle className="w-5 h-5" /> };
    }

    return { status: 'ok', color: 'text-green-600', icon: <CheckCircle className="w-5 h-5" /> };
  };

  const filteredBatches = batches.filter(batch => {
    if (filter === 'alerts') {
      return alertBatches.some(ab => ab.id === batch.id);
    }
    if (filter === 'cold') {
      return batch.item?.storageType === 'cold';
    }
    if (filter === 'frozen') {
      return batch.item?.storageType === 'frozen';
    }
    return true;
  });

  const stats = {
    total: batches.length,
    alerts: alertBatches.length,
    averageTemp: batches.length > 0
      ? batches.reduce((sum, b) => sum + (b.temperature || 0), 0) / batches.length
      : 0,
  };

  const handleAdminModalClose = () => {
    setIsAdminModalOpen(false);
    setSelectedBatch(null);
    fetchBatches();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Temperature Monitoring</h1>
        {userRole === 'ADMIN' && (
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Thermometer className="w-5 h-5" />
            Set Temperature
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Batches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Temperature Alerts</p>
              <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Temperature</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageTemp.toFixed(1)}°C
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('alerts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'alerts'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Alerts ({stats.alerts})
        </button>
        <button
          onClick={() => setFilter('cold')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'cold'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Cold Storage
        </button>
        <button
          onClick={() => setFilter('frozen')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'frozen'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Frozen Storage
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">Batch No</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">Item Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">SKU</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">Storage Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">Current Temp</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">Range</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">Status</th>
                {userRole === 'ADMIN' && (
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 8 : 7} className="px-6 py-8 text-center text-gray-500">
                    No batches found
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const tempStatus = getTemperatureStatus(batch);
                  const item = batch.item!;
                  const storageType = item.storageType || 'cold';
                  const minTemp = item.minTemperature ?? (storageType === 'frozen' ? -18 : 2);
                  const maxTemp = item.maxTemperature ?? (storageType === 'frozen' ? -15 : 8);

                  return (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {batch.batchNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          storageType === 'frozen'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {storageType === 'frozen' ? 'Frozen' : 'Cold'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {batch.temperature?.toFixed(1)}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {minTemp}°C - {maxTemp}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-2 ${tempStatus.color}`}>
                          {tempStatus.icon}
                          <span className="text-sm font-medium capitalize">{tempStatus.status}</span>
                        </div>
                      </td>
                      {userRole === 'ADMIN' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedBatch(batch);
                              setIsAdminModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Set Temp
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdminModalOpen && (
        <AdminTemperatureModal
          isOpen={isAdminModalOpen}
          onClose={handleAdminModalClose}
          batch={selectedBatch}
          batches={batches}
        />
      )}
    </div>
  );
};

export default TemperatureMonitoring;


