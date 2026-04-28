'use client';

import { useState, useEffect } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { accountService, Transaction } from '@/services/account.service';
import { PaginatedResponse } from '@/types/api';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCabinetService } from '@/lib/utils';

type Tab = 'PersonalAccount' | 'PaidPlacements';

export default function TransactionsPage() {
  const [data, setData] = useState<PaginatedResponse<Transaction[]> | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('PersonalAccount');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const filter = activeTab === 'PersonalAccount' ? 1 : 2;
        const result = await accountService.getTransactions(page, pageSize, filter);
        setData(result);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(t('cabinet.transactions.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page, activeTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when tab changes
  };

  const transactions = data?.data || [];


  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 sm:p-8 overflow-hidden">
              
              <div className="p-5 sm:p-0">
                <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-6">{t('cabinet.transactions.title')}</h1>

                {/* Sub Tabs */}
                <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100 mb-8 overflow-x-auto scrollbar-hide sm:w-fit">
                  <button
                    onClick={() => handleTabChange('PersonalAccount')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'PersonalAccount'
                        ? 'bg-[#607afb] text-white shadow-lg shadow-[#607afb]/20'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {t('cabinet.transactions.personalAccount')}
                  </button>
                  <button
                    onClick={() => handleTabChange('PaidPlacements')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'PaidPlacements'
                        ? 'bg-[#607afb] text-white shadow-lg shadow-[#607afb]/20'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {t('cabinet.transactions.paidPlacements')}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-10 w-10 text-[#607afb] border-4 border-[#607afb]/20 border-t-[#607afb] rounded-full" />
                </div>
              ) : error ? (
                <div className="m-5 bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl text-center font-bold text-sm">
                  {error}
                </div>
              ) : transactions.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-50/30 border-y border-gray-100">
                          <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.transactions.adLabel')}</th>
                          <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.transactions.adName')}</th>
                          <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.transactions.service')}</th>
                          <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.transactions.amount')}</th>
                          <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.transactions.source')}</th>
                          <th className="py-4 px-4 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.transactions.dateTime')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {transactions.map((tItem) => (
                          <tr key={tItem.id} className="hover:bg-gray-50/40 transition-all border-b border-gray-50 last:border-0">
                            <td className="py-5 px-6">
                              <span className="text-gray-400 font-medium text-sm">
                                {tItem.adId ? `#${tItem.adId.substring(0, 8)}` : '-'}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              {tItem.adId ? (
                                <Link
                                  href={`/elanlar/${tItem.adId}`}
                                  className="text-blue-600 hover:underline font-semibold text-sm line-clamp-1"
                                >
                                  {tItem.adTitle || 'Elan'}
                                </Link>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="py-5 px-6">
                              <span className={`text-sm font-medium ${tItem.type === 'Deposit' ? 'text-emerald-600' : 'text-gray-700'}`}>
                                {translateCabinetService(language === 'ru' && tItem.titleRu ? tItem.titleRu : tItem.title, language)}
                              </span>
                            </td>
                            <td className="py-5 px-6 whitespace-nowrap">
                              <div className={`text-sm font-bold flex items-center gap-1 ${['Deposit', 'Refund'].includes(tItem.type) ? 'text-emerald-600' : 'text-gray-900'}`}>
                                {['Deposit', 'Refund'].includes(tItem.type) ? (
                                  <span className="material-symbols-outlined !text-[16px] transform rotate-180">arrow_downward</span>
                                ) : (
                                  <span className="material-symbols-outlined !text-[16px]">arrow_upward</span>
                                )}
                                {['Deposit', 'Refund'].includes(tItem.type) ? '+' : '-'}{tItem.amount.toFixed(2)} ₼
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span className="text-gray-700 text-sm font-medium">{t('cabinet.transactions.sourcePersonal')}</span>
                            </td>
                            <td className="py-5 px-4 whitespace-nowrap">
                              <div className="text-xs text-gray-500 font-medium">
                                {new Date(tItem.date).toLocaleDateString(language === 'az' ? 'az-AZ' : 'ru-RU')} {new Date(tItem.date).toLocaleTimeString(language === 'az' ? 'az-AZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 px-5 pb-5">
                    {transactions.map((tItem) => (
                      <div key={tItem.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">{t('cabinet.transactions.service')}</span>
                            <span className={`text-xs font-bold ${tItem.type === 'Deposit' ? 'text-emerald-600' : 'text-gray-900'}`}>{translateCabinetService(language === 'ru' && tItem.titleRu ? tItem.titleRu : tItem.title, language)}</span>
                          </div>
                          <div className={`text-sm font-black flex items-center gap-1 ${['Deposit', 'Refund'].includes(tItem.type) ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {['Deposit', 'Refund'].includes(tItem.type) ? '+' : '-'}{tItem.amount.toFixed(2)} ₼
                          </div>
                        </div>

                        {tItem.adTitle && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">{t('cabinet.transactions.adLabel')}</span>
                            <Link href={`/elanlar/${tItem.adId}`} className="text-blue-600 text-xs font-semibold line-clamp-1">{tItem.adTitle}</Link>
                          </div>
                        )}

                        <div className="flex justify-between items-end pt-3 border-t border-gray-100/50">
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{t('cabinet.transactions.date')}</span>
                            <span className="text-[10px] text-gray-500 font-medium">
                                {new Date(tItem.date).toLocaleDateString(language === 'az' ? 'az-AZ' : 'ru-RU')} {new Date(tItem.date).toLocaleTimeString(language === 'az' ? 'az-AZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">#{tItem.adId?.substring(0, 8) || '00000'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {data && data.totalPages > 1 && (
                    <div className="p-6 border-t border-gray-100 flex items-center justify-center gap-2">
                       <button
                         onClick={() => setPage(p => Math.max(1, p - 1))}
                         disabled={page === 1}
                         className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                       >
                         <span className="material-symbols-outlined">chevron_left</span>
                       </button>
                       {[...Array(data.totalPages)].map((_, i) => (
                         <button
                           key={i}
                           onClick={() => setPage(i + 1)}
                           className={`w-10 h-10 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                             page === i + 1 
                               ? 'bg-[#607afb] text-white shadow-md' 
                               : 'text-gray-500 hover:bg-gray-100'
                           }`}
                         >
                           {i + 1}
                         </button>
                       ))}
                       <button
                         onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                         disabled={page === data.totalPages}
                         className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                       >
                         <span className="material-symbols-outlined">chevron_right</span>
                       </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-gray-300 text-4xl">history</span>
                  </div>
                  <h3 className="text-gray-900 text-lg font-bold">{t('cabinet.transactions.noTransactions')}</h3>
                  <p className="text-gray-500 text-sm mt-1">{t('cabinet.transactions.noTransactionsDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
