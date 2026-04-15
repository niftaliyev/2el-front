'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { storeService } from '@/services/store.service';
import { adService } from '@/services/ad.service';
import { StoreListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';

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
      adService.getCategoryTree(),
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
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mağazalar</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Keyfiyyətli məhsullar və etibarlı satıcılar</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            {/* Search Bar */}
            <div className="relative group w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors !text-[20px]">search</span>
              <input
                type="text"
                placeholder="Axtarış..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-100 bg-white text-sm font-medium focus:border-primary transition-all outline-none"
              />
            </div>

            {/* View Mode Toggles */}
            <div className="flex bg-gray-50 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center size-9 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="material-symbols-outlined !text-[20px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center size-9 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="material-symbols-outlined !text-[20px]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-wrap items-center gap-3">
             {/* Custom City Dropdown */}
             <div className="relative min-w-[180px]" onClick={(e) => e.stopPropagation()}>
               <button 
                 onClick={() => { setIsCityDropdownOpen(!isCityDropdownOpen); setIsSortDropdownOpen(false); }}
                 className="w-full h-10 px-4 rounded-xl bg-gray-50 text-xs font-black text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors"
               >
                 <span>{selectedCityId ? cities.find(c => c.id === selectedCityId)?.name : 'Bütün şəhərlər'}</span>
                 <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
               </button>
                 {isCityDropdownOpen && (
                 <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-300 no-scrollbar">
                   <div 
                     className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${!selectedCityId ? 'text-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50 hover:pl-6'}`}
                     onClick={() => { setSelectedCityId(null); setCurrentPage(1); setIsCityDropdownOpen(false); }}
                   >
                     Bütün şəhərlər
                   </div>
                   {cities.map(city => (
                     <div 
                       key={city.id}
                       className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${selectedCityId === city.id ? 'text-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50 hover:pl-6'}`}
                       onClick={() => { setSelectedCityId(city.id); setCurrentPage(1); setIsCityDropdownOpen(false); }}
                     >
                       {city.name}
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* Custom Sort Dropdown */}
             <div className="relative min-w-[160px]" onClick={(e) => e.stopPropagation()}>
               <button 
                 onClick={() => { setIsSortDropdownOpen(!isSortDropdownOpen); setIsCityDropdownOpen(false); }}
                 className="w-full h-10 px-4 rounded-xl bg-gray-50 text-xs font-black text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors"
               >
                 <span>
                    {sortOrder === 'default' && 'Sıralama'}
                    {sortOrder === 'popularity' && 'Populyarlıq'}
                    {sortOrder === 'ads' && 'Elan sayı'}
                    {sortOrder === 'az' && 'Ad (A-Z)'}
                    {sortOrder === 'za' && 'Ad (Z-A)'}
                 </span>
                 <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180 text-primary' : ''}`}>swap_vert</span>
               </button>

               {isSortDropdownOpen && (
                 <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[180px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                   {[
                     { id: 'default', label: 'Sıralama' },
                     { id: 'popularity', label: 'Populyarlıq' },
                     { id: 'ads', label: 'Elan sayı' },
                     { id: 'az', label: 'Ad (A-Z)' },
                     { id: 'za', label: 'Ad (Z-A)' }
                   ].map(opt => (
                     <div 
                       key={opt.id}
                       className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${sortOrder === opt.id ? 'text-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50 hover:pl-6'}`}
                       onClick={() => { handleSortChange(opt.id); setIsSortDropdownOpen(false); }}
                     >
                       {opt.label}
                     </div>
                   ))}
                 </div>
               )}
             </div>

             <div className="h-6 w-px bg-gray-100 mx-1 hidden sm:block" />

             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
               <button
                 onClick={() => handleCategoryChange(null)}
                 className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                   selectedCategory === null
                     ? 'bg-primary text-white shadow-sm'
                     : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                 }`}
               >
                 Bütün
               </button>
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => handleCategoryChange(cat.name)}
                   className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                     selectedCategory === cat.name
                       ? 'bg-primary text-white shadow-sm'
                       : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                   }`}
                 >
                   {cat.name}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Stores Grid - Now more compact and smaller */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {currentStores.map((store) => (
            <Link key={store.id} href={`/shops/${store.slug || store.id}`} className="h-full">
              <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer transition-all duration-300 border border-gray-50 hover:border-primary/20 hover:shadow-lg">
                {/* Cover Image - Combined with Logo overlap */}
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
                  {/* Small Badges Overlay */}
                  <div className="absolute top-2 right-2 z-10">
                    {store.cityName && (
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border border-gray-100">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight">{store.cityName}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Compact Info Section */}
                <div className="px-4 pb-4 flex flex-col items-center text-center -mt-10 relative z-20">
                  {/* Smaller Logo Container */}
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

                  {/* Text Content */}
                  <div className="mt-3 space-y-0.5 w-full">
                    <h3 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1 flex items-center justify-center gap-1">
                      {store.storeName}
                      <span className="material-symbols-outlined text-blue-500 !text-[14px]">verified</span>
                    </h3>
                    <p className="text-[10px] font-bold text-[#8D94AD] uppercase tracking-widest truncate h-3">
                      {store.headline || store.categories?.[0] || 'Mağaza'}
                    </p>
                  </div>

                  {/* Compact Stats Row */}
                  <div className="mt-4 w-full pt-3 border-t border-gray-50 flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center">
                       <span className="text-xs font-black text-gray-900">{store.adCount || 0}</span>
                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Elan</span>
                    </div>
                    <div className="w-px h-5 bg-gray-50" />
                    <div className="flex flex-col items-center">
                       <span className="text-xs font-black text-gray-900">{store.viewCount || 0}</span>
                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Baxış</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination - Professional & Minimal */}
        {filteredStores.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex items-center justify-center size-9 rounded-xl text-xs font-black transition-all ${
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
              className="flex items-center justify-center size-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredStores.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-100">
            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-300 !text-3xl">storefront</span>
            </div>
            <h3 className="text-base font-black text-gray-900">Mağaza tapılmadı</h3>
            <p className="text-sm text-gray-500 mt-1">Axtarış kriteriyalarınızı dəyişdirin.</p>
          </div>
        )}
      </div>
    </main>
  );
}
