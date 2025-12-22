import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { User, Role, Store } from '../types';
import { Button } from './ui';
import { createEntity, updateEntity, fetchEntities } from '../utils/common';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    roleId: '',
    storeId: ''
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchStores();
      if (user) {
        setFormData({
          username: user.username,
          password: '', // Don't populate password for security
          fullName: user.fullName,
          roleId: typeof user.role === 'string' ? user.role : user.role?.id?.toString() || '',
          storeId: user.storeId?.toString() || ''
        });
      } else {
        setFormData({
          username: '',
          password: '',
          fullName: '',
          roleId: '',
          storeId: ''
        });
      }
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      const data = await fetchEntities<Role[]>('/roles');
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await fetchEntities<Store[]>('/stores');
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const payload = {
        ...formData,
        roleId: formData.roleId ? parseInt(formData.roleId) : undefined,
        storeId: formData.storeId ? parseInt(formData.storeId) : undefined
      };

      if (user) {
        await updateEntity('/users', user.id, payload, 'User updated successfully');
      } else {
        await createEntity('/users', payload, 'User created successfully');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 sm:p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{user ? 'Edit User' : 'Add User'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                required={!user}
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                Role
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                Store
              </label>
              <select
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="">Select Store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
