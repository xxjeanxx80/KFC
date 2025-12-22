import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string>) => void;
  filterOptions: FilterOption[];
  initialFilters?: Record<string, string>;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  isOpen, 
  onClose, 
  onApply, 
  filterOptions, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  const handleChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter Options</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {filterOptions.map(option => (
            <div key={option.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {option.label}
              </label>
              <select
                value={filters[option.key] || ''}
                onChange={(e) => handleChange(option.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                {option.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-between space-x-3 pt-6">
          <Button variant="secondary" onClick={handleClear}>
            Clear All
          </Button>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;