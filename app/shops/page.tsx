'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { storeService } from '@/services/store.service';
import { adService } from '@/services/ad.service';
import { StoreListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const getCategoryColor = (colorCode: number) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-gray-100 text-gray-800',
    'bg-red-100 text-red-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-cyan-100 text-cyan-800',
    'bg-lime-100 text-lime-800',
  ];
  return colors[colorCode % colors.length];
};

const ITEMS_PER_PAGE = 8;

export default function StoresPage() {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      storeService.getStores(),
      adService.getCategories(),
      adService.getCities()
    ]).then(([storeData, categoryData, cityData]) => {
      // De-duplicate stores by ID just in case backend returns duplicates
      const uniqueStores = Array.from(new Map(storeData.map(s => [s.id, s])).values());
      setStores(uniqueStores);
      setCategories(categoryData);
      setCities(cityData);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });

    const handleClickOutside = () => {
      setIsCityDropdownOpen(false);
      setIsSortDropdownOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredStores = stores.filter((store) => {
    const matchesSearch = (store.storeName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || (store.categories && store.categories.includes(selectedCategory));
    const matchesCity = !selectedCityId || store.cityId === selectedCityId;
    return matchesSearch && matchesCategory && matchesCity;
  }).sort((a, b) => {
    if (sortOrder === 'popularity') return (b.viewCount || 0) - (a.viewCount || 0);
    if (sortOrder === 'ads') return (b.adCount || 0) - (a.adCount || 0);
    if (sortOrder === 'az') return (a.storeName || '').localeCompare(b.storeName || '');
    if (sortOrder === 'za') return (b.storeName || '').localeCompare(a.storeName || '');
    return 0;
  });

  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  // Reset to page 1 when search, category or sort changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (catName: string | null) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  return (
    <main className="container mx-auto px-4 sm:px-10 py-5 sm:py-10">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('shops.title')}</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">{t('shops.subtitle')}</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            {/* Search Bar */}
            <div className="relative group w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors !text-[20px]">search</span>
              <input
                type="text"
                placeholder={t('shops.search')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-100 bg-white text-sm font-medium focus:border-primary transition-all outline-none"
              />
            </div>

            {/* View Mode Toggles */}
            <div className="flex bg-gray-50 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center size-9 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="material-symbols-outlined !text-[20px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center size-9 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="material-symbols-outlined !text-[20px]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-4 py-2 overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Dropdowns Row */}
            <div className="grid grid-cols-2 sm:flex items-center gap-3">
               {/* Custom City Dropdown */}
               <div className="relative" onClick={(e) => e.stopPropagation()}>
                 <button 
                   onClick={() => { setIsCityDropdownOpen(!isCityDropdownOpen); setIsSortDropdownOpen(false); }}
                   className="w-full h-11 px-4 rounded-xl bg-gray-50 text-sm font-bold text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors min-w-0 cursor-pointer"
                   disabled={isLoading}
                 >
                   <span className="truncate">{selectedCityId ? (language === 'ru' && cities.find(c => c.id === selectedCityId)?.nameRu ? cities.find(c => c.id === selectedCityId)?.nameRu : cities.find(c => c.id === selectedCityId)?.name) : t('shops.allCities')}</span>
                   <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                 </button>
                   {isCityDropdownOpen && (
                   <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-300 no-scrollbar">
                     <div 
                       className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all ${!selectedCityId ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'}`}
                       onClick={() => { setSelectedCityId(null); setCurrentPage(1); setIsCityDropdownOpen(false); }}
                     >
                       {t('shops.allCities')}
                     </div>
                     {cities.map(city => (
                       <div 
                         key={city.id}
                         className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all ${selectedCityId === city.id ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'}`}
                         onClick={() => { setSelectedCityId(city.id); setCurrentPage(1); setIsCityDropdownOpen(false); }}
                       >
                         {language === 'ru' && city.nameRu ? city.nameRu : city.name}
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {/* Custom Sort Dropdown */}
               <div className="relative" onClick={(e) => e.stopPropagation()}>
                 <button 
                   onClick={() => { setIsSortDropdownOpen(!isSortDropdownOpen); setIsCityDropdownOpen(false); }}
                   className="w-full h-11 px-4 rounded-xl bg-gray-50 text-sm font-bold text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors min-w-0 cursor-pointer"
                   disabled={isLoading}
                 >
                   <span className="truncate">
                      {sortOrder === 'default' && t('shops.sortDefault')}
                      {sortOrder === 'popularity' && t('shops.sortPopularity')}
                      {sortOrder === 'ads' && t('shops.sortAdCount')}
                      {sortOrder === 'az' && t('shops.sortAZ')}
                      {sortOrder === 'za' && t('shops.sortZA')}
                   </span>
                   <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180 text-primary' : ''}`}>swap_vert</span>
                 </button>

                 {isSortDropdownOpen && (
                   <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[180px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                     {[
                       { id: 'default', label: t('shops.sortDefault') },
                       { id: 'popularity', label: t('shops.sortPopularity') },
                       { id: 'ads', label: t('shops.sortAdCount') },
                       { id: 'az', label: t('shops.sortAZ') },
                       { id: 'za', label: t('shops.sortZA') }
                     ].map(opt => (
                       <div 
                         key={opt.id}
                         className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all ${sortOrder === opt.id ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'}`}
                         onClick={() => { handleSortChange(opt.id); setIsSortDropdownOpen(false); }}
                       >
                         {opt.label}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>

            <div className="h-6 w-px bg-gray-100 mx-1 hidden lg:block" />

            {/* Categories Scrollable Row */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-1 -mx-4 px-4 lg:mx-0 lg:px-0">
               {isLoading ? (
                 <>
                   {[1, 2, 3, 4, 5].map((i) => (
                     <div key={i} className="h-9 w-20 bg-gray-50 animate-pulse rounded-xl" />
                   ))}
                 </>
               ) : (
                 <>
                   <button
                     onClick={() => handleCategoryChange(null)}
                     className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                       selectedCategory === null
                         ? 'bg-primary text-white shadow-sm'
                         : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                     }`}
                   >
                     {t('shops.allCategories')}
                   </button>
                   {categories.map((cat) => (
                     <button
                       key={cat.id}
                       onClick={() => handleCategoryChange(cat.name)}
                       className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                         selectedCategory === cat.name
                           ? 'bg-primary text-white shadow-sm'
                           : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                       }`}
                     >
                       {language === 'ru' && cat.nameRu ? cat.nameRu : cat.name}
                     </button>
                   ))}
                 </>
               )}
            </div>
          </div>
        </div>

        {/* Stores Container */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4" 
          : "flex flex-col gap-4"
        }>
          {isLoading ? (
            /* Loading Skeleton */
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`bg-white rounded-2xl border border-gray-50 overflow-hidden ${viewMode === 'grid' ? 'h-[280px]' : 'h-24 sm:h-32'}`}>
                <div className="animate-pulse h-full flex flex-col">
                  {viewMode === 'grid' ? (
                    <>
                      <div className="h-28 bg-gray-50" />
                      <div className="p-4 flex flex-col items-center gap-3">
                        <div className="size-16 rounded-xl bg-gray-50 -mt-10 border-4 border-white" />
                        <div className="h-4 w-24 bg-gray-50 rounded" />
                        <div className="h-3 w-16 bg-gray-50 rounded" />
                        <div className="mt-4 w-full h-10 bg-gray-50 rounded" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center p-4 gap-4 size-full">
                       <div className="size-16 sm:size-20 bg-gray-50 rounded-xl" />
                       <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-gray-50 rounded" />
                          <div className="h-3 w-48 bg-gray-50 rounded" />
                          <div className="flex gap-2">
                             <div className="h-6 w-16 bg-gray-50 rounded" />
                             <div className="h-6 w-16 bg-gray-50 rounded" />
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            currentStores.map((store) => (
              <Link key={store.id} href={`/shops/${store.slug || store.id}`} className={viewMode === 'grid' ? "h-full" : ""}>
                {viewMode === 'grid' ? (
                  /* Grid View Card */
                  <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer transition-all duration-300 border border-gray-50 hover:border-primary/20 hover:shadow-lg">
                    <div className="h-28 relative bg-gray-50">
                      {store.storeCoverUrl ? (
                        <Image
                          src={getImageUrl(store.storeCoverUrl)}
                          alt={`${store.storeName} cover`}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="size-full bg-gradient-to-br from-gray-50 to-gray-100" />
                      )}
                      <div className="absolute top-2 right-2 z-10">
                        {store.cityName && (
                          <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border border-gray-100">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight">{language === 'ru' && store.cityNameRu ? store.cityNameRu : store.cityName}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/5" />
                    </div>

                    <div className="px-4 pb-4 flex flex-col items-center text-center -mt-10 relative z-20">
                      <div className="size-18 rounded-xl border-4 border-white bg-white shadow-md relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                        {store.storeLogoUrl ? (
                          <Image
                            src={getImageUrl(store.storeLogoUrl)}
                            alt={`${store.storeName} logo`}
                            fill
                            className="object-cover p-1"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-gray-200">store</span>
                        )}
                      </div>

                      <div className="mt-3 space-y-0.5 w-full">
                        <h3 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1 flex items-center justify-center gap-1">
                          {store.storeName}
                          <span className="material-symbols-outlined text-blue-500 !text-[14px]">verified</span>
                        </h3>
                        <p className="text-[11px] font-semibold text-[#8D94AD] truncate h-3 mt-1">
                          {(language === 'ru' ? store.headlineRu : store.headline) || (language === 'ru' ? store.categoriesRu?.[0] : store.categories?.[0]) || t('shops.shop')}
                        </p>
                      </div>

                      <div className="mt-4 w-full pt-3 border-t border-gray-50 flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                           <span className="text-xs font-black text-gray-900">{store.adCount || 0}</span>
                           <span className="text-[9px] font-bold text-gray-400">{t('shops.ads')}</span>
                        </div>
                        <div className="w-px h-5 bg-gray-50" />
                        <div className="flex flex-col items-center">
                           <span className="text-xs font-black text-gray-900">{store.viewCount || 0}</span>
                           <span className="text-[9px] font-bold text-gray-400">{t('shops.views')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View Card */
                  <div className="bg-white rounded-2xl overflow-hidden flex items-center p-3 sm:p-4 gap-4 sm:gap-6 group cursor-pointer transition-all duration-300 border border-gray-50 hover:border-primary/20 hover:shadow-lg">
                    {/* Logo Container */}
                    <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl border-2 border-gray-50 bg-white relative overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                      {store.storeLogoUrl ? (
                        <Image
                          src={getImageUrl(store.storeLogoUrl)}
                          alt={`${store.storeName} logo`}
                          fill
                          className="object-cover p-1.5 sm:p-2"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl sm:text-3xl text-gray-200">store</span>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="text-sm sm:text-lg font-black text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {store.storeName}
                          <span className="material-symbols-outlined text-blue-500 !text-[15px] sm:!text-[18px]">verified</span>
                        </h3>
                        {store.cityName && (
                           <div className="bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 self-start sm:self-auto">
                             <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-tighter">{language === 'ru' && store.cityNameRu ? store.cityNameRu : store.cityName}</span>
                           </div>
                        )}
                      </div>
                      
                      <p className="text-[11px] sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-4 line-clamp-1">{(language === 'ru' ? store.headlineRu : store.headline) || (language === 'ru' ? store.categoriesRu?.[0] : store.categories?.[0]) || t('shops.shop')}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500 font-bold bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                          <span className="material-symbols-outlined !text-[14px] sm:!text-[16px] text-primary">ads_click</span>
                          {store.adCount || 0} <span className="hidden sm:inline">{t('shops.ads')}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500 font-bold bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                          <span className="material-symbols-outlined !text-[14px] sm:!text-[16px] text-blue-500">visibility</span>
                          {store.viewCount || 0} <span className="hidden sm:inline">{t('shops.views')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="hidden sm:block ml-auto">
                      <div className="flex items-center justify-center size-10 sm:size-12 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <span className="material-symbols-outlined font-bold">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Pagination - Professional & Minimal */}
        {!isLoading && filteredStores.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex items-center justify-center size-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
            </button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredStores.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-100">
            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-300 !text-3xl">storefront</span>
            </div>
            <h3 className="text-base font-black text-gray-900">{t('shops.noStores')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('shops.noStoresDesc')}</p>
          </div>
        )}
      </div>
    </main>
  );
}
