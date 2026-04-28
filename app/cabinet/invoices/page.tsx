'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { accountService, Invoice } from '@/services/account.service';
import { PaginatedResponse } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCabinetService } from '@/lib/utils';

type InvoiceTab = 'All' | 'Paid' | 'Pending' | 'Cancelled';

export default function InvoicesPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<PaginatedResponse<Invoice[]> | null>(null);
  const [activeTab, setActiveTab] = useState<InvoiceTab>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const status = activeTab === 'All' ? undefined : activeTab;
        const result = await accountService.getInvoices(page, pageSize, status);
        setData(result);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(t('cabinet.noInvoices') || 'Ödəniş qəbzlərini yükləmək mümkün olmadı');
      } finally {
        setIsLoading(false);
      }
    };

    document.title = `${t('cabinet.nav.invoices')} | ElanAz Cabinet`;

    fetchInvoices();
  }, [page, activeTab, t]);

  const invoices = data?.data || [];

  return (
    <>
      <main className="bg-gray-50 min-h-screen font-sans">
        <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <UserSidebar />

            <div className="flex-1 overflow-hidden">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
                <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-6">{t('cabinet.nav.invoices')}</h1>

                {/* Status Tabs */}
                <div className="grid grid-cols-4 sm:flex items-center sm:gap-10 border-b border-gray-100 mb-8 overflow-hidden">
                  {(['All', 'Paid', 'Pending', 'Cancelled'] as InvoiceTab[]).map((tab) => {
                    const labelMap = {
                      All: t('common.all'),
                      Paid: t('cabinet.paid'),
                      Pending: t('cabinet.unpaid'),
                      Cancelled: t('cabinet.cancelled')
                    };
                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setPage(1);
                        }}
                        className={`pb-3 text-[10px] sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap sm:px-2 ${activeTab === tab
                          ? 'text-[#607afb] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#607afb]'
                          : 'text-gray-400 hover:text-gray-900'
                          }`}
                      >
                        {labelMap[tab]}
                      </button>
                    );
                  })}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin h-10 w-10 text-[#607afb] border-4 border-[#607afb]/20 border-t-[#607afb] rounded-full" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl text-center font-bold text-sm">
                    {error}
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="space-y-4">
                    <div className="hidden md:block overflow-hidden rounded-xl border border-gray-100">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.invoiceNumber')}</th>
                            <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.service')}</th>
                            <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('cabinet.amount')}</th>
                            <th className="py-4 px-6 text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('listings.date')}</th>
                            <th className="py-4 px-4 text-gray-400 text-[11px] font-bold uppercase tracking-wider text-center">{t('listings.status')}</th>
                            <th className="py-4 px-4 text-gray-400 text-[11px] font-bold uppercase tracking-wider text-right">{t('cabinet.action')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50/40 transition-all border-b border-gray-50 last:border-0">
                              <td className="py-5 px-6 font-bold text-gray-900 text-sm">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-5 px-6">
                                <div className="text-gray-700 font-medium text-sm">{translateCabinetService(language === 'ru' && inv.serviceTypeRu ? inv.serviceTypeRu : inv.serviceType, language)}</div>
                              </td>
                              <td className="py-5 px-6">
                                <div className="text-sm font-black text-gray-900">{inv.amount.toFixed(2)} ₼</div>
                              </td>
                              <td className="py-5 px-6">
                                <div className="text-xs text-gray-500 font-medium">
                                  {new Date(inv.createdDate).toLocaleDateString(language === 'az' ? 'az-AZ' : 'ru-RU')}
                                </div>
                              </td>
                              <td className="py-5 px-4 text-center">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                  inv.status.toLowerCase() === 'pending' ? 'bg-blue-50 text-[#607afb]' :
                                    'bg-red-50 text-red-600'
                                  }`}>
                                  {inv.status === 'Paid' ? t('cabinet.paid') :
                                    inv.status === 'Pending' ? t('cabinet.unpaid') : t('cabinet.cancelled')}
                                </span>
                              </td>
                              <td className="py-5 px-4 text-right">
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => window.open(inv.pdfUrl || accountService.getInvoiceDownloadUrl(inv.id), '_blank')}
                                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                                    PDF
                                  </button>
                                  <button
                                    onClick={() => window.open(`/cabinet/invoices/${inv.id}/print`, '_blank')}
                                    className="inline-flex items-center gap-1.5 text-[#607afb] hover:text-[#4d62c9] font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    {t('cabinet.print')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                      {invoices.map((inv) => (
                        <div key={inv.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-900">{inv.invoiceNumber}</span>
                            <span className={`text-[10px] font-bold uppercase ${inv.status.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-[#607afb]'
                              }`}>{inv.status}</span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium mb-1">{translateCabinetService(language === 'ru' && inv.serviceTypeRu ? inv.serviceTypeRu : inv.serviceType, language)}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-gray-400">{new Date(inv.createdDate).toLocaleDateString(language === 'az' ? 'az-AZ' : 'ru-RU')}</span>
                            <span className="text-base font-black text-gray-900">{inv.amount.toFixed(2)} ₼</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => window.open(inv.pdfUrl || accountService.getInvoiceDownloadUrl(inv.id), '_blank')}
                              className="flex-1 py-2 border border-emerald-100 rounded-lg flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                              {t('cabinet.downloadPdf')}
                            </button>
                            <button
                              onClick={() => window.open(`/cabinet/invoices/${inv.id}/print`, '_blank')}
                              className="flex-1 py-2 border border-blue-100 rounded-lg flex items-center justify-center gap-2 text-[#607afb] bg-blue-50/50 hover:bg-blue-50 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">print</span>
                              {t('cabinet.print')}
                            </button>
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
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all cursor-pointer ${page === i + 1
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
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                    <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-gray-300 text-4xl">receipt</span>
                    </div>
                    <h3 className="text-gray-900 text-lg font-bold">{t('cabinet.noInvoices')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('cabinet.noInvoicesDesc')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
