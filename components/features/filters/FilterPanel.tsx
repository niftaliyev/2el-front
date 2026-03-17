'use client';

import { useState } from 'react';
import { SingleValue } from 'react-select';
import { Button, Input, Select } from '@/components/ui';
import { SelectOption } from '@/components/ui/Select';
import { SearchFilters } from '@/types';
import { PRODUCT_CONDITIONS, SORT_OPTIONS } from '@/constants';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const emptyFilters: SearchFilters = { sortBy: 'latest' };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-8 sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          Filtrlər
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors uppercase tracking-wide"
        >
          Sıfırla
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Qiymət Aralığı (AZN)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                className="pl-3"
              />
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="Maks"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                className="pl-3"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Məhsulun vəziyyəti
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="condition"
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                checked={!localFilters.condition}
                onChange={() => handleFilterChange('condition', undefined)}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Bütün vəziyyətlər</span>
            </label>
            {PRODUCT_CONDITIONS.map(c => (
              <label key={c.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="condition"
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                  checked={localFilters.condition === c.value}
                  onChange={() => handleFilterChange('condition', c.value)}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{c.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort - Mobile only typically, but here we can keep it or move to main page. 
            Commonly sidebar filters might exclude sort if main page has it. 
            Keeping it for completeness but usually sort is top right of grid. 
            I'll keep it as "Secondary Sort" or verify if it duplicates.
            The plan mentioned moving sort to header. I will remove it from here if I put it in header.
            I will keep it here for now as a fallback but styled better.
        */}
        <div className="h-px bg-gray-100"></div>

        {/* Action Buttons */}
        <Button onClick={applyFilters} className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all">
          Axtar
        </Button>
      </div>
    </div>
  );
}
