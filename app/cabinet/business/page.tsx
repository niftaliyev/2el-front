'use client';

import { useState, useEffect, Suspense } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { adService } from '@/services/ad.service';
import { accountService, Invoice } from '@/services/account.service';
import { BusinessPackageDto, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Wallet, Rocket, Zap, Clock, Download, ChevronDown, Package, BadgePercent, Printer, FileText } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useLanguage } from '@/contexts/LanguageContext';

type TabType = 'packages' | 'balance' | 'invoices';
type InvoiceStatusTab = 'All' | 'Paid' | 'Pending' | 'Cancelled' | 'Expired' | 'Rejected';

const formatDate = (dateString: string | Date, language: string) => {
  return new Intl.DateTimeFormat(language === 'az' ? 'az-AZ' : 'ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateString));
};

const formatDateTime = (dateString: string | Date, language: string) => {
  return new Intl.DateTimeFormat(language === 'az' ? 'az-AZ' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
};

const invoiceStatusMap: Record<InvoiceStatusTab, string | undefined> = {
  'All': undefined,
  'Paid': 'Paid',
  'Pending': 'Pending',
  'Cancelled': 'Cancelled',
  'Expired': 'Expired',
  'Rejected': 'Rejected',
};

// ─── Inner component (useSearchParams istifadə edir) ─────────────────────────
function BusinessPageInner() {
  const { t, language } = useLanguage();
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'packages';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [invoiceTab, setInvoiceTab] = useState<InvoiceStatusTab>('All');
  const [invoicePage, setInvoicePage] = useState(1);

  const [packages, setPackages] = useState<BusinessPackageDto[]>([]);
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<PaginatedResponse<Invoice[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [confirmPkgId, setConfirmPkgId] = useState<string | null>(null);
  const durations = [30, 60, 90, 180];

  useEffect(() => {
    if (!isAuthLoading) {
      const isStore = user?.userType?.toString().toLowerCase() === 'store' ||
        user?.userType?.toString() === '1' ||
        user?.hasStore === true;

      if (!user || !isStore) {
        toast.error(t('cabinet.noStoreError') || 'Bu bölməyə daxil olmaq üçün aktiv mağazanız olmalıdır.');
        router.push('/business');
        return;
      }
      loadTabData(activeTab);
    }
  }, [user, isAuthLoading, activeTab, invoiceTab, invoicePage]);

  const loadTabData = async (tab: TabType) => {
    setIsLoading(true);
    try {
      if (tab === 'packages') {
        const [availableData, myData] = await Promise.all([
          adService.getBusinessPackages(),
          adService.getMyBusinessPackages()
        ]);
        setPackages(availableData.sort((a, b) => a.basePrice - b.basePrice));
        setMyPackages(myData);
      } else if (tab === 'balance') {
        await refreshUser();
      } else if (tab === 'invoices') {
        const status = invoiceStatusMap[invoiceTab];
        const data = await adService.getInvoices(status, invoicePage, 10);
        setInvoiceData(data);
      }
    } catch (error) {
      toast.error('Məlumatları yükləmək mümkün olmadı');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscountedPrice = (pkg: BusinessPackageDto, days: number) => {
    const periods = days / 30;
    const baseTotal = pkg.basePrice * periods;
    let discount = 0;
    if (days === 60) discount = pkg.discount60Days;
    else if (days === 90) discount = pkg.discount90Days;
    else if (days === 180) discount = pkg.discount180Days;
    return baseTotal * (1 - discount / 100);
  };

  const getDiscountPercent = (pkg: BusinessPackageDto, days: number) => {
    if (days === 60) return pkg.discount60Days;
    if (days === 90) return pkg.discount90Days;
    if (days === 180) return pkg.discount180Days;
    return 0;
  };

  const handleBuy = (packageId: string) => {
    setConfirmPkgId(packageId);
  };

  const handleBuyConfirmed = async (packageId: string) => {
    setIsProcessing(true);
    try {
      await adService.buyBusinessPackage(packageId, selectedDuration);
      toast.success(t('cabinet.buySuccess') || 'Biznes paketi uğurla alındı');
      setConfirmPkgId(null);
      await refreshUser();
      loadTabData('packages');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xəta baş verdi');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.history.pushState(null, '', `?tab=${tab}`);
  };

  const statusColors: Record<string, string> = {
    'Paid': 'text-green-600 bg-green-50',
    'Unpaid': 'text-orange-600 bg-orange-50',
    'Cancelled': 'text-red-600 bg-red-50',
    'Expired': 'text-gray-500 bg-gray-50',
    'Rejected': 'text-brown-600 bg-brown-50',
  };

  const statusLabels: Record<string, string> = {
    'Paid': t('cabinet.paid'),
    'Unpaid': t('cabinet.unpaid'),
    'Cancelled': t('cabinet.cancelled'),
    'Expired': t('cabinet.expiredStatus'),
    'Rejected': t('cabinet.rejectedStatus'),
  };

  return (
    <main className="bg-[#f8fafc] min-h-screen py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <UserSidebar />
          <div className="flex-1 min-w-0">
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t('cabinet.businessCabinet')}</h1>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">{t('cabinet.businessSubtitle')}</p>
                </div>
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cabinet.totalBalance')}</p>
                    <p className="text-lg font-black text-slate-900">
                      {((user?.balance || 0) + (user?.packageBalance || 0) + (user?.bonusBalance || 0)).toFixed(2)} <span className="text-sm font-bold">₼</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="grid grid-cols-3 sm:flex border-b border-slate-100 px-2 sm:px-8 pt-2 sm:pt-6 overflow-hidden sm:gap-10">
                {[
                  { id: 'packages', label: t('cabinet.nav.packages'), icon: Package },
                  { id: 'balance', label: t('cabinet.nav.balanceShort'), icon: Wallet },
                  { id: 'invoices', label: t('cabinet.nav.invoices'), icon: Check }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TabType)}
                    className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 font-bold text-[10px] sm:text-sm transition-all relative whitespace-nowrap cursor-pointer ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <tab.icon size={16} className="shrink-0 sm:w-[18px] sm:h-[18px]" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.5)]"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-8 flex-1">
                {activeTab === 'packages' && (
                  <div className="space-y-12">
                    {myPackages.filter(p => !p.isExpired).length > 0 && (
                      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
                          <Rocket size={160} />
                        </div>
                        <h3 className="text-amber-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-4 sm:mb-6 flex items-center gap-2">
                          <Zap size={14} className="fill-amber-400" /> {t('cabinet.activeBusinessPackage')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                          {myPackages.filter(p => !p.isExpired).map(pkg => (
                            <div key={pkg.id} className="flex flex-col gap-6">
                              <div>
                                <h4 className="text-3xl font-black">{language === 'ru' && pkg.nameRu ? pkg.nameRu : pkg.name}</h4>
                                <div className="flex items-center gap-2 mt-2 text-slate-400 font-medium">
                                  <Clock size={16} />
                                  <span>{t('cabinet.expirationTime')}: {formatDate(pkg.expireDate, language)}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('cabinet.adLimit')}</p>
                                  <p className="text-lg sm:text-xl font-black text-amber-400">{pkg.adLimit || 0}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('cabinet.serviceDiscount')}</p>
                                  <p className="text-lg sm:text-xl font-black text-blue-400">-{pkg.discount}%</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                              <Zap size={24} className="fill-amber-400" />
                            </div>
                            <div>
                              <p className="font-black text-lg">{t('cabinet.maxUseLimits')}</p>
                              <p className="text-slate-400 text-sm">{t('cabinet.addAdsToIncreaseSales')}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push('/elanlar/create')}
                            className="w-full md:w-auto bg-amber-400 text-slate-900 px-10 py-4 rounded-[1.25rem] font-black hover:bg-white hover:scale-105 transition-all shadow-xl shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
                          >
                            <span>{t('cabinet.postNewAd')}</span>
                            <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </button>
                        </div>
                      </section>
                    )}

                    <div>
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                          <h3 className="text-slate-900 text-xl sm:text-2xl font-black tracking-tight">{t('cabinet.selectNewPackage')}</h3>
                          <p className="text-slate-500 text-xs sm:text-sm font-medium h-auto mb-1">{t('cabinet.selectPackageDesc')}</p>
                        </div>
                        <div className="bg-slate-100 p-1 rounded-xl sm:rounded-2xl flex items-center self-start overflow-x-auto scrollbar-hide max-w-full no-scrollbar">
                          {durations.map(days => (
                            <button
                              key={days}
                              onClick={() => setSelectedDuration(days)}
                              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm transition-all relative whitespace-nowrap cursor-pointer ${selectedDuration === days ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              {days} {t('cabinet.day')}
                              {days > 30 && (
                                <div className="absolute -top-1 -right-1 sm:-top-3 sm:-right-2 bg-green-500 text-white text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-black scale-90">-%</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="flex justify-center items-center py-32">
                          <div className="relative">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-x-0 -bottom-8 text-center text-xs font-bold text-slate-400 animate-pulse">{t('common.loading').toUpperCase()}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {packages.map(pkg => {
                            const price = calculateDiscountedPrice(pkg, selectedDuration);
                            const originalPrice = pkg.basePrice * (selectedDuration / 30);
                            const discount = getDiscountPercent(pkg, selectedDuration);
                            const isRecommended = pkg.name.toLowerCase().includes('gold') || pkg.name.toLowerCase().includes('platinum');
                            return (
                              <div
                                key={pkg.id}
                                className={`group bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col border-2 transition-all hover:translate-y-[-8px] hover:shadow-2xl ${isRecommended ? 'border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5' : 'border-slate-50 hover:border-slate-200'}`}
                              >
                                {isRecommended && (
                                  <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full self-start mb-6 -mt-2">
                                    {t('cabinet.recommended')}
                                  </div>
                                )}
                                <div className="mb-8">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-black text-slate-900">{language === 'ru' && pkg.nameRu ? pkg.nameRu : pkg.name}</h3>
                                    <BadgePercent size={24} className="text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[40px] leading-relaxed">
                                    {language === 'ru' && pkg.descriptionRu ? pkg.descriptionRu : (pkg.description || t('cabinet.packageDescDefault', { name: pkg.name }))}
                                  </p>
                                </div>
                                <div className="mb-8 bg-slate-50/50 rounded-3xl p-6 border border-slate-50">
                                  {discount > 0 && (
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-slate-400 line-through text-sm font-bold">{originalPrice.toFixed(0)} ₼</span>
                                      <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-lg">-{discount}% {t('cabinet.discount')}</span>
                                    </div>
                                  )}
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">{price.toFixed(0)}</span>
                                    <span className="text-xl font-bold text-slate-400">₼</span>
                                  </div>
                                  <div className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('cabinet.paymentForDays', { days: selectedDuration })}</div>
                                </div>
                                <ul className="flex-1 space-y-4 mb-8">
                                  <li className="flex items-center gap-3 group/item">
                                    <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                                      <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 text-sm font-semibold">
                                      {t('cabinet.adLimit')}: <strong className="text-slate-900">{pkg.adLimit * (selectedDuration / 30)}</strong> {t('listings.ads').toLowerCase()}
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-3 group/item">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover/item:bg-blue-500 group-hover/item:text-white transition-colors">
                                      <Wallet size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 text-sm font-semibold">
                                      {t('cabinet.serviceBalance')}: <strong className="text-slate-900">{pkg.serviceBalance * (selectedDuration / 30)} ₼</strong>
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-3 group/item">
                                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover/item:bg-amber-500 group-hover/item:text-white transition-colors">
                                      <BadgePercent size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 text-sm font-semibold">
                                      {t('nav.services')}: <strong className="text-slate-900">-{pkg.serviceDiscountPercentage}% {t('cabinet.discount').toLowerCase()}</strong>
                                    </span>
                                  </li>
                                </ul>
                                <button
                                  onClick={() => handleBuy(pkg.id)}
                                  disabled={isProcessing}
                                  className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all cursor-pointer ${isRecommended ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02]' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]'} disabled:opacity-50 disabled:scale-100`}
                                >
                                  {isProcessing ? t('promoteModal.waiting').toUpperCase() : t('cabinet.activateNow')}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'balance' && (
                  <div className="space-y-12">
                    <div className="bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none"></div>
                          <div className="relative z-10 flex-1 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                <Wallet size={20} />
                              </div>
                              <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">{t('cabinet.accountSummary')}</h4>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">
                              {((user?.balance || 0) + (user?.packageBalance || 0) + (user?.bonusBalance || 0)).toFixed(2)} <span className="text-xl sm:text-2xl font-bold text-slate-500">₼</span>
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm font-medium">{t('cabinet.totalBalanceExplanation')}</p>
                          </div>
                      <div className="relative z-10 w-full lg:w-auto">
                        <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95 w-full cursor-pointer">
                          {t('cabinet.increaseBalance')}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: t('cabinet.mainBalance'), desc: t('cabinet.mainBalanceDesc'), value: user?.balance, icon: Wallet, color: 'blue' },
                        { title: t('cabinet.packageBalance'), desc: t('cabinet.packageBalanceDesc'), value: user?.packageBalance, icon: Package, color: 'green' },
                        { title: t('cabinet.bonusBalance'), desc: t('cabinet.bonusBalanceDesc'), value: user?.bonusBalance, icon: BadgePercent, color: 'amber' }
                      ].map((b, i) => (
                        <div key={i} className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col gap-6">
                          <div className={`w-12 h-12 rounded-2xl bg-${b.color}-500/10 text-${b.color}-500 flex items-center justify-center`}>
                            <b.icon size={24} />
                          </div>
                          <div>
                            <h5 className="text-slate-900 text-lg font-black mb-1">{b.title}</h5>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4">{b.desc}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{b.value?.toFixed(2)} <span className="text-sm">₼</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-white shrink-0">
                        <p className="text-[8px] sm:text-[10px] font-black opacity-40 uppercase">{t('cabinet.adLimit').toUpperCase()}</p>
                        <p className="text-2xl sm:text-3xl font-black tracking-tight">{user?.adLimit || 0}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 mb-2">{t('cabinet.remainingAdLimit')}</h4>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                          {t('cabinet.remainingAdLimitDesc', { count: user?.adLimit || 0 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'invoices' && (
                  <div className="space-y-6">
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide bg-slate-100 p-1 rounded-xl sm:rounded-2xl self-start max-w-full snap-x snap-mandatory">
                      {(['All', 'Paid', 'Pending', 'Cancelled', 'Expired', 'Rejected'] as InvoiceStatusTab[]).map((status) => {
                        const labelMap: Record<InvoiceStatusTab, string> = {
                          All: t('common.all'),
                          Paid: t('cabinet.paid'),
                          Pending: t('cabinet.unpaid'),
                          Cancelled: t('cabinet.cancelled'),
                          Expired: t('cabinet.expiredStatus'),
                          Rejected: t('cabinet.rejectedStatus'),
                        };
                        return (
                          <button
                            key={status}
                            onClick={() => { setInvoiceTab(status); setInvoicePage(1); }}
                            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs whitespace-nowrap transition-all cursor-pointer snap-start ${invoiceTab === status ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {labelMap[status]}
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                      {isLoading ? (
                        <div className="flex justify-center items-center py-40">
                          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-50 bg-slate-50/30">
                                  <th className="px-8 py-5">{t('listings.date')}</th>
                                  <th className="px-8 py-5">{t('cabinet.invoiceNumber')}</th>
                                  <th className="px-8 py-5">{t('cabinet.service')}</th>
                                  <th className="px-8 py-5">{t('cabinet.amount')}</th>
                                  <th className="px-8 py-5">{t('listings.status')}</th>
                                  <th className="px-8 py-5 text-right">{t('cabinet.action')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {(invoiceData?.data || []).map(inv => (
                                  <tr key={inv.id} className="text-slate-600 text-sm group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-5 font-bold text-slate-900">{formatDate(inv.createdDate, language)}</td>
                                    <td className="px-8 py-5 font-bold text-slate-500">#{inv.invoiceNumber}</td>
                                    <td className="px-8 py-5 font-black text-slate-900">{language === 'ru' && inv.serviceTypeRu ? inv.serviceTypeRu : inv.serviceType}</td>
                                    <td className="px-8 py-5 font-black text-primary text-base">{inv.amount.toFixed(2)} <span className="text-[10px] opacity-60">₼</span></td>
                                    <td className="px-8 py-5">
                                      <div className="flex flex-col">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[inv.status] || 'text-slate-600 bg-slate-100'}`}>
                                          {statusLabels[inv.status] || inv.status}
                                        </span>
                                        {inv.paidDate && (
                                          <span className="text-[10px] text-slate-400 mt-1 font-medium">{formatDateTime(inv.paidDate, language)}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button onClick={() => window.open(inv.pdfUrl || accountService.getInvoiceDownloadUrl(inv.id), '_blank')} className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center cursor-pointer" title={t('cabinet.downloadPdf')}>
                                          <FileText size={18} />
                                        </button>
                                        <button onClick={() => window.open(`/cabinet/invoices/${inv.id}/print`, '_blank')} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center cursor-pointer" title={t('cabinet.print')}>
                                          <Printer size={18} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="md:hidden divide-y divide-slate-50">
                            {(invoiceData?.data || []).map(inv => (
                              <div key={inv.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">#{inv.invoiceNumber}</span>
                                    <h5 className="font-black text-slate-900">{language === 'ru' && inv.serviceTypeRu ? inv.serviceTypeRu : inv.serviceType}</h5>
                                  </div>
                                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[inv.status] || 'text-slate-600 bg-slate-100'}`}>
                                    {statusLabels[inv.status] || inv.status}
                                  </span>
                                </div>
                                <div className="flex justify-between items-end">
                                  <div className="text-slate-400 text-xs font-medium">{formatDate(inv.createdDate, language)}</div>
                                  <div className="text-lg font-black text-primary">{inv.amount.toFixed(2)} <span className="text-xs uppercase opacity-60">₼</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                  <button onClick={() => window.open(inv.pdfUrl || accountService.getInvoiceDownloadUrl(inv.id), '_blank')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs cursor-pointer">
                                    <FileText size={16} /> {t('cabinet.downloadPdf')}
                                  </button>
                                  <button onClick={() => window.open(`/cabinet/invoices/${inv.id}/print`, '_blank')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs cursor-pointer">
                                    <Printer size={16} /> {t('cabinet.print')}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {(!invoiceData?.data || invoiceData.data.length === 0) && (
                            <div className="py-32 text-center w-full">
                              <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-slate-50 rounded-full text-slate-200">
                                  <Download size={48} />
                                </div>
                                <p className="text-slate-400 font-bold">{t('cabinet.noInvoices')}</p>
                              </div>
                            </div>
                          )}

                          {invoiceData && invoiceData.totalPages > 1 && (
                            <div className="p-8 border-t border-slate-50 flex items-center justify-center gap-2">
                              <button onClick={() => setInvoicePage(p => Math.max(1, p - 1))} disabled={invoicePage === 1} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer">
                                <ChevronDown size={20} className="rotate-90" />
                              </button>
                              {[...Array(invoiceData.totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setInvoicePage(i + 1)} className={`w-10 h-10 rounded-xl text-sm font-black transition-all cursor-pointer ${invoicePage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                                  {i + 1}
                                </button>
                              ))}
                              <button onClick={() => setInvoicePage(p => Math.min(invoiceData.totalPages, p + 1))} disabled={invoicePage === invoiceData.totalPages} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer">
                                <ChevronDown size={20} className="-rotate-90" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmPkgId}
        onClose={() => setConfirmPkgId(null)}
        onConfirm={() => confirmPkgId && handleBuyConfirmed(confirmPkgId)}
        title={t('cabinet.activatePackage')}
        description={t('cabinet.activatePackageDesc')}
        confirmText={t('cabinet.activateNow')}
        cancelText={t('common.cancel')}
        isLoading={isProcessing}
      />
    </main>
  );
}

// ─── Page export: Suspense wrapper ───────────────────────────────────────────
// Next.js 15 tələbi: useSearchParams() istifadə edən komponentlər
// mütləq <Suspense> daxilindəki olmalıdır (standalone build zamanı prerender xətasını aradan qaldırır)
export default function BusinessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <BusinessPageInner />
    </Suspense>
  );
}
