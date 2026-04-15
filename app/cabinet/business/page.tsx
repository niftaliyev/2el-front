'use client';

import { useState, useEffect } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { adService } from '@/services/ad.service';
import { accountService, Invoice } from '@/services/account.service';
import { BusinessPackageDto, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Wallet, Rocket, Zap, Clock, Download, ChevronDown, Package, BadgePercent, Printer, FileText } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type TabType = 'packages' | 'balance' | 'invoices';
type InvoiceStatusTab = 'Hamısı' | 'Ödənilmiş' | 'Ödənilməmiş' | 'Ləğv olunmuş' | 'Müddəti bitmiş' | 'İmtina olunub';

const formatDate = (dateString: string | Date) => {
  return new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateString));
};

const formatDateTime = (dateString: string | Date) => {
  return new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
};

const invoiceStatusMap: Record<InvoiceStatusTab, string | undefined> = {
  'Hamısı': undefined,
  'Ödənilmiş': 'Paid',
  'Ödənilməmiş': 'Pending',
  'Ləğv olunmuş': 'Cancelled',
  'Müddəti bitmiş': 'Expired',
  'İmtina olunub': 'Rejected',
};

export default function BusinessPage() {
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'packages';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [invoiceTab, setInvoiceTab] = useState<InvoiceStatusTab>('Hamısı');

  const [packages, setPackages] = useState<BusinessPackageDto[]>([]);
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<PaginatedResponse<Invoice[]> | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);
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
        toast.error('Bu bölməyə daxil olmaq üçün aktiv mağazanız olmalıdır.');
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
      toast.success('Biznes paketi uğurla alındı');
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
    'Paid': 'Ödənilib',
    'Unpaid': 'Gözləmədə',
    'Cancelled': 'Ləğv edilib',
    'Expired': 'Müddəti bitib',
    'Rejected': 'İmtina edilib',
  };

  return (
    <main className="bg-[#f8fafc] min-h-screen py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <UserSidebar />

          <div className="flex-1 min-w-0">
            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Biznes Kabineti</h1>
                <p className="text-slate-500 font-medium mt-1">Paketlərinizi idarə edin və balansınızı izləyin</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cəmi Balans</p>
                    <p className="text-lg font-black text-slate-900">
                      {((user?.balance || 0) + (user?.packageBalance || 0) + (user?.bonusBalance || 0)).toFixed(2)} <span className="text-sm font-bold">AZN</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">

              {/* Internal Tabs */}
              <div className="flex border-b border-slate-100 px-8 pt-6">
                {[
                  { id: 'packages', label: 'Paketlər', icon: Package },
                  { id: 'balance', label: 'Balans', icon: Wallet },
                  { id: 'invoices', label: 'İnvoyslar', icon: Check }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TabType)}
                    className={`flex items-center gap-2 px-8 py-4 font-bold text-sm transition-all relative ${activeTab === tab.id
                      ? 'text-primary'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.5)]"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-8 flex-1">
                {activeTab === 'packages' && (
                  <div className="space-y-12">
                    {/* Active Packages Section */}
                    {myPackages.filter(p => !p.isExpired).length > 0 && (
                      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Rocket size={160} />
                        </div>
                        <h3 className="text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Zap size={14} className="fill-amber-400" /> Aktiv Biznes Paketi
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                          {myPackages.filter(p => !p.isExpired).map(pkg => (
                            <div key={pkg.id} className="flex flex-col gap-6">
                              <div>
                                <h4 className="text-3xl font-black">{pkg.name}</h4>
                                <div className="flex items-center gap-2 mt-2 text-slate-400 font-medium">
                                  <Clock size={16} />
                                  <span>Bitmə vaxtı: {formatDate(pkg.expireDate)}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Elan Limiti</p>
                                  <p className="text-xl font-black text-amber-400">{pkg.adLimit || 0}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Xidmət Endirimi</p>
                                  <p className="text-xl font-black text-blue-400">-{pkg.discount}%</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Updated Button Position: Below the content, aligned right/center */}
                        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                              <Zap size={24} className="fill-amber-400" />
                            </div>
                            <div>
                              <p className="font-black text-lg">Limitlərinizdən maksimum istifadə edin</p>
                              <p className="text-slate-400 text-sm">Satışlarınızı artırmaq üçün yeni elanlar əlavə edin</p>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push('/elanlar/create')}
                            className="w-full md:w-auto bg-amber-400 text-slate-900 px-10 py-4 rounded-[1.25rem] font-black hover:bg-white hover:scale-105 transition-all shadow-xl shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2 group"
                          >
                            <span>Yeni elan yerləşdir</span>
                            <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </button>
                        </div>
                      </section>
                    )}

                    {/* New Purchase Section */}
                    <div>
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                          <h3 className="text-slate-900 text-2xl font-black tracking-tight">Yeni Paket Seçin</h3>
                          <p className="text-slate-500 font-medium h-6">Ehtiyacınıza uyğun olan paketi seçərək satışlarınızı artırın</p>
                        </div>

                        {/* Duration Tabs */}
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center self-start">
                          {durations.map(days => (
                            <button
                              key={days}
                              onClick={() => setSelectedDuration(days)}
                              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all relative ${selectedDuration === days
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                              {days} gün
                              {days > 30 && (
                                <div className="absolute -top-3 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black scale-90">
                                  -%
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="flex justify-center items-center py-32">
                          <div className="relative">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-x-0 -bottom-8 text-center text-xs font-bold text-slate-400 animate-pulse">YÜKLƏNİR...</div>
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
                                className={`group bg-white rounded-[2.5rem] p-8 flex flex-col border-2 transition-all hover:translate-y-[-8px] hover:shadow-2xl ${isRecommended
                                  ? 'border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5'
                                  : 'border-slate-50 hover:border-slate-200'
                                  }`}
                              >
                                {isRecommended && (
                                  <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full self-start mb-6 -mt-2">
                                    TÖVSİYƏ OLUNAN
                                  </div>
                                )}

                                <div className="mb-8">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-black text-slate-900">{pkg.name}</h3>
                                    <BadgePercent size={24} className="text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[40px] leading-relaxed">
                                    {pkg.description || `${pkg.name} paketi ilə biznesinizi növbəti səviyyəyə daşıyın.`}
                                  </p>
                                </div>

                                <div className="mb-8 bg-slate-50/50 rounded-3xl p-6 border border-slate-50">
                                  {discount > 0 && (
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-slate-400 line-through text-sm font-bold">{originalPrice.toFixed(0)} AZN</span>
                                      <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-lg">-{discount}% ENDİRİM</span>
                                    </div>
                                  )}
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">{price.toFixed(0)}</span>
                                    <span className="text-xl font-bold text-slate-400">AZN</span>
                                  </div>
                                  <div className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedDuration} GÜNLÜK ÖDƏNİŞ</div>
                                </div>

                                <ul className="flex-1 space-y-4 mb-8">
                                  <li className="flex items-center gap-3 group/item">
                                    <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                                      <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 text-sm font-semibold">
                                      Elan limiti: <strong className="text-slate-900">{pkg.adLimit * (selectedDuration / 30)}</strong> elan
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-3 group/item">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover/item:bg-blue-500 group-hover/item:text-white transition-colors">
                                      <Wallet size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 text-sm font-semibold">
                                      Xidmət balansı: <strong className="text-slate-900">{pkg.serviceBalance * (selectedDuration / 30)} AZN</strong>
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-3 group/item">
                                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover/item:bg-amber-500 group-hover/item:text-white transition-colors">
                                      <BadgePercent size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 text-sm font-semibold">
                                      Xidmətlər: <strong className="text-slate-900">-{pkg.serviceDiscountPercentage}% endirim</strong>
                                    </span>
                                  </li>
                                </ul>

                                <button
                                  onClick={() => handleBuy(pkg.id)}
                                  disabled={isProcessing}
                                  className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all ${isRecommended
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02]'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]'
                                    } disabled:opacity-50 disabled:scale-100`}
                                >
                                  {isProcessing ? 'GÖZLƏYİN...' : 'İNDİ AKTİVLƏŞDİR'}
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
                    {/* Dynamic Balance Progress */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none"></div>
                      <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <Wallet size={20} />
                          </div>
                          <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hesabın ümumi vəziyyəti</h4>
                        </div>
                        <h2 className="text-5xl font-black tracking-tight mb-2">
                          {((user?.balance || 0) + (user?.packageBalance || 0) + (user?.bonusBalance || 0)).toFixed(2)} <span className="text-2xl font-bold text-slate-500">AZN</span>
                        </h2>
                        <p className="text-slate-400 font-medium">Bu məbləğ platformadakı bütün aktiv balanslarınızın cəmidir.</p>
                      </div>
                      <div className="relative z-10 w-full lg:w-auto">
                        <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95 w-full">
                          Balansı Artır
                        </button>
                      </div>
                    </div>

                    {/* Balance Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          title: 'Əsas balans',
                          desc: 'Yatırılan və geri qaytarılan vəsaitlər.',
                          value: user?.balance,
                          icon: Wallet,
                          color: 'blue'
                        },
                        {
                          title: 'Paketin balansı',
                          desc: 'Biznes paket xidməti üzrə hədiyyə balans.',
                          value: user?.packageBalance,
                          icon: Package,
                          color: 'green'
                        },
                        {
                          title: 'Bonus balansı',
                          desc: 'Kampaniya və hədiyyə bonusları.',
                          value: user?.bonusBalance,
                          icon: BadgePercent,
                          color: 'amber'
                        }
                      ].map((b, i) => (
                        <div key={i} className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col gap-6">
                          <div className={`w-12 h-12 rounded-2xl bg-${b.color}-500/10 text-${b.color}-500 flex items-center justify-center`}>
                            <b.icon size={24} />
                          </div>
                          <div>
                            <h5 className="text-slate-900 text-lg font-black mb-1">{b.title}</h5>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4">{b.desc}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{b.value?.toFixed(2)} <span className="text-sm">AZN</span></p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ad Limit info */}
                    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-20 h-20 rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-white shrink-0">
                        <p className="text-[10px] font-black opacity-40 uppercase">LIMIT</p>
                        <p className="text-3xl font-black tracking-tight">{user?.adLimit || 0}</p>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Qalan Elan Limiti</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                          Sizin cari biznes paketiniz üzrə aktiv elan yerləşdirmə limitiniz <strong className="text-slate-900">{user?.adLimit || 0}</strong> ədəddir.
                          Limit bitdikdə yeni paket alaraq və ya balansınızı artıraraq davam edə bilərsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'invoices' && (
                  <div className="space-y-6">
                    {/* Invoice Tabs */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide bg-slate-100 p-1.5 rounded-2xl self-start max-w-fit">
                      {(['Hamısı', 'Ödənilmiş', 'Ödənilməmiş', 'Ləğv olunmuş', 'Müddəti bitmiş', 'İmtina olunub'] as InvoiceStatusTab[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setInvoiceTab(status);
                            setInvoicePage(1);
                          }}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${invoiceTab === status
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {/* Invoice Table Container */}
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
                                  <th className="px-8 py-5">Tarix</th>
                                  <th className="px-8 py-5">Nömrə</th>
                                  <th className="px-8 py-5">Xidmət</th>
                                  <th className="px-8 py-5">Məbləğ</th>
                                  <th className="px-8 py-5">Status</th>
                                  <th className="px-8 py-5 text-right">Fəaliyyət</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {(invoiceData?.data || []).map(inv => (
                                  <tr key={inv.id} className="text-slate-600 text-sm group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-5 font-bold text-slate-900">{formatDate(inv.createdDate)}</td>
                                    <td className="px-8 py-5 font-bold text-slate-500">#{inv.invoiceNumber}</td>
                                    <td className="px-8 py-5 font-black text-slate-900">{inv.serviceType}</td>
                                    <td className="px-8 py-5 font-black text-primary text-base">{inv.amount.toFixed(2)} <span className="text-[10px] opacity-60">AZN</span></td>
                                    <td className="px-8 py-5">
                                      <div className="flex flex-col">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[inv.status] || 'text-slate-600 bg-slate-100'}`}>
                                          {statusLabels[inv.status] || inv.status}
                                        </span>
                                        {inv.paidDate && (
                                          <span className="text-[10px] text-slate-400 mt-1 font-medium">{formatDateTime(inv.paidDate)}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => window.open(inv.pdfUrl || accountService.getInvoiceDownloadUrl(inv.id), '_blank')}
                                          className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
                                          title="PDF Endir"
                                        >
                                          <FileText size={18} />
                                        </button>
                                        <button
                                          onClick={() => window.open(`/cabinet/invoices/${inv.id}/print`, '_blank')}
                                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                                          title="Çap et"
                                        >
                                          <Printer size={18} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile List View */}
                          <div className="md:hidden divide-y divide-slate-50">
                            {(invoiceData?.data || []).map(inv => (
                              <div key={inv.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">#{inv.invoiceNumber}</span>
                                    <h5 className="font-black text-slate-900">{inv.serviceType}</h5>
                                  </div>
                                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[inv.status] || 'text-slate-600 bg-slate-100'}`}>
                                    {statusLabels[inv.status] || inv.status}
                                  </span>
                                </div>
                                <div className="flex justify-between items-end">
                                  <div className="text-slate-400 text-xs font-medium">
                                    {formatDate(inv.createdDate)}
                                  </div>
                                  <div className="text-lg font-black text-primary">
                                    {inv.amount.toFixed(2)} <span className="text-xs uppercase opacity-60">AZN</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                  <button
                                    onClick={() => window.open(inv.pdfUrl || accountService.getInvoiceDownloadUrl(inv.id), '_blank')}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs"
                                  >
                                    <FileText size={16} /> PDF Endir
                                  </button>
                                  <button
                                    onClick={() => window.open(`/cabinet/invoices/${inv.id}/print`, '_blank')}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs"
                                  >
                                    <Printer size={16} /> Çap et
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
                                <p className="text-slate-400 font-bold">Heç bir invoys tapılmadı</p>
                              </div>
                            </div>
                          )}

                          {/* Pagination */}
                          {invoiceData && invoiceData.totalPages > 1 && (
                            <div className="p-8 border-t border-slate-50 flex items-center justify-center gap-2">
                              <button
                                onClick={() => setInvoicePage(p => Math.max(1, p - 1))}
                                disabled={invoicePage === 1}
                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                              >
                                <ChevronDown size={20} className="rotate-90" />
                              </button>

                              {[...Array(invoiceData.totalPages)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setInvoicePage(i + 1)}
                                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${invoicePage === i + 1
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                  {i + 1}
                                </button>
                              ))}

                              <button
                                onClick={() => setInvoicePage(p => Math.min(invoiceData.totalPages, p + 1))}
                                disabled={invoicePage === invoiceData.totalPages}
                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                              >
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
        title="Paketi Aktivləşdir"
        description="Seçdiyiniz biznes paketini aktivləşdirmək istədiyinizə əminsiniz? Müvafiq məbləğ balansınızdan çıxılacaq. Əgər aktiv paketiniz varsa, yeni paket dərhal qüvvəyə minəcək və köhnə paketinizin qalan müddəti yeni paketin üzərinə əlavə olunacaq."
        confirmText="Aktivləşdir"
        cancelText="İmtina"
        isLoading={isProcessing}
      />
    </main>
  );
}
