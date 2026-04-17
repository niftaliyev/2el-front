'use client';

import { useState, useEffect } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { accountService, AdPlacementLimit } from '@/services/account.service';

export default function AdPlacementLimitsPage() {
  const [limits, setLimits] = useState<AdPlacementLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('mine');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const data = await accountService.getPlacementLimits();
        setLimits(data);
      } catch (err) {
        console.error('Error fetching limits:', err);
        setError('Limitləri yükləmək mümkün olmadı');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimits();
  }, []);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const myLimits = limits.filter(l => l.usedCount > 0);

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading */}
              <div className="mb-6">
                <h1 className="text-gray-900 text-2xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">
                  Yerləşdirmə limitləri
                </h1>
                <p className="text-gray-500 text-[11px] sm:text-sm font-medium">
                  Hər bir bölmə üzrə pulsuz elan yerləşdirmə və ödənişli xidmət şərtləri
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl mb-8 w-fit">
                <button
                  onClick={() => setActiveTab('mine')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'mine'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Mənim limitlərim
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'all'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Bütün limitlər
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-10 w-10 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center font-bold text-sm">
                  <span className="material-symbols-outlined block text-3xl mb-2">error</span>
                  {error}
                </div>
              ) : activeTab === 'all' ? (
                <div className="space-y-6">
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-gray-400 !text-xl">search</span>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-[15px]"
                      placeholder="Kateqoriya axtar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {(() => {
                    const filteredLimits = limits.filter(l => l.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
                    return filteredLimits.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {filteredLimits.map((limit) => {
                          const isExpired = limit.usedFreeCount >= limit.freeLimit;
                          const percentage = Math.min(100, (limit.usedFreeCount / limit.freeLimit) * 100);

                          return (
                            <div
                              key={limit.categoryId}
                              className="relative p-3 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-300 group flex flex-col"
                            >
                              {/* Card Header */}
                              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-gray-900 font-bold text-[12px] sm:text-base group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                    {limit.categoryName}
                                  </h3>
                                  <p className="text-gray-400 text-[9px] sm:text-[11px] font-medium uppercase tracking-wider mt-0.5 truncate">KONTİNGENT</p>
                                </div>
                                <div className={`size-6 sm:size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isExpired ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                  <span className="material-symbols-outlined !text-[15px] sm:!text-xl">{isExpired ? 'block' : 'task_alt'}</span>
                                </div>
                              </div>

                              {/* Progress Info */}
                              <div className="mt-auto pt-2">
                                <div className="flex items-end justify-between mb-2 gap-1 flex-wrap">
                                  <div className="flex flex-col">
                                    <span className="text-gray-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5">İstifadə (Pulsuz)</span>
                                    <div className="flex items-baseline gap-1">
                                      <span className={`text-[15px] sm:text-xl font-black tabular-nums transition-colors ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                        {limit.usedFreeCount}
                                      </span>
                                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold">/ {limit.freeLimit}</span>
                                    </div>
                                  </div>
                                  <span className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md border ${isExpired ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'
                                    }`}>
                                    {Math.round(percentage)}%
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3 sm:mb-5">
                                  <div
                                    className={`h-full transition-all duration-1000 ease-out relative ${isExpired ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-primary to-primary-dark'
                                      }`}
                                    style={{ width: `${percentage}%` }}
                                  >
                                    {!isExpired && percentage > 0 && (
                                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    )}
                                  </div>
                                </div>

                                {/* Price Info Row */}
                                <div className="flex flex-col xl:flex-row items-baseline xl:items-center justify-between p-2 sm:p-3 bg-gray-50/80 rounded-xl border border-gray-100/50 gap-1">
                                  <span className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Limit aşarsa</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs sm:text-sm font-black text-gray-900 tabular-nums">{limit.paidPrice.toFixed(2)}</span>
                                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">AZN</span>
                                  </div>
                                </div>
                              </div>

                              {/* Accent Color Strip */}
                              <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl opacity-40 transition-opacity group-hover:opacity-100 ${isExpired ? 'bg-red-500' : 'bg-primary'}`} />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
                        <span className="material-symbols-outlined text-gray-300 !text-5xl mb-3">search_off</span>
                        <p className="text-gray-500 font-medium">Axtarışa uyğun kateqoriya tapılmadı</p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Mine Tab (Tap.az Style) */
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-gray-900 font-bold text-lg mb-4">
                      Kateqoriyalarınız üzrə qalan yerləşdirmələrin sayı
                    </h2>

                    {myLimits.length > 0 ? (
                      <div className="space-y-3">
                        {myLimits.map((limit) => {
                          const isExpanded = expandedItems.has(limit.categoryId);
                          const remainingFree = Math.max(0, limit.freeLimit - limit.usedFreeCount);
                          const hasLimit = remainingFree > 0 || limit.paidCount > 0;

                          return (
                            <div
                              key={limit.categoryId}
                              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div
                                onClick={() => toggleExpand(limit.categoryId)}
                                className="p-4 sm:p-6 flex items-center cursor-pointer select-none"
                              >
                                <div className="size-14 sm:size-16 rounded-xl overflow-hidden p-1.5 bg-gray-50 border border-gray-100 flex items-center justify-center mr-4 sm:mr-5 flex-shrink-0">
                                  {limit.categoryImageUrl ? (
                                    <img src={limit.categoryImageUrl} alt="" className="w-full h-full object-contain scale-[1.3] transform-gpu" />
                                  ) : (
                                    <span className="material-symbols-outlined text-gray-400 !text-3xl">category</span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="text-gray-400 text-xs sm:text-sm font-medium mb-0.5">
                                    {limit.parentCategoryName}
                                  </div>
                                  <div className="text-gray-900 font-bold text-sm sm:text-base truncate">
                                    {limit.categoryName}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className={`min-w-[40px] h-8 px-3 rounded-xl flex items-center justify-center font-bold text-sm ${hasLimit
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-red-50 text-red-500'
                                    }`}>
                                    {remainingFree + limit.paidCount}
                                    {(!hasLimit && limit.nextFreeAt) && (
                                      <span className="text-[10px] text-gray-400 ml-1 font-normal">/{formatDate(limit.nextFreeAt)}</span>
                                    )}
                                  </div>

                                  <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    expand_more
                                  </span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-gray-50 bg-gray-50/30">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`size-2 rounded-full ${remainingFree > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                      <span className="text-sm font-medium text-gray-600">
                                        Ödənişsiz elan — <span className={remainingFree > 0 ? 'text-emerald-600' : 'text-red-500'}>{remainingFree} elan</span>
                                        {limit.nextFreeAt && <span className="text-gray-400 ml-1">{formatDate(limit.nextFreeAt)}-dək</span>}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`size-2 rounded-full ${limit.paidCount > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                      <span className="text-sm font-medium text-gray-600">
                                        Ödənişli elan — <span className={limit.paidCount > 0 ? 'text-blue-600' : 'text-gray-500'}>{limit.paidCount} elan</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-4 text-center">
                                    <a
                                      href="/pages/limits_by_category"
                                      className="text-primary text-xs font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                      Kateqoriya üzrə limitlər ilə ətraflı tanış olun
                                      <span className="material-symbols-outlined !text-sm">open_in_new</span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
                        <span className="material-symbols-outlined text-gray-200 !text-6xl mb-4">info</span>
                        <p className="text-gray-400 font-medium font-sans">Hələ ki, heç bir kateqoriya üzrə elanınız yoxdur</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
