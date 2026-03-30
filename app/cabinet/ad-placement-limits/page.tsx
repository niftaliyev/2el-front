'use client';

import { useState, useEffect } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { accountService, AdPlacementLimit } from '@/services/account.service';

export default function AdPlacementLimitsPage() {
  const [limits, setLimits] = useState<AdPlacementLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <UserSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              {/* Page Heading */}
              <div className="mb-8 border-b border-gray-100 pb-8">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-2 uppercase">
                  Yerləşdirmə limitləri
                </h1>
                <p className="text-gray-500 text-base font-medium">
                  Hər bir bölmə üçün pulsuz elan yerləşdirmə limitləri və ödənişli xidmət qiymətləri.
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-10 w-10 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                   {error}
                </div>
              ) : limits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {limits.map((limit) => (
                     <div key={limit.categoryId} className="p-5 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100/50 pb-3">
                           <h3 className="text-gray-900 font-black text-base uppercase tracking-tight truncate pr-4">{limit.categoryName}</h3>
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                             limit.usedCount >= limit.freeLimit ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                           }`}>
                             Limit: {limit.freeLimit}
                           </span>
                        </div>
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">İstifadə edilib</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-black ${limit.usedCount >= limit.freeLimit ? 'text-red-600' : 'text-gray-900'}`}>
                                  {limit.usedCount}
                                </span>
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                   <div className={`h-full ${limit.usedCount >= limit.freeLimit ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, (limit.usedCount / limit.freeLimit) * 100)}%` }} />
                                </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ödənişli yerləşdirmə</span>
                              <span className="text-sm font-black text-gray-900">{limit.paidPrice.toFixed(2)} AZN</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">Limit tapılmadı</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
