'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { storeService } from '@/services/store.service';
import { StoreDetail, StoreAdItem } from '@/types/api';
import { getImageUrl, formatPrice, formatRelativeTime } from '@/lib/utils';
import ProductGrid from '@/components/features/products/ProductGrid';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Product } from '@/types';
import ReportModal from '@/components/features/ReportModal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StoreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [ads, setAds] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [adSortOrder, setAdSortOrder] = useState('newest');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isWorkHoursExpanded, setIsWorkHoursExpanded] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { t, language } = useLanguage();
  const isNavVisible = useScrollDirection();

  const availableCategories = Array.from(new Set(ads.map(ad => ad.category?.name).filter(Boolean))) as string[];

  useEffect(() => {
    const handleGlobalClick = () => {
      setIsSortDropdownOpen(false);
      setIsCategoryDropdownOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const loadStore = async () => {
      try {
        setIsLoading(true);

        // Check if the current slug parameter is actually a GUID (identity)
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        let data: StoreDetail;

        try {
          if (isGuid) {
            // If it's a GUID format, try fetching by ID first
            try {
              data = await storeService.getStore(slug);
            } catch (err) {
              // Fallback to slug just in case a slug looks like a GUID
              data = await storeService.getStoreBySlug(slug);
            }
          } else {
            // Normal slug lookup
            data = await storeService.getStoreBySlug(slug);
          }
        } catch (err) {
          console.error("Store not found or loading error:", err);
          setIsLoading(false);
          return;
        }

        setStore(data);
        setIsFollowing(!!data.isFollowing);
        setFollowerCount(data.followerCount || 0);

        // Load ads
        const storeAds = await storeService.getStoreAds(data.id);
        const mappedAds: Product[] = storeAds.map((ad: StoreAdItem) => ({
          id: ad.id,
          title: ad.title,
          price: ad.price,
          currency: '₼',
          images: ad.image ? [getImageUrl(ad.image)] : [],
          createdAt: new Date(ad.createdDate),
          category: { name: (language === 'ru' && ad.categoryNameRu ? ad.categoryNameRu : ad.categoryName) || '', slug: '' },
          location: { city: ad.city || '', cityRu: ad.cityRu },
          seller: { name: data.storeName, id: data.id, createdAt: new Date(), email: '', isVerified: true },
          condition: ad.isNew ? 'new' : 'used',
          isFeatured: ad.isVip,
          isPremium: ad.isPremium,
          isBoosted: ad.isBoosted,
          isFavourite: ad.isFavourite,
          status: 'active',
          viewCount: 0,
          favoriteCount: 0,
          updatedAt: new Date(ad.createdDate),
          store: {
            id: data.id,
            name: data.storeName,
            logo: data.storeLogoUrl ? getImageUrl(data.storeLogoUrl) : undefined
          }
        }) as any);
        setAds(mappedAds);

        // Increment view count - use slug if available, otherwise use id
        storeService.incrementStoreView(data.slug || data.id).catch(console.error);
      } catch (err) {
        console.error('Error loading store:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) loadStore();
  }, [slug, language]);

  const handleToggleFollow = async () => {
    if (!store) return;
    try {
      const result = await storeService.toggleFollowStore(store.id);
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(adSearchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'new' && ad.condition === 'new');
    const matchesCategory = selectedCategory === 'all' || ad.category?.name === selectedCategory;
    return matchesSearch && matchesTab && matchesCategory;
  }).sort((a, b) => {
    if (adSortOrder === 'price-asc') return a.price - b.price;
    if (adSortOrder === 'price-desc') return b.price - a.price;
    if (adSortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">{t('storeDetail.notFound')}</h1>
        <Link href="/shops" className="text-primary hover:underline mt-4">{t('storeDetail.goHome')}</Link>
      </div>
    );
  }

  const getStoreStatus = () => {
    if (!store || !store.workSchedules || store.workSchedules.length === 0) return null;

    const now = new Date();
    const day = now.getDay();

    const getSchForDay = (d: number) => {
      return store.workSchedules.find(ws => {
        if (typeof ws.dayOfWeek === 'number') return ws.dayOfWeek === d;
        const dayMap: Record<string, number> = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        if (dayMap[ws.dayOfWeek]) return dayMap[ws.dayOfWeek] === d;
        const sInt = parseInt(ws.dayOfWeek);
        return !isNaN(sInt) && sInt === d;
      });
    };

    const currentSchedule = getSchForDay(day);

    if (!currentSchedule) {
      // Find next day with schedule
      for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        const nextSch = getSchForDay(nextDay);
        if (nextSch && (nextSch.isOpen24Hours || nextSch.openTime)) {
          const openStr = nextSch.isOpen24Hours ? t('common.storeStatus.open24h') : t('common.storeStatus.opensAt', { time: nextSch.openTime?.slice(0, 5) ?? '' });
          return { isOpen: false, text: `${t('common.storeStatus.closed')} (${nextDay === (day + 1) % 7 ? t('common.storeStatus.tomorrow') : getDayName(nextDay)} ${openStr})` };
        }
      }
      return { isOpen: false, text: t('common.storeStatus.closed') };
    }

    if (currentSchedule.isOpen24Hours) return { isOpen: true, text: t('common.storeStatus.nowOpen24h') };

    if (!currentSchedule.openTime || !currentSchedule.closeTime) {
      return { isOpen: false, text: t('common.storeStatus.closed') };
    }

    const [nowH, nowM] = [now.getHours(), now.getMinutes()];
    const nowTotal = nowH * 60 + nowM;
    const [startH, startM] = currentSchedule.openTime.split(':').map(Number);
    const [endH, endM] = currentSchedule.closeTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (nowTotal >= startTotal && nowTotal < endTotal) {
      return { isOpen: true, text: `${t('common.storeStatus.open')} (${t('common.storeStatus.closesAt', { time: currentSchedule.closeTime.slice(0, 5) })})` };
    } else if (nowTotal < startTotal) {
      return { isOpen: false, text: `${t('common.storeStatus.closed')} (${t('common.storeStatus.opensAt', { time: currentSchedule.openTime.slice(0, 5) })})` };
    } else {
      // After closing time today, find when it opens next
      for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        const nextSch = getSchForDay(nextDay);
        if (nextSch && (nextSch.isOpen24Hours || nextSch.openTime)) {
          const openStr = nextSch.isOpen24Hours ? t('common.storeStatus.open24h') : t('common.storeStatus.opensAt', { time: nextSch.openTime?.slice(0, 5) ?? '' });
          return { isOpen: false, text: `${t('common.storeStatus.closed')} (${nextDay === (day + 1) % 7 ? t('common.storeStatus.tomorrow') : getDayName(nextDay)} ${openStr})` };
        }
      }
      return { isOpen: false, text: t('common.storeStatus.closed') };
    }
  };

  const getDayName = (day: number) => {
    return t(`common.days.${day}`);
  };

  const storeStatus = getStoreStatus();

  return (
    <main className="min-h-screen bg-gray-50 pb-32 sm:pb-20">
      {/* Cover and Profile Header */}
      <div className="relative">
        <div className="h-56 md:h-96 w-full relative bg-gray-200 overflow-hidden">
          {store.storeCoverUrl ? (
            <Image
              src={getImageUrl(store.storeCoverUrl)}
              alt="Store Cover"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-10">
          <div className="relative -mt-16 md:-mt-28 flex flex-col md:flex-row items-center md:items-end gap-6 pb-8">
            {/* Logo Section */}
            <div className="relative group shrink-0">
              <div className="size-32 md:size-52 rounded-[2rem] border-[6px] border-white bg-white shadow-2xl relative overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                {store.storeLogoUrl ? (
                  <Image
                    src={getImageUrl(store.storeLogoUrl)}
                    alt={store.storeName}
                    fill
                    className="object-cover p-2 md:p-3"
                  />
                ) : (
                  <span className="material-symbols-outlined text-5xl md:text-7xl text-gray-200">store</span>
                )}
              </div>

              {/* Status Indicator Overlay */}
              <div className={`absolute bottom-2 right-2 md:bottom-5 md:right-5 size-5 md:size-6 rounded-full border-4 border-white shadow-lg ${storeStatus?.isOpen ? 'bg-green-500' : 'bg-red-500'} z-10`} />
            </div>

            {/* Branding & Info Section */}
            <div className="flex-1 w-full md:pb-2">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex flex-col items-center md:items-start space-y-3">
                  {/* Title and Badge */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm text-center md:text-left">
                      {store.storeName}
                    </h1>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 rounded-full shadow-lg shadow-blue-600/20">
                      <span className="material-symbols-outlined text-white !text-[16px] md:!text-[18px]">verified</span>
                      <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-wider">{t('storeDetail.officialStore')}</span>
                    </div>
                  </div>

                  {/* Headline & Location */}
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    <p className="text-lg md:text-xl font-bold text-gray-700 text-center md:text-left">
                      {(language === 'ru' ? store.headlineRu : store.headline) || t('storeDetail.defaultHeadline')}
                    </p>
                    <div className="flex items-center gap-1.5 text-gray-400 font-medium text-sm">
                      <span className="hidden md:block">•</span>
                      <span className="material-symbols-outlined !text-[18px]">location_on</span>
                      {language === 'ru' && store.cityNameRu ? store.cityNameRu : (store.cityName || store.address?.split(',')[0])}
                    </div>
                  </div>

                  {/* Highlights / Stats */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mt-2">
                    <div className="flex items-center px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-black text-base md:text-lg">{store.adCount || 0}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('shops.ads')}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-black text-base md:text-lg">{store.viewCount || 0}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('shops.views')}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-black text-base md:text-lg">{followerCount}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('storeDetail.followers')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                      <div className={`flex items-center gap-2 font-black text-[10px] md:text-[11px] uppercase tracking-widest ${storeStatus?.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                        <div className={`size-2 rounded-full ${storeStatus?.isOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse' : 'bg-red-500'}`} />
                        {storeStatus?.text}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center justify-center md:justify-start gap-3 md:pb-2 w-full lg:w-auto">
                  <button
                    onClick={handleToggleFollow}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 md:px-10 h-14 md:h-16 rounded-[1.25rem] shadow-xl transition-all active:scale-95 font-bold text-sm cursor-pointer ${isFollowing
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none'
                      : 'bg-primary text-white shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:shadow-none'
                      }`}
                  >
                    <span className="material-symbols-outlined !text-[20px] md:!text-[24px]">
                      {isFollowing ? 'person_remove' : 'person_add'}
                    </span>
                    {isFollowing ? t('storeDetail.followed') : t('storeDetail.followStore')}
                  </button>
                  <button className="flex items-center justify-center size-14 md:size-16 bg-white text-gray-400 rounded-[1.25rem] border border-gray-100 hover:border-primary/20 hover:text-primary active:scale-95 transition-all shadow-lg hover:shadow-xl group cursor-pointer">
                    <span className="material-symbols-outlined !text-[22px] md:!text-[26px] group-hover:rotate-12 transition-transform">share</span>
                  </button>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center justify-center size-14 md:size-16 bg-white text-gray-400 rounded-[1.25rem] border border-gray-100 hover:border-red-500/20 hover:text-red-500 active:scale-95 transition-all shadow-lg hover:shadow-xl group cursor-pointer"
                    title={t('storeDetail.report')}
                  >
                    <span className="material-symbols-outlined !text-[22px] md:!text-[26px] group-hover:rotate-12 transition-transform">flag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Work Hours Accordion Style */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5 transition-all hover:shadow-md">
              <div
                className="flex items-center justify-between cursor-pointer group/work"
                onClick={() => setIsWorkHoursExpanded(!isWorkHoursExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined !text-xl text-primary font-bold">schedule</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{t('storeDetail.workHours')}</h3>
                </div>
                <div className={`size-8 rounded-lg bg-gray-50 flex items-center justify-center transition-all ${isWorkHoursExpanded ? 'bg-primary/10 text-primary' : 'text-gray-400 group-hover/work:bg-gray-100'}`}>
                  <span className={`material-symbols-outlined !text-xl transition-transform duration-300 ${isWorkHoursExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </div>

              {isWorkHoursExpanded && (
                <div className="space-y-1.5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
                    const sch = store.workSchedules.find(s => {
                      if (typeof s.dayOfWeek === 'number') return s.dayOfWeek === dow;
                      const dayMap: Record<string, number> = {
                        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
                      };
                      if (dayMap[s.dayOfWeek] !== undefined) return dayMap[s.dayOfWeek] === dow;
                      const sInt = parseInt(s.dayOfWeek);
                      return !isNaN(sInt) && sInt === dow;
                    });
                    const isToday = new Date().getDay() === dow;
                    return (
                      <div key={dow} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${isToday ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-gray-50'}`}>
                        <span className={`text-sm ${isToday ? 'text-primary font-black' : 'text-gray-600 font-medium'}`}>{t(`common.days.${dow}`)}</span>
                        <div className="flex items-center gap-2">
                          {sch && (sch.isOpen24Hours || (sch.openTime && sch.closeTime)) ? (
                            <span className={`text-[13px] font-bold ${isToday ? 'text-gray-900' : 'text-gray-700'}`}>
                              {sch.isOpen24Hours ? t('cabinet.settings.open24h') : `${sch.openTime?.slice(0, 5)} - ${sch.closeTime?.slice(0, 5)}`}
                            </span>
                          ) : (
                            <span className="text-[13px] font-bold text-red-500">{t('cabinet.settings.closed')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact & Social Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-7 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <span className="material-symbols-outlined !text-xl text-blue-600 font-bold">info</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{t('footer.information')}</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group/item">
                  <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-all">
                    <span className="material-symbols-outlined !text-[22px]">location_on</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('storeDetail.address')}</p>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{store.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                      target="_blank"
                      className="text-[11px] font-black text-primary hover:text-primary/80 transition-colors mt-2 inline-flex items-center gap-1 uppercase tracking-wider"
                    >
                      {t('storeDetail.mapView')} <span className="material-symbols-outlined !text-[14px]">open_in_new</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group/item">
                  <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-green-50 group-hover/item:text-green-600 transition-all">
                    <span className="material-symbols-outlined !text-[22px]">call</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('auth.phoneNumber')}</p>
                    <div className="space-y-1.5 mt-1">
                      <a href={`tel:${store.contactNumber.replace(/\s+/g, '')}`} className="block text-base font-black text-gray-900 tracking-tight hover:text-primary transition-colors">{store.contactNumber}</a>
                      {store.contactNumber2 && <a href={`tel:${store.contactNumber2.replace(/\s+/g, '')}`} className="block text-base font-black text-gray-900 tracking-tight hover:text-primary transition-colors">{store.contactNumber2}</a>}
                      {store.contactNumber3 && <a href={`tel:${store.contactNumber3.replace(/\s+/g, '')}`} className="block text-base font-black text-gray-900 tracking-tight hover:text-primary transition-colors">{store.contactNumber3}</a>}
                    </div>
                  </div>
                </div>

                {store.website && (
                  <div className="flex items-start gap-4 group/item">
                    <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-all">
                      <span className="material-symbols-outlined !text-[22px]">language</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('cabinet.settings.website')}</p>
                      <a href={store.website.startsWith('http') ? store.website : `https://${store.website}`} target="_blank" className="text-sm font-bold text-primary hover:underline truncate block max-w-[180px]">
                        {store.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Socials Section */}
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-50">
                {(store.instagram || (store as any).Instagram || (store as any).instaGram) && (
                  <a href={`https://instagram.com/${((store.instagram || (store as any).Instagram || (store as any).instaGram) || '').replace('@', '')}`} target="_blank" className="size-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md">
                    <i className="fa-brands fa-instagram text-2xl"></i>
                  </a>
                )}
                {(store.tiktok || (store as any).TikTok || (store as any).tikTok) && (
                  <a
                    href={`https://tiktok.com/@${((store.tiktok || (store as any).TikTok || (store as any).tikTok) || '').replace('@', '')}`}
                    target="_blank"
                    className="size-12 rounded-2xl bg-black text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md"
                  >
                    <i className="fa-brands fa-tiktok text-2xl"></i>
                  </a>
                )}
                {(store.facebook || (store as any).Facebook || (store as any).faceBook) && (
                  <a href={`https://facebook.com/${((store.facebook || (store as any).Facebook || (store as any).faceBook) || '')}`} target="_blank" className="size-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md">
                    <i className="fa-brands fa-facebook text-2xl"></i>
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <span className="material-symbols-outlined !text-xl text-orange-600 font-bold">description</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('storeDetail.aboutStore')}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg font-medium">
                {language === 'ru' && store.descriptionRu ? store.descriptionRu : store.description}
              </p>
            </div>

            {/* Store Gallery Section */}
            {store.photos && store.photos.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <span className="material-symbols-outlined !text-xl text-purple-600 font-bold">collections</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('storeDetail.gallery')}</h2>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {store.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl bg-gray-50 overflow-hidden cursor-zoom-in transition-all hover:shadow-xl hover:scale-[1.02] border border-gray-100"
                      onClick={() => window.open(getImageUrl(photo), '_blank')}
                    >
                      <Image
                        src={getImageUrl(photo)}
                        alt={`${store.storeName} Gallery ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">fullscreen</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ads Section */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100 overflow-visible">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('product.storeAds')}</h2>
                  <p className="text-sm text-gray-400 font-medium">{t('storeDetail.allAdsFound', { count: filteredAds.length })}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Custom Ad Sort Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setIsSortDropdownOpen(!isSortDropdownOpen);
                      }}
                      className="h-12 pl-5 pr-12 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 outline-none hover:border-primary transition-all shadow-sm flex items-center justify-between min-w-[200px] cursor-pointer"
                    >
                      <span className="truncate">
                        {adSortOrder === 'newest' && t('cabinet.settings.new')}
                        {adSortOrder === 'oldest' && t('listings.sortByDate')}
                        {adSortOrder === 'price-asc' && t('listings.sortByCheap')}
                        {adSortOrder === 'price-desc' && t('listings.sortByExpensive')}
                      </span>
                      <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
                    </button>

                    {isSortDropdownOpen && (
                      <div className="absolute top-[calc(100%+8px)] right-0 w-full min-w-[200px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {[
                          { id: 'newest', label: t('cabinet.settings.new') },
                          { id: 'oldest', label: t('listings.sortByDate') },
                          { id: 'price-asc', label: t('listings.sortByCheap') },
                          { id: 'price-desc', label: t('listings.sortByExpensive') }
                        ].map(opt => (
                          <div
                            key={opt.id}
                            className={`px-5 py-3.5 text-sm font-semibold cursor-pointer transition-all ${adSortOrder === opt.id ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:pl-7'}`}
                            onClick={() => { setAdSortOrder(opt.id); setIsSortDropdownOpen(false); }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Local Search */}
                  <div className="relative group flex-1 md:flex-none">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors !text-[20px]">search</span>
                    <input
                      type="text"
                      placeholder={t('storeDetail.searchInStore')}
                      value={adSearchQuery}
                      onChange={(e) => setAdSearchQuery(e.target.value)}
                      className="h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none w-full md:w-64 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Category Pills Row */}
              {availableCategories.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2 mb-4">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`h-11 px-6 rounded-2xl whitespace-nowrap text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${selectedCategory === 'all'
                      ? 'bg-primary text-white shadow-primary/20 scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {t('storeDetail.allAds')} {ads.length}
                  </button>
                  {availableCategories.map(cat => {
                    const count = ads.filter(a => a.category?.name === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`h-11 px-6 rounded-2xl whitespace-nowrap text-sm font-bold transition-all shadow-sm cursor-pointer ${selectedCategory === cat
                          ? 'bg-primary text-white shadow-primary/20 scale-105'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {cat} <span className={selectedCategory === cat ? 'text-white/80' : 'text-gray-400'}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {filteredAds.length > 0 ? (
                <ProductGrid products={filteredAds} />
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('storeDetail.noAds')}</h3>
                  <p className="text-gray-500 mt-1 max-w-xs mx-auto">{t('storeDetail.noAdsDesc')}</p>
                  <button
                    onClick={() => { setAdSearchQuery(''); setActiveTab('all'); setSelectedCategory('all'); }}
                    className="mt-6 text-primary font-bold hover:underline cursor-pointer"
                  >
                    {t('storeDetail.clearFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={store.id}
        type="store"
      />

      {/* Mobile Sticky Action Bar */}
      <div
        className={`lg:hidden fixed left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-[110] flex gap-3 transition-all duration-300 ease-in-out ${isNavVisible
          ? 'bottom-[calc(54px+max(9px,env(safe-area-inset-bottom)))]'
          : 'bottom-0'
          }`}
      >
        <a
          href={`tel:${store.contactNumber.replace(/\s+/g, '')}`}
          className="flex-1 flex items-center justify-center gap-2 h-14 bg-[#22C55E] text-white rounded-2xl font-black uppercase text-sm shadow-[0_10px_25px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined !text-[20px]">call</span>
          {t('product.call')}
        </a>
        <button className="flex-1 flex items-center justify-center gap-2 h-14 bg-[#3B82F6] text-white rounded-2xl font-black uppercase text-sm shadow-[0_10px_25px_rgba(59,130,246,0.3)] active:scale-95 transition-all cursor-pointer">
          <span className="material-symbols-outlined !text-[20px]">chat</span>
          {t('product.sendMessage')}
        </button>
      </div>
    </main>
  );
}
