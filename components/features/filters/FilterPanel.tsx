'use client';

import { useState, useEffect } from 'react';
import { SingleValue } from 'react-select';
import { Button, Input, Select } from '@/components/ui';
import { SelectOption } from '@/components/ui/Select';
import { SearchFilters } from '@/types';
import { PRODUCT_CONDITIONS, SORT_OPTIONS } from '@/constants';
import { parseCurrency } from '@/lib/utils';
import { adService } from '@/services/ad.service';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories?: { id: string, name: string }[];
}

const EXCLUDED_DELIVERY_CATEGORIES = [
  'Daşınmaz əmlak',
  'Nəqliyyat',
  'Xidmətlər və biznes',
  'İş elanları'
];

export default function FilterPanel({ filters, onFilterChange, categories = [] }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [cities, setCities] = useState<SelectOption[]>([]);

  // Accordion states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isCityOpen, setIsCityOpen] = useState(!!filters.cityId);
  const [isConditionOpen, setIsConditionOpen] = useState(!!filters.condition);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [openDynamicFields, setOpenDynamicFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const fetchedCities = await adService.getCities();
        const cityOptions = fetchedCities.map((c: any) => ({
          value: c.id.toString(),
          label: c.name
        }));
        setCities([{ value: '', label: 'Bütün şəhərlər' }, ...cityOptions]);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };
    fetchCities();
  }, []);

  const handleFilterChange = (key: keyof SearchFilters | 'cityId', value: any) => {
    let finalValue = value;
    if ((key === 'minPrice' || key === 'maxPrice') && typeof value === 'string') {
      finalValue = parseCurrency(value) || undefined;
    }
    const newFilters = { ...localFilters, [key]: finalValue };
    setLocalFilters(newFilters);
  };

  const handleDynamicPropertyChange = (fieldId: string, value: string | undefined) => {
    const newDynamicProps = { ...localFilters.dynamicProperties };
    if (value) {
      newDynamicProps[fieldId] = value;
    } else {
      delete newDynamicProps[fieldId];
    }
    setLocalFilters({ ...localFilters, dynamicProperties: newDynamicProps });
  };

  // Replace applyFilters with automatic effect
  useEffect(() => {
    // Stringify compare to prevent infinite loop (simple deep compare)
    if (JSON.stringify(localFilters) === JSON.stringify(filters)) return;

    // For price inputs/text, we debounce to avoid API spam
    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters, filters, onFilterChange]);

  // Sync from props if filters change externally (URL)
  useEffect(() => {
    if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
      setLocalFilters(filters);
    }
  }, [filters]);

  const resetFilters = () => {
    const emptyFilters: SearchFilters = { sortBy: 'latest' };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Helper to find category in tree
  const findCategoryInTree = (cats: any[], id: string): any => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children?.length) {
        const found = findCategoryInTree(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedCategory = findCategoryInTree(categories, localFilters.subCategoryId || localFilters.categoryId || '');
  const selectedCategoryName = selectedCategory?.name || '';

  // Find fields from the selected category or its parents
  const getCategoryFieldsWithParents = (cat: any): any[] => {
    if (!cat) return [];
    if (cat.categoryFields?.length) return cat.categoryFields;
    // If this level has no fields, check parent in the tree (requires categories tree to be comprehensive)
    // For now, if current cat has no fields, we try to find its parent in the tree
    if (cat.parentId) {
      const parent = findCategoryInTree(categories, cat.parentId);
      return getCategoryFieldsWithParents(parent);
    }
    return [];
  };

  const categoryFields = getCategoryFieldsWithParents(selectedCategory);

  const showDeliveryFilter = !(localFilters.subCategoryId || localFilters.categoryId) || (selectedCategoryName && !EXCLUDED_DELIVERY_CATEGORIES.includes(selectedCategoryName));
  const showConditionFilter = !(localFilters.subCategoryId || localFilters.categoryId) || (selectedCategoryName && !EXCLUDED_DELIVERY_CATEGORIES.includes(selectedCategoryName));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3 mt-4 border-t border-gray-100 pt-6">
        <span className="text-[13px] text-gray-400">
          Filtrlər
        </span>
        <button
          onClick={resetFilters}
          className="text-[13px] text-gray-400 hover:text-primary transition-colors"
        >
          Sıfırla
        </button>
      </div>

      <div className="space-y-5 mt-2">
        {/* Price Range */}
        <div>
          <div
            className="flex items-center justify-between mb-3 cursor-pointer select-none"
            onClick={() => setIsPriceOpen(!isPriceOpen)}
          >
            <span className="text-[15px] text-[#212121]">Qiymət, AZN</span>
            <span className={`material-symbols-outlined !text-lg text-gray-400 transition-transform ${isPriceOpen ? '' : 'rotate-180'}`}>expand_less</span>
          </div>
          {isPriceOpen && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="min."
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full h-10 px-3 bg-[#f1f2f4] rounded-[10px] outline-none placeholder:text-gray-400 text-sm focus:ring-1 focus:ring-gray-300"
              />
              <input
                type="text"
                placeholder="maks."
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full h-10 px-3 bg-[#f1f2f4] rounded-[10px] outline-none placeholder:text-gray-400 text-sm focus:ring-1 focus:ring-gray-300"
              />
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100 my-4" />

        {/* City Filter */}
        <div>
          <div
            className="flex items-center justify-between mb-3 cursor-pointer select-none"
            onClick={() => setIsCityOpen(!isCityOpen)}
          >
            <span className="text-[15px] text-[#212121]">Şəhər</span>
            <span className={`material-symbols-outlined !text-lg text-gray-400 transition-transform ${isCityOpen ? '' : 'rotate-180'}`}>expand_less</span>
          </div>
          {isCityOpen && (
            <div className="pt-1">
              <Select
                value={cities.find(c => c.value === (localFilters as any).cityId) || cities[0]}
                onChange={(option) => handleFilterChange('cityId', option?.value === '' ? undefined : option?.value)}
                options={cities.length > 0 ? cities : [{ value: '', label: 'Bütün şəhərlər' }]}
                placeholder="Şəhər seçin"
                className="text-sm bg-[#f1f2f4] border-transparent focus:bg-white w-full rounded-[10px]"
              />
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100 my-4" />

        {/* Condition */}
        {showConditionFilter && (
          <div>
            <div
              className="flex items-center justify-between mb-3 cursor-pointer select-none"
              onClick={() => setIsConditionOpen(!isConditionOpen)}
            >
              <span className="text-[15px] text-[#212121]">Məhsulun vəziyyəti</span>
              <span className={`material-symbols-outlined !text-lg text-gray-400 transition-transform ${isConditionOpen ? '' : 'rotate-180'}`}>expand_less</span>
            </div>
            {isConditionOpen && (
              <div className="space-y-[10px] pt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="condition"
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5"
                    checked={!localFilters.condition}
                    onChange={() => handleFilterChange('condition', undefined)}
                  />
                  <span className="text-[14px] text-[#212121] transition-colors leading-none">Bütün vəziyyətlər</span>
                </label>
                {PRODUCT_CONDITIONS.map(c => (
                  <label key={c.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="condition"
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5"
                      checked={localFilters.condition === c.value}
                      onChange={() => handleFilterChange('condition', c.value)}
                    />
                    <span className="text-[14px] text-[#212121] transition-colors leading-none">{c.label}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="h-px bg-gray-100 my-4" />
          </div>
        )}

        {/* Dynamic Fields */}
        {categoryFields.map((field: any) => {
          const isOpen = openDynamicFields[field.id] ?? true;
          const options = field.optionsJson ? JSON.parse(field.optionsJson) : [];

          return (
            <div key={field.id}>
              <div className="h-px bg-gray-100 my-4" />
              <div
                className="flex items-center justify-between mb-3 cursor-pointer select-none"
                onClick={() => setOpenDynamicFields(prev => ({ ...prev, [field.id]: !isOpen }))}
              >
                <span className="text-[15px] text-[#212121]">{field.name}</span>
                <span className={`material-symbols-outlined !text-lg text-gray-400 transition-transform ${isOpen ? '' : 'rotate-180'}`}>expand_less</span>
              </div>
              {isOpen && (
                <div className="space-y-[10px] pt-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name={`field_${field.id}`}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5"
                      checked={!localFilters.dynamicProperties?.[field.id]}
                      onChange={() => handleDynamicPropertyChange(field.id, undefined)}
                    />
                    <span className="text-[14px] text-[#212121] transition-colors leading-none">Bütün</span>
                  </label>
                  {options.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={`field_${field.id}`}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5"
                        checked={localFilters.dynamicProperties?.[field.id] === opt}
                        onChange={() => handleDynamicPropertyChange(field.id, opt)}
                      />
                      <span className="text-[14px] text-[#212121] transition-colors leading-none">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Dynamic Delivery Filter */}
        {showDeliveryFilter && (
          <>
            <div className="h-px bg-gray-100 my-4" />
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
              >
                <span className="text-[15px] text-[#212121]">Çatdırılma</span>
                <span className={`material-symbols-outlined !text-lg text-gray-400 transition-transform ${isDeliveryOpen ? '' : 'rotate-180'}`}>expand_less</span>
              </div>
              {isDeliveryOpen && (
                <div className="flex flex-col gap-[10px] pt-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="delivery"
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5"
                      checked={localFilters.isDeliverable === undefined}
                      onChange={() => handleFilterChange('isDeliverable', undefined)}
                    />
                    <span className="text-[14px] text-[#212121] leading-none">Vacib deyil</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="delivery"
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5"
                      checked={localFilters.isDeliverable === true}
                      onChange={() => handleFilterChange('isDeliverable', true)}
                    />
                    <span className="text-[14px] text-[#212121] leading-none">Bəli</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="delivery"
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer mt-0.5"
                      checked={localFilters.isDeliverable === false}
                      onChange={() => handleFilterChange('isDeliverable', false)}
                    />
                    <span className="text-[14px] text-[#212121] leading-none">Xeyr</span>
                  </label>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons removed for Auto-Apply */}
      </div>
    </div>
  );
}
