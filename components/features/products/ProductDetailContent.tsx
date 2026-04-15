'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { formatPrice, formatRelativeTime, getImageUrl, generateSlug } from '@/lib/utils';
import { adService } from '@/services/ad.service';
import { AdDetail } from '@/types/api';
import { Product } from '@/types';
import { ROUTES } from '@/constants';
import ProductGrid from '@/components/features/products/ProductGrid';
import PromoteAdModal from '@/components/features/cabinet/PromoteAdModal';
import ReportModal from '@/components/features/ReportModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

export default function ProductDetailContent({ id }: { id: string }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState<AdDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarVipProducts, setSimilarVipProducts] = useState<Product[]>([]);
  const [similarNormalProducts, setSimilarNormalProducts] = useState<Product[]>([]);
  const [storeAds, setStoreAds] = useState<Product[]>([]);
  const [isFollowingStore, setIsFollowingStore] = useState(false);
  const [isWorkHoursExpanded, setIsWorkHoursExpanded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [lightboxSwiper, setLightboxSwiper] = useState<SwiperType | null>(null);

  const formatBooleanValue = (name: string, value: string | boolean) => {
    const strVal = String(value).toLowerCase();
    if (strVal !== 'true' && strVal !== 'false') return value;

    const isTrue = strVal === 'true';
    const lowerName = name.toLowerCase();

    if (lowerName.includes('kredit') || lowerName.includes('barter') || lowerName.includes('çatdırılma') || lowerName.includes('zəmanət')) {
      return isTrue ? 'Var' : 'Yoxdur';
    }
    return isTrue ? 'Bəli' : 'Xeyir';
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await adService.getAdById(id);
        setProduct(data);
        setIsFavorite(data.isFavourite);
        setIsFollowingStore(data.isFollowingStore || false);
        // Increment view count when viewed
        adService.incrementViewCount(id).catch(err => console.error('Error incrementing view count:', err));

        // Fetch Store ads if it's a store
        if (data.isStore && data.storeId) {
          try {
            const { storeService } = await import('@/services/store.service');
            const ads = await storeService.getStoreAds(data.storeId);
            const transformed = (ads || []).filter((ad: any) => ad.id !== id).slice(0, 8).map((ad: any) => {
              const imageUrl = ad.image ? getImageUrl(ad.image) : null;
              return {
                id: ad.id.toString(),
                title: ad.title,
                slug: ad.slug,
                price: ad.price,
                currency: 'AZN',
                images: imageUrl ? [imageUrl] : [],
                category: { name: ad.categoryName || '', slug: '' },
                location: { city: ad.city || '' },
                createdAt: new Date(ad.createdDate),
                isStore: true,
                store: {
                  name: data.storeName || '',
                  logo: data.storeLogoUrl ? getImageUrl(data.storeLogoUrl) : undefined
                }
              } as any;
            });
            setStoreAds(transformed);
          } catch (err) {
            console.error('Error fetching store ads:', err);
          }
        }

        if (data.categoryId) {
          // Fetch VIP ads for the category
          adService.getVipAds({ categoryId: data.categoryId, pageNumber: 1, pageSize: 12 })
            .then(ads => {
              const transformed = (ads || []).filter(ad => ad.id !== id).slice(0, 4).map((ad: any) => {
                const imageUrl = ad.image ? getImageUrl(ad.image) : null;
                return {
                  id: ad.id.toString(),
                  title: ad.title,
                  slug: ad.slug,
                  price: ad.price,
                  currency: 'AZN',
                  images: imageUrl ? [imageUrl] : [],
                  category: { name: ad.category, slug: ad.categorySlug },
                  subCategory: ad.subCategorySlug ? { name: '', slug: ad.subCategorySlug } : undefined,
                  location: { city: ad.city ?? '' },
                  createdAt: new Date(ad.createdDate),
                  isFeatured: true,
                  isFavourite: ad.isFavourite,
                } as any;
              });
              setSimilarVipProducts(transformed);
            })
            .catch(err => console.error('Error fetching similar VIP ads:', err));

          // Fetch Normal ads for the category
          adService.getAllAds({ categoryId: data.categoryId, pageNumber: 1, pageSize: 10 })
            .then(res => {
              const ads = res.data || [];
              const filtered = ads.filter(ad => ad.id !== id && !ad.isVip).slice(0, 8);
              const transformed = filtered.map((ad: any) => {
                const imageUrl = ad.image ? getImageUrl(ad.image) : null;
                return {
                  id: ad.id.toString(),
                  title: ad.title,
                  slug: ad.slug,
                  price: ad.price,
                  currency: 'AZN',
                  images: imageUrl ? [imageUrl] : [],
                  category: { name: ad.category, slug: ad.categorySlug },
                  subCategory: ad.subCategorySlug ? { name: '', slug: ad.subCategorySlug } : undefined,
                  location: { city: ad.city ?? '' },
                  createdAt: new Date(ad.createdDate),
                  isPremium: ad.isPremium,
                  isFavourite: ad.isFavourite,
                } as any;
              });
              setSimilarNormalProducts(transformed);
            })
            .catch(err => console.error('Error fetching similar normal ads:', err));
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError('Elanı yükləyərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <p className="text-xl font-bold text-gray-800">{error || 'Elan tapılmadı'}</p>
        <Link href="/" className="text-primary hover:underline">Ana səhifəyə qayıt</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => getImageUrl(img))
    : ['/placeholder-product.jpg'];

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await adService.removeFromFavourites(product.id);
      } else {
        await adService.addToFavourites(product.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  const handleFollowStore = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }
    if (!product.storeId) return;
    try {
      const { storeService } = await import('@/services/store.service');
      await storeService.toggleFollowStore(product.storeId);
      setIsFollowingStore(!isFollowingStore);
    } catch (err) {
      console.error('Follow store error:', err);
    }
  };

  const getSchForDay = (d: number) => {
    if (!product || !product.storeWorkSchedules) return null;
    return product.storeWorkSchedules.find(ws => {
      if (typeof ws.dayOfWeek === 'number') return ws.dayOfWeek === d;
      const dayMap: Record<string, number> = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      if (dayMap[ws.dayOfWeek] !== undefined) return dayMap[ws.dayOfWeek] === d;
      const sInt = parseInt(ws.dayOfWeek);
      return !isNaN(sInt) && sInt === d;
    });
  };

  const getDayNameAz = (day: number) => {
    const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
    return days[day];
  };

  const getStoreStatus = () => {
    if (!product || !product.storeWorkSchedules || product.storeWorkSchedules.length === 0) return null;

    const now = new Date();
    const day = now.getDay();
    const currentSchedule = getSchForDay(day);

    if (!currentSchedule) {
      for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        const nextSch = getSchForDay(nextDay);
        if (nextSch && (nextSch.isOpen24Hours || nextSch.openTime)) {
          const openStr = nextSch.isOpen24Hours ? '24 saat' : `saat ${nextSch.openTime?.slice(0, 5)}-da`;
          return { isOpen: false, text: `Bağlıdır (${nextDay === (day + 1) % 7 ? 'sabah' : getDayNameAz(nextDay)} ${openStr} açılır)` };
        }
      }
      return { isOpen: false, text: 'Bağlıdır' };
    }

    if (currentSchedule.isOpen24Hours) return { isOpen: true, text: 'Açıqdır (24 saat)' };

    if (!currentSchedule.openTime || !currentSchedule.closeTime) {
      return { isOpen: false, text: 'Bağlıdır' };
    }

    const [nowH, nowM] = [now.getHours(), now.getMinutes()];
    const nowTotal = nowH * 60 + nowM;

    const [startH, startM] = currentSchedule.openTime.split(':').map(Number);
    const [endH, endM] = currentSchedule.closeTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (nowTotal >= startTotal && nowTotal < endTotal) {
      return { isOpen: true, text: `Açıqdır (saat ${currentSchedule.closeTime.slice(0, 5)}-da bağlanır)` };
    } else if (nowTotal < startTotal) {
      return { isOpen: false, text: `Bağlıdır (saat ${currentSchedule.openTime.slice(0, 5)}-da açılır)` };
    } else {
      for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        const nextSch = getSchForDay(nextDay);
        if (nextSch && (nextSch.isOpen24Hours || nextSch.openTime)) {
          const openStr = nextSch.isOpen24Hours ? '24 saat' : `saat ${nextSch.openTime?.slice(0, 5)}-da`;
          return { isOpen: false, text: `Bağlıdır (${nextDay === (day + 1) % 7 ? 'sabah' : getDayNameAz(nextDay)} ${openStr} açılır)` };
        }
      }
      return { isOpen: false, text: 'Bağlıdır' };
    }
  };

  const storeStatus = getStoreStatus();

  const isDatingAd = product?.category?.toLowerCase() === 'tanışlıq' ||
    product?.parentCategoryName?.toLowerCase() === 'tanışlıq' ||
    product?.subCategory?.toLowerCase() === 'tanışlıq';

  return (
    <main className="w-full bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        <div className="flex gap-4 lg:gap-6">
          {/* Left Banner */}
          <aside className="hidden xl:block w-48 2xl:w-64 flex-shrink-0">
            <div className="sticky top-24 pt-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 h-[600px] flex items-center justify-center border border-purple-200">
                <p className="text-sm text-gray-500 text-center">Reklam sahəsi</p>
              </div>
            </div>
          </aside>

          {/* Main Content Wrappers */}
          <div className="flex-1 min-w-0 py-5 sm:py-10">
            <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
              {/* Breadcrumb */}
              <div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Link className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors" href="/">Ana Səhifə</Link>
                  <span className="text-gray-400 text-sm font-medium leading-normal">/</span>
                  <Link
                    className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors"
                    href={`/elanlar/${product.parentCategorySlug}`}
                  >
                    {product.parentCategoryName}
                  </Link>
                  {product.childCategorySlug && product.childCategorySlug !== product.parentCategorySlug && (
                    <>
                      <span className="text-gray-400 text-sm font-medium leading-normal">/</span>
                      <Link
                        className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href={`/elanlar/${product.parentCategorySlug}/${product.childCategorySlug}`}
                      >
                        {product.category}
                      </Link>
                    </>
                  )}
                  {product.subCategory && (
                    <>
                      <span className="text-gray-400 text-sm font-medium leading-normal">/</span>
                      <Link
                        className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href={`${ROUTES.LISTINGS}?categoryId=${product.categoryId}${product.subCategoryId ? `&subCategoryId=${product.subCategoryId}` : ''}`}
                      >
                        {product.subCategory}
                      </Link>
                    </>
                  )}
                  {product.dynamicFields?.find(f => f.name === 'Marka') && (
                    <>
                      <span className="text-gray-400 text-sm font-medium leading-normal">/</span>
                      <Link
                        className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href={`${ROUTES.LISTINGS}?categoryId=${product.categoryId}${product.subCategoryId ? `&subCategoryId=${product.subCategoryId}` : ''}&p[${product.dynamicFields.find(f => f.name === 'Marka')!.categoryFieldId}]=${encodeURIComponent(product.dynamicFields.find(f => f.name === 'Marka')!.value as string)}`}
                      >
                        {product.dynamicFields.find(f => f.name === 'Marka')!.value}
                      </Link>
                    </>
                  )}
                  <span className="text-gray-400 text-sm font-medium leading-normal">/</span>
                  <span className="text-gray-900 text-sm font-semibold leading-normal truncate max-w-[150px] sm:max-w-[250px]">{product.title}</span>
                </div>
              </div>

              {/* Title Area */}
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-gray-900 text-2xl font-bold leading-tight">
                      {product.title}
                    </h1>
                    <div className="flex gap-2">
                      {product.isVip && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">VIP</span>
                      )}
                      {product.isPremium && (
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">PREMIUM</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Images & Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Image Gallery */}
                  <div className="space-y-3">
                    <div className="relative w-full aspect-[4/3] max-h-[500px] bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={images[activeImageIndex]}
                          alt="Background Blur"
                          fill
                          className="object-cover blur-2xl scale-110 opacity-30"
                        />
                      </div>

                      <Swiper
                        modules={[Navigation, Pagination, Thumbs]}
                        navigation={{
                          prevEl: '.swiper-button-prev-custom',
                          nextEl: '.swiper-button-next-custom',
                        }}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        onSlideChange={(swiper) => setActiveImageIndex(swiper.realIndex)}
                        className="h-full w-full z-10"
                        loop={images.length > 1}
                        spaceBetween={0}
                        initialSlide={0}
                      >
                        {images.map((img, idx) => (
                          <SwiperSlide key={idx}>
                            <div
                              className="relative w-full h-full cursor-zoom-in"
                              onClick={() => setIsLightboxOpen(true)}
                            >
                              <Image
                                src={img}
                                alt={`${product.title} - Image ${idx + 1}`}
                                fill
                                className="object-contain"
                                priority={idx === 0}
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                        {activeImageIndex + 1} / {images.length}
                      </div>

                      <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-lg shadow-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined !text-[20px]">fullscreen</span>
                      </button>

                      {images.length > 1 && (
                        <>
                          <button className="swiper-button-prev-custom absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-white/90 text-gray-800 rounded-full size-9 flex items-center justify-center hover:bg-white transition-all shadow-md opacity-0 group-hover:opacity-100">
                            <span className="material-symbols-outlined !text-[20px]">chevron_left</span>
                          </button>
                          <button className="swiper-button-next-custom absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-white/90 text-gray-800 rounded-full size-9 flex items-center justify-center hover:bg-white transition-all shadow-md opacity-0 group-hover:opacity-100">
                            <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
                          </button>
                        </>
                      )}
                    </div>

                    {images.length > 1 && (
                      <Swiper
                        onSwiper={setThumbsSwiper}
                        modules={[FreeMode, Thumbs]}
                        spaceBetween={8}
                        slidesPerView={7}
                        freeMode={true}
                        watchSlidesProgress={true}
                        className="thumbs-swiper"
                      >
                        {images.map((img, idx) => (
                          <SwiperSlide key={idx} className="!w-20">
                            <div className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all shadow-sm ${activeImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}>
                              <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                        <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                          <span className="text-[#8D94AD] text-[15px]">Şəhər</span>
                          <span className="text-[#212121] text-[15px] font-medium">{product.city || 'Göstərilməyib'}</span>
                        </div>
                        {(() => {
                          const NON_PRODUCT_CATEGORIES = [
                            'İş elanları', 'Vakansiyalar', 'İş axtarıram', 'Xidmətlər və biznes', 'Daşınmaz əmlak', 'Tanışlıq'
                          ];
                          const isNonProduct = NON_PRODUCT_CATEGORIES.some(cat =>
                            product.category?.toLowerCase().trim().includes(cat.toLowerCase()) ||
                            product.parentCategoryName?.toLowerCase().trim().includes(cat.toLowerCase())
                          );
                          if (isNonProduct) return null;
                          return (
                            <>
                              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                                <span className="text-[#8D94AD] text-[15px]">Vəziyyət</span>
                                <span className="text-[#3D78C8] text-[15px] cursor-pointer hover:underline">{product.isNew ? 'Yeni' : 'İşlənmiş'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                                <span className="text-[#8D94AD] text-[15px]">Çatdırılma</span>
                                <span className="text-[#212121] text-[15px] font-medium">{product.isDeliverable ? 'Var' : 'Yoxdur'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                                <span className="text-[#8D94AD] text-[15px]">Malın növü</span>
                                <span className="text-[#3D78C8] text-[15px] cursor-pointer hover:underline">{product.adType || 'Göstərilməyib'}</span>
                              </div>
                            </>
                          );
                        })()}
                        {product.dynamicFields?.map((field, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-100">
                            <span className="text-[#8D94AD] text-[15px]">{field.name}</span>
                            <span className="text-[#212121] text-[15px] font-medium min-w-0 max-w-[60%] text-right truncate">
                              {formatBooleanValue(field.name, field.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 space-y-4 border border-gray-100">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-gray-900 font-bold text-xl">Təsvir</h3>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-y-4 pt-6 border-t border-gray-50">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">tag</span>
                          <span>Elan №: <span className="text-gray-900 font-semibold">{product.id.slice(0, 8)}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Baxış sayı: <span className="text-gray-900 font-semibold">{product.viewCount}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">update</span>
                          <span>Yeniləndi: <span className="text-gray-900 font-semibold">{formatRelativeTime(product.createdDate)}</span></span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPromoteModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#e8effd] hover:bg-[#d8e4f9] text-[#4a7ecb] rounded-xl transition-all font-semibold active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined !text-[20px]">monitoring</span>
                        Reklam et
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Action Card */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col">
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between gap-4">
                          {!isDatingAd ? (
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Qiymət</p>
                              <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-1.5 whitespace-nowrap">
                                <span>{product.price.toLocaleString('az-AZ')}</span>
                                <span className="text-2xl">₼</span>
                              </h3>
                            </div>
                          ) : (
                            <div className="flex-1" /> // Spacer to keep buttons on the right
                          )}
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={handleFavoriteToggle}
                              className={`flex cursor-pointer items-center justify-center rounded-xl size-11 transition-all border shadow-sm ${isFavorite ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                              title="Seçilmişlərə əlavə et"
                            >
                              <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                            </button>
                            <button
                              onClick={() => setIsReportModalOpen(true)}
                              className="flex cursor-pointer items-center justify-center rounded-xl size-11 bg-gray-50 text-gray-400 border border-gray-100 hover:text-red-500 hover:border-red-100 transition-colors"
                              title="Şikayət et"
                            >
                              <span className="material-symbols-outlined !text-2xl">flag</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {!isDatingAd && <div className="h-px bg-gray-50 mx-6" />}

                      {/* Seller Info */}
                      <div className={`p-6 ${isDatingAd ? 'pt-6' : 'pt-5'} space-y-6`}>
                        {product.isStore ? (
                          <div className="space-y-5">
                            <Link href={ROUTES.STORE_DETAIL(product.storeSlug || '')} className="flex items-center gap-4 group">
                              <div className="relative shrink-0">
                                {product.storeLogoUrl ? (
                                  <div className="size-16 rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center p-1.5">
                                    <Image src={getImageUrl(product.storeLogoUrl)} alt={product.storeName || ''} width={64} height={64} className="object-contain" />
                                  </div>
                                ) : (
                                  <div className="bg-primary/5 rounded-2xl size-16 flex items-center justify-center text-primary border border-primary/10">
                                    <span className="material-symbols-outlined !text-3xl font-bold">storefront</span>
                                  </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${storeStatus?.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-gray-900 font-black text-lg leading-tight truncate group-hover:text-primary transition-colors">{product.storeName}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-primary font-black text-[9px] uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">Mağaza</span>
                                  <span className="text-[#8D94AD] text-[10px] font-black uppercase tracking-wider">{product.storeAdCount || 0} elan</span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center gap-2 text-[10px] font-black text-white bg-blue-600 px-4 py-2 rounded-xl w-full shadow-lg shadow-blue-600/20">
                              <span className="material-symbols-outlined !text-[16px]">verified</span>
                              <span className="uppercase tracking-wider">{product.storeHeadline || 'Rəsmi Mağaza'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 py-1">
                            <div className="bg-primary/5 rounded-full size-16 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                              <span className="text-2xl font-black">{product.fullName?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-900 font-black text-lg leading-tight truncate">{product.fullName}</p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-bold">
                                <span className="material-symbols-outlined !text-[14px]">verified_user</span>
                                <span>Doğrulanmış</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Contact */}
                        <div className="space-y-3">
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-xl text-primary shadow-sm border border-gray-100">
                                  <span className="material-symbols-outlined !text-[20px]">call</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Telefon</span>
                              </div>
                              {!showFullPhone && (
                                <button onClick={() => setShowFullPhone(true)} className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-primary/90 shadow-md">
                                  Göstər
                                </button>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5 min-h-[1.5rem] justify-center">
                              <span className="text-gray-900 font-black text-xl tracking-tight leading-none overflow-hidden">
                                {showFullPhone
                                  ? product.phoneNumber
                                  : product.phoneNumber.replace(/(\+994|0)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 *** ** **')}
                              </span>
                              {showFullPhone && (product.contactNumber2 || product.contactNumber3) && (
                                <div className="flex flex-col gap-1.5 mt-1 border-t border-gray-200/50 pt-2 animate-in fade-in duration-300">
                                  {product.contactNumber2 && <span className="text-gray-900 font-extrabold text-lg tracking-tight leading-none">{product.contactNumber2}</span>}
                                  {product.contactNumber3 && <span className="text-gray-900 font-extrabold text-lg tracking-tight leading-none">{product.contactNumber3}</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <button className="w-full flex items-center justify-center rounded-xl h-12 bg-primary text-white text-[13px] font-black uppercase gap-2.5 hover:bg-primary/90 shadow-lg shadow-primary/20">
                              <span className="material-symbols-outlined !text-[18px]">chat</span>
                              <span>Mesaj yaz</span>
                            </button>
                            <a href={`https://wa.me/${product.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center rounded-xl h-12 bg-[#25D366] text-white text-[13px] font-black uppercase gap-2.5 hover:bg-[#20ba59] shadow-lg shadow-green-500/20">
                              <i className="fa-brands fa-whatsapp text-xl"></i>
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Global Safety Section - Outside conditional, at bottom of card */}
                      <div className="p-6 pt-0 border-t border-gray-50/50">
                        {product.isStore && (
                          <div className="py-4 space-y-4">
                            {(product.storeAddress || (product.storeWorkSchedules && product.storeWorkSchedules.length > 0)) && (
                              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                                {product.storeWorkSchedules && product.storeWorkSchedules.length > 0 && (
                                  <div className="p-4">
                                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsWorkHoursExpanded(!isWorkHoursExpanded)}>
                                      <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined !text-[20px] ${storeStatus?.isOpen ? 'text-green-500' : 'text-gray-400'}`}>schedule</span>
                                        <p className={`text-[12px] font-black uppercase ${storeStatus?.isOpen ? 'text-green-600' : 'text-red-500'}`}>{storeStatus?.text}</p>
                                      </div>
                                      <span className={`material-symbols-outlined !text-[20px] text-gray-400 transition-transform ${isWorkHoursExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                    </div>

                                    {isWorkHoursExpanded && (
                                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2.5 animate-in slide-in-from-top-1 duration-200">
                                        {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
                                          const sch = getSchForDay(dayNum);
                                          return (
                                            <div key={dayNum} className={`flex justify-between items-center ${new Date().getDay() === dayNum ? 'bg-primary/5 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                                              <span className={`text-[11px] font-black uppercase tracking-tight ${new Date().getDay() === dayNum ? 'text-primary' : 'text-gray-400'}`}>
                                                {getDayNameAz(dayNum)}
                                              </span>
                                              <span className={`text-[11px] font-black ${new Date().getDay() === dayNum ? 'text-primary' : 'text-gray-900'}`}>
                                                {sch ? (sch.isOpen24Hours ? '24 saat' : (sch.openTime && sch.closeTime ? `${sch.openTime.slice(0, 5)} - ${sch.closeTime.slice(0, 5)}` : 'Bağlıdır')) : 'Bağlıdır'}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {product.storeAddress && (
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.storeAddress)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 p-4 hover:bg-gray-100 transition-colors group"
                                  >
                                    <span className="material-symbols-outlined !text-[22px] text-primary/70 mt-0.5">location_on</span>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mağaza adresi</span>
                                      <span className="text-[12px] font-bold text-gray-700 leading-snug truncate group-hover:text-primary transition-colors">
                                        {product.storeAddress}
                                      </span>
                                    </div>
                                  </a>
                                )}
                              </div>
                            )}

                            <Link href={ROUTES.STORE_DETAIL(product.storeSlug || '')} className="w-full h-12 rounded-xl bg-primary text-white text-[12px] font-black uppercase flex items-center justify-center gap-2 shadow-md">
                              Mağazaya keç <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                            </Link>
                            <button
                              onClick={handleFollowStore}
                              className={`w-full h-11 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2.5 ${isFollowingStore
                                ? 'bg-gray-50 text-gray-400 border-gray-200'
                                : 'bg-white text-primary border-primary/20 hover:bg-primary/5'
                                }`}
                            >
                              <span className="material-symbols-outlined !text-[20px]">
                                {isFollowingStore ? 'person_remove' : 'person_add'}
                              </span>
                              {isFollowingStore ? 'İzləməyi burax' : 'İzləyici ol'}
                            </button>
                          </div>
                        )}
                        {!isDatingAd && (
                          <div className="mt-4 bg-[#FFF9E6]/50 rounded-2xl p-5 border border-[#FFE7A3]/50 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2 text-[#856404]">
                              <span className="material-symbols-outlined !text-[18px]">security</span>
                              <h4 className="font-black text-[12px] uppercase tracking-wider">Diqqət:</h4>
                            </div>
                            <p className="text-[11px] text-[#856404] leading-relaxed font-bold">Qiymət çox aşağıdırsa ehtiyatlı olun və şübhəli elanları report edin.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Ads */}
              <div className="mt-10 space-y-10">
                {product.isStore && storeAds.length > 0 && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center px-2">
                      <h2 className="text-xl font-bold text-gray-900">Mağazanın digər elanları</h2>
                      <Link href={ROUTES.STORE_DETAIL(product.storeSlug || '')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">Hamısını göstər <span className="material-symbols-outlined !text-[18px]">chevron_right</span></Link>
                    </div>
                    <ProductGrid products={storeAds} title="" emptyMessage="" />
                  </div>
                )}
                {(similarVipProducts.length > 0 || similarNormalProducts.length > 0) && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center px-2">
                      <h2 className="text-xl font-bold text-gray-900">Bənzər elanlar</h2>
                    </div>
                    {similarVipProducts.length > 0 && <ProductGrid products={similarVipProducts} title="" emptyMessage="" />}
                    {similarNormalProducts.length > 0 && <ProductGrid products={similarNormalProducts} title="" emptyMessage="" />}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Banner */}
          <aside className="hidden xl:block w-48 2xl:w-64 flex-shrink-0">
            <div className="sticky top-24 pt-4">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 h-[600px] flex items-center justify-center border border-blue-200">
                <p className="text-sm text-gray-500 text-center">Reklam sahəsi</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between p-4 text-white border-b border-white/10">
            <div className="flex flex-col">
              <h4 className="font-bold text-lg truncate max-w-[300px] md:max-w-xl">{product.title}</h4>
              <p className="text-primary font-bold">{formatPrice(product.price)}</p>
            </div>
            <button onClick={() => setIsLightboxOpen(false)} className="size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><span className="material-symbols-outlined !text-[32px]">close</span></button>
          </div>
          <div className="flex-1 relative flex items-center justify-center p-4">
            <button className="swiper-button-prev-modal absolute left-4 z-10 size-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><span className="material-symbols-outlined !text-[40px]">chevron_left</span></button>
            <div className="w-full h-full">
              <Swiper onSwiper={setLightboxSwiper} modules={[Navigation, Pagination, FreeMode]} navigation={{ prevEl: '.swiper-button-prev-modal', nextEl: '.swiper-button-next-modal' }} initialSlide={activeImageIndex} onSlideChange={(s) => setActiveImageIndex(s.realIndex)} className="w-full h-full" spaceBetween={30}>
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center">
                    <div className="relative w-full h-full"><Image src={img} alt={`Modal view ${idx + 1}`} fill className="object-contain" /></div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <button className="swiper-button-next-modal absolute right-4 z-10 size-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><span className="material-symbols-outlined !text-[40px]">chevron_right</span></button>
          </div>
          <div className="p-6 bg-black/40 backdrop-blur-xl flex justify-center overflow-x-auto">
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <div key={idx} onClick={() => { setActiveImageIndex(idx); lightboxSwiper?.slideTo(idx); }} className={`relative size-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === idx ? 'border-primary' : 'border-transparent opacity-50'}`}>
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {product && (
        <PromoteAdModal isOpen={isPromoteModalOpen} onClose={() => setIsPromoteModalOpen(false)} adId={product.id} />
      )}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={id}
        type="ad"
      />
    </main>
  );
}
