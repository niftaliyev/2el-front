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
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading */}
              <div className="mb-8 border-b border-gray-50 pb-6">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">
                  Yerləşdirmə limitləri
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Hər bir bölmə üçün pulsuz elan yerləşdirmə limitləri
                </p>
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
              ) : limits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                   {limits.map((limit) => (
                     <div 
                        key={limit.categoryId} 
                        className="p-5 border border-gray-100 rounded-2xl bg-gray-50/20 hover:bg-white hover:border-primary/30 transition-all duration-300 group"
                     >
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100/50 pb-3">
                           <h3 className="text-gray-900 font-bold text-sm lg:text-base group-hover:text-primary transition-colors">
                              {limit.categoryName}
                           </h3>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${
                             limit.usedCount >= limit.freeLimit 
                             ? 'bg-red-50 border-red-100 text-red-600' 
                             : 'bg-green-50 border-green-100 text-green-600'
                           }`}>
                             Limit: {limit.freeLimit}
                           </span>
                        </div>
                        
                        <div className="space-y-4">
                           <div>
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">İstifadə edilib</span>
                                 <span className={`text-sm font-bold ${limit.usedCount >= limit.freeLimit ? 'text-red-600' : 'text-gray-900'}`}>
                                   {limit.usedCount} <span className="text-[10px] text-gray-400">/ {limit.freeLimit}</span>
                                 </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full transition-all duration-1000 ${
                                       limit.usedCount >= limit.freeLimit ? 'bg-red-500' : 'bg-primary'
                                    }`} 
                                    style={{ width: `${Math.min(100, (limit.usedCount / limit.freeLimit) * 100)}%` }} 
                                 />
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider pr-2">Ödənişli qiymət</span>
                              <span className="text-sm font-bold text-gray-900 tabular-nums">{limit.paidPrice.toFixed(2)} AZN</span>
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
