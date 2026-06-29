'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';

export default function StoreDetailClient({ initialStore, slug }: { initialStore: StoreDetail; slug: string }) {
  const [store, setStore] = useState<StoreDetail | null>(initialStore || null);
  const [ads, setAds] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(!initialStore);
  const [activeTab, setActiveTab] = useState('all');
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [adSortOrder, setAdSortOrder] = useState('newest');
  const [isFollowing, setIsFollowing] = useState(initialStore ? !!initialStore.isFollowing : false);
  const [followerCount, setFollowerCount] = useState(initialStore ? initialStore.followerCount || 0 : 0);
  const [isWorkHoursExpanded, setIsWorkHoursExpanded] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { t, language } = useLanguage();
  const router = useRouter();

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
        let data = store;
        if (!data) {
          setIsLoading(true);
          const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
          try {
            if (isGuid) {
              try {
                data = await storeService.getStore(slug);
              } catch (err) {
                data = await storeService.getStoreBySlug(slug);
              }
            } else {
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
        }

        // Load ads
        const storeAds = await storeService.getStoreAds(data.id);
        const mappedAds: Product[] = storeAds.map((ad: StoreAdItem) => ({
          id: ad.id,
          title: ad.title,
          pinCode: ad.pinCode,
          price: ad.price,
          currency: '₼',
          images: ad.image ? [getImageUrl(ad.image)] : [],
          createdAt: new Date(ad.createdDate),
          parentCategorySlug: ad.parentCategorySlug,
          childCategorySlug: ad.childCategorySlug,
          category: { name: (language === 'ru' && ad.categoryNameRu ? ad.categoryNameRu : ad.categoryName) || '', slug: ad.parentCategorySlug || '' },
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

        // Increment view count
        storeService.incrementStoreView(data.slug || data.id).catch(console.error);
      } catch (err) {
        console.error('Error loading store:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) loadStore();
  }, [slug, language, store]);

  const handleToggleFollow = async () => {
    if (!store) return;
    try {
      await storeService.toggleFollowStore(store.id);
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleSendMessage = () => {
    if (!store?.id) return;
    router.push(`/cabinet/messages?sellerId=${store.id}`);
  };

  // Drag-to-scroll gallery handlers for PC
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setHasMoved(false);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(x - startX) > 5) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error(t('product.shareError'));
        }
      }
    } else {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(url);
          toast.success(t('product.linkCopied'));
        } catch (error) {
          console.error('Error copying to clipboard:', error);
        }
      }
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
        if (dayMap[ws.dayOfWeek] !== undefined) return dayMap[ws.dayOfWeek] === d;
        const sInt = parseInt(ws.dayOfWeek);
        return !isNaN(sInt) && sInt === d;
      });
    };

    const currentSchedule = getSchForDay(day);

    if (!currentSchedule) {
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
      {/* Cover and Profile Header Section */}
      <div className="bg-white border-b border-gray-200/60 shadow-sm mb-8">
        <div className="h-44 md:h-64 w-full relative bg-gray-200 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-10">
          <div className="pb-6">
            {/* Logo and Branding Row */}
            <div className="flex items-center gap-4 md:gap-5">
              {/* Logo Section */}
              <div className="relative group shrink-0 -mt-10 md:-mt-[72px] z-10">
                <div className="size-20 md:size-36 rounded-xl border-4 border-white bg-white shadow-md relative overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                  {store.storeLogoUrl ? (
                    <Image
                      src={getImageUrl(store.storeLogoUrl)}
                      alt={store.storeName}
                      fill
                      className="object-cover p-1 md:p-2"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-3xl md:text-5xl text-gray-200">store</span>
                  )}
                </div>
                <div className={`absolute bottom-0.5 right-0.5 md:bottom-1 md:right-1 size-3 md:size-4 rounded-full border-2 border-white shadow-md ${storeStatus?.isOpen ? 'bg-green-500' : 'bg-red-500'} z-10`} />
              </div>

              {/* Branding & Stats Info Section next to Logo */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                    {store.storeName}
                  </h1>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[11px] font-semibold select-none">
                    <span className="material-symbols-outlined text-blue-600 !text-[14px]">verified</span>
                    <span>{t('storeDetail.officialStore')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500 font-medium mt-1">
                  <span>{store.adCount || 0} {t('shops.ads')}</span>
                  <span className="text-gray-300">•</span>
                  <span>{store.viewCount || 0} {t('shops.views')}</span>
                  <span className="text-gray-300">•</span>
                  <span>{followerCount} {t('storeDetail.followers')}</span>
                </div>
              </div>
            </div>

            {/* Subtitle, Details & Actions (Flex layout below logo/branding row) */}
            <div className="mt-4 md:mt-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="space-y-3 flex-1 min-w-0">
                {((language === 'ru' ? store.headlineRu : store.headline) || store.storeName !== store.headline) && (
                  <p className="text-sm md:text-base font-normal text-gray-600 leading-relaxed max-w-3xl">
                    {(language === 'ru' ? store.headlineRu : store.headline) || t('storeDetail.defaultHeadline')}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-gray-400 !text-[18px]">location_on</span>
                    <span>{language === 'ru' && store.cityNameRu ? store.cityNameRu : (store.cityName || store.address?.split(',')[0])}</span>
                  </div>
                  {storeStatus && (
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${storeStatus.isOpen ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                      <span className={storeStatus.isOpen ? 'text-green-600' : 'text-red-500'}>
                        {storeStatus.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons on the Right */}
              <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-end w-full lg:w-auto justify-start lg:justify-end mt-2 lg:mt-0">
                <button
                  onClick={handleToggleFollow}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 h-10 md:h-11 rounded-xl transition-all active:scale-95 font-semibold text-sm cursor-pointer lg:min-w-[140px] ${isFollowing
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-primary text-white hover:bg-primary/95 shadow-sm shadow-primary/10 hover:scale-[1.01]'
                    }`}
                >
                  <span className="material-symbols-outlined !text-[18px] md:!text-[20px]">
                    {isFollowing ? 'person_remove' : 'person_add'}
                  </span>
                  {isFollowing ? t('storeDetail.followed') : t('storeDetail.followStore')}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center size-10 md:size-11 bg-white text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-primary hover:border-primary/30 active:scale-95 transition-all shadow-sm group cursor-pointer"
                    title={t('product.share')}
                  >
                    <span className="material-symbols-outlined !text-[18px] md:!text-[20px] group-hover:rotate-6 transition-transform">share</span>
                  </button>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center justify-center size-10 md:size-11 bg-white text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all shadow-sm group cursor-pointer"
                    title={t('storeDetail.report')}
                  >
                    <span className="material-symbols-outlined !text-[18px] md:!text-[20px] group-hover:rotate-6 transition-transform">flag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/60 space-y-4 transition-all hover:shadow-md">
              <div
                className="flex items-center justify-between cursor-pointer group/work pb-1"
                onClick={() => setIsWorkHoursExpanded(!isWorkHoursExpanded)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-gray-400 !text-xl">schedule</span>
                  <h3 className="font-semibold text-gray-800 text-base">{t('storeDetail.workHours')}</h3>
                </div>
                <div className={`size-7 rounded-lg bg-gray-50 flex items-center justify-center transition-all ${isWorkHoursExpanded ? 'bg-primary/10 text-primary' : 'text-gray-400 group-hover/work:bg-gray-100'}`}>
                  <span className={`material-symbols-outlined !text-lg transition-transform duration-300 ${isWorkHoursExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </div>

              {isWorkHoursExpanded && (
                <div className="space-y-1 pt-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
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
                      <div key={dow} className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${isToday ? 'bg-primary/5 ring-1 ring-primary/10' : 'hover:bg-gray-50'}`}>
                        <span className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-gray-500 font-medium'}`}>{t(`common.days.${dow}`)}</span>
                        <div className="flex items-center gap-2">
                          {sch && (sch.isOpen24Hours || (sch.openTime && sch.closeTime)) ? (
                            <span className={`text-[12px] font-semibold ${isToday ? 'text-gray-900' : 'text-gray-600'}`}>
                              {sch.isOpen24Hours ? t('cabinet.settings.open24h') : `${sch.openTime?.slice(0, 5)} - ${sch.closeTime?.slice(0, 5)}`}
                            </span>
                          ) : (
                            <span className="text-[12px] font-semibold text-red-500">{t('cabinet.settings.closed')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/60 space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <span className="material-symbols-outlined text-gray-400 !text-xl">info</span>
                <h3 className="font-semibold text-gray-800 text-base">{t('footer.information')}</h3>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 !text-[20px] mt-0.5 shrink-0">location_on</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{t('storeDetail.address')}</p>
                    <p className="text-xs font-medium text-gray-700 leading-normal">{store.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                      target="_blank"
                      className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors mt-1 inline-flex items-center gap-0.5 uppercase tracking-wider"
                    >
                      {t('storeDetail.mapView')} <span className="material-symbols-outlined !text-[12px]">open_in_new</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 !text-[20px] mt-0.5 shrink-0">call</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{t('auth.phoneNumber')}</p>
                    <div className="space-y-1 mt-0.5">
                      <a href={`tel:${store.contactNumber.replace(/\s+/g, '')}`} className="block text-sm font-semibold text-gray-800 hover:text-primary transition-colors">{store.contactNumber}</a>
                      {store.contactNumber2 && <a href={`tel:${store.contactNumber2.replace(/\s+/g, '')}`} className="block text-sm font-semibold text-gray-800 hover:text-primary transition-colors">{store.contactNumber2}</a>}
                      {store.contactNumber3 && <a href={`tel:${store.contactNumber3.replace(/\s+/g, '')}`} className="block text-sm font-semibold text-gray-800 hover:text-primary transition-colors">{store.contactNumber3}</a>}
                    </div>
                  </div>
                </div>

                {store.website && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400 !text-[20px] mt-0.5 shrink-0">language</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{t('cabinet.settings.website')}</p>
                      <a href={store.website.startsWith('http') ? store.website : `https://${store.website}`} target="_blank" className="text-xs font-semibold text-primary hover:underline truncate block">
                        {store.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {(store.instagram || (store as any).Instagram || (store as any).instaGram || store.tiktok || (store as any).TikTok || (store as any).tikTok || store.facebook || (store as any).Facebook || (store as any).faceBook) && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                  {(store.instagram || (store as any).Instagram || (store as any).instaGram) && (
                    <a href={`https://instagram.com/${((store.instagram || (store as any).Instagram || (store as any).instaGram) || '').replace('@', '')}`} target="_blank" className="size-9 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm">
                      <i className="fa-brands fa-instagram text-base"></i>
                    </a>
                  )}
                  {(store.tiktok || (store as any).TikTok || (store as any).tikTok) && (
                    <a
                      href={`https://tiktok.com/@${((store.tiktok || (store as any).TikTok || (store as any).tikTok) || '').replace('@', '')}`}
                      target="_blank"
                      className="size-9 rounded-xl bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                      <i className="fa-brands fa-tiktok text-base"></i>
                    </a>
                  )}
                  {(store.facebook || (store as any).Facebook || (store as any).faceBook) && (
                    <a href={`https://facebook.com/${((store.facebook || (store as any).Facebook || (store as any).faceBook) || '')}`} target="_blank" className="size-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm">
                      <i className="fa-brands fa-facebook text-base"></i>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 transition-all hover:shadow-md">
              <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
                <span className="material-symbols-outlined text-gray-400 !text-xl">description</span>
                <h2 className="text-base font-semibold text-gray-800">{t('storeDetail.aboutStore')}</h2>
              </div>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {language === 'ru' && store.descriptionRu ? store.descriptionRu : store.description}
              </p>
            </div>

            {store.photos && store.photos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 transition-all hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
                  <span className="material-symbols-outlined text-gray-400 !text-xl">collections</span>
                  <h2 className="text-base font-semibold text-gray-800">{t('storeDetail.gallery')}</h2>
                </div>

                <div
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className="flex overflow-x-auto flex-nowrap scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 pb-2 select-none cursor-grab active:cursor-grabbing"
                >
                  {store.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative flex-shrink-0 w-28 md:w-36 aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden cursor-zoom-in transition-all hover:shadow-md hover:scale-[1.01] border border-gray-100"
                      onClick={(e) => {
                        if (hasMoved) {
                          e.preventDefault();
                          return;
                        }
                        window.open(getImageUrl(photo), '_blank');
                      }}
                    >
                      <Image
                        src={getImageUrl(photo)}
                        alt={`${store.storeName} Gallery ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 !text-lg">fullscreen</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 overflow-visible">
                <div className="space-y-0.5">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 tracking-tight">{t('product.storeAds')}</h2>
                  <p className="text-xs text-gray-400 font-medium">{t('storeDetail.allAdsFound', { count: filteredAds.length })}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setIsSortDropdownOpen(!isSortDropdownOpen);
                      }}
                      className="h-10 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 outline-none hover:border-primary transition-all shadow-sm flex items-center justify-between min-w-[170px] cursor-pointer"
                    >
                      <span className="truncate">
                        {adSortOrder === 'newest' && t('cabinet.settings.new')}
                        {adSortOrder === 'oldest' && t('listings.sortByDate')}
                        {adSortOrder === 'price-asc' && t('listings.sortByCheap')}
                        {adSortOrder === 'price-desc' && t('listings.sortByExpensive')}
                      </span>
                      <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-transform !text-[18px] ${isSortDropdownOpen ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
                    </button>

                    {isSortDropdownOpen && (
                      <div className="absolute top-[calc(100%+6px)] right-0 w-full min-w-[170px] bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-gray-100 z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        {[
                          { id: 'newest', label: t('cabinet.settings.new') },
                          { id: 'oldest', label: t('listings.sortByDate') },
                          { id: 'price-asc', label: t('listings.sortByCheap') },
                          { id: 'price-desc', label: t('listings.sortByExpensive') }
                        ].map(opt => (
                          <div
                            key={opt.id}
                            className={`px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all ${adSortOrder === opt.id ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'}`}
                            onClick={() => { setAdSortOrder(opt.id); setIsSortDropdownOpen(false); }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative group flex-1 md:flex-none">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors !text-[18px]">search</span>
                    <input
                      type="text"
                      placeholder={t('storeDetail.searchInStore')}
                      value={adSearchQuery}
                      onChange={(e) => setAdSearchQuery(e.target.value)}
                      className="h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:border-primary focus:ring-2 focus:ring-primary/5 transition-all outline-none w-full md:w-56 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {availableCategories.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 mb-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`h-9 px-4 rounded-xl whitespace-nowrap text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${selectedCategory === 'all'
                      ? 'bg-primary text-white shadow-sm shadow-primary/10'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/60'
                      }`}
                  >
                    {t('storeDetail.allAds')} <span className={selectedCategory === 'all' ? 'text-white/80' : 'text-gray-400'}>{ads.length}</span>
                  </button>
                  {availableCategories.map(cat => {
                    const count = ads.filter(a => a.category?.name === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`h-9 px-4 rounded-xl whitespace-nowrap text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat
                          ? 'bg-primary text-white shadow-sm shadow-primary/10'
                          : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/60'
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
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-3xl text-gray-300">search_off</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">{t('storeDetail.noAds')}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 max-w-xs mx-auto">{t('storeDetail.noAdsDesc')}</p>
                  <button
                    onClick={() => { setAdSearchQuery(''); setActiveTab('all'); setSelectedCategory('all'); }}
                    className="mt-4 text-xs text-primary font-semibold hover:underline cursor-pointer"
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

      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-[110] flex gap-3"
      >
        <button
          onClick={handleToggleFollow}
          className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold uppercase text-xs active:scale-95 transition-all cursor-pointer ${isFollowing
            ? 'bg-gray-100 text-gray-500 shadow-none'
            : 'bg-primary text-white shadow-md shadow-primary/10'
            }`}
        >
          <span className="material-symbols-outlined !text-[18px]">
            {isFollowing ? 'person_remove' : 'person_add'}
          </span>
          {isFollowing ? t('storeDetail.followed') : t('storeDetail.followStore')}
        </button>
        <a
          href={`tel:${store.contactNumber.replace(/\s+/g, '')}`}
          className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#22C55E] text-white rounded-xl font-semibold uppercase text-xs shadow-md shadow-green-500/10 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined !text-[18px]">call</span>
          {t('product.call')}
        </a>
      </div>
    </main>
  );
}
