'use client';

import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { formatPrice, formatRelativeTime, getImageUrl } from '@/lib/utils';
import { adService } from '@/services/ad.service';
import { AdDetail } from '@/types/api';
import { Product } from '@/types';
import { ROUTES } from '@/constants';
import ProductGrid from '@/components/features/products/ProductGrid';
import PromoteAdModal from '@/components/features/cabinet/PromoteAdModal';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const [product, setProduct] = useState<AdDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarVipProducts, setSimilarVipProducts] = useState<Product[]>([]);
  const [similarNormalProducts, setSimilarNormalProducts] = useState<Product[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  const formatBooleanValue = (name: string, value: string | boolean) => {
    const strVal = String(value).toLowerCase();
    if (strVal !== 'true' && strVal !== 'false') return value;

    const isTrue = strVal === 'true';
    const lowerName = name.toLowerCase();

    // Tap.az style context-aware wording for booleans
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
        // Increment view count when viewed
        adService.incrementViewCount(id).catch(err => console.error('Error incrementing view count:', err));

        if (data.categoryId) {
          // Fetch VIP ads for the category
          adService.getVipAds({ categoryId: data.categoryId, pageNumber: 1, pageSize: 12 })
            .then(ads => {
              const transformed = (ads || []).filter(ad => ad.id !== id).slice(0, 4).map((ad: any) => {
                const imageUrl = ad.image ? getImageUrl(ad.image) : null;
                return {
                  id: ad.id.toString(),
                  title: ad.title,
                  price: ad.price,
                  currency: 'AZN',
                  images: imageUrl ? [imageUrl] : [],
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
                  price: ad.price,
                  currency: 'AZN',
                  images: imageUrl ? [imageUrl] : [],
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

    fetchProduct();
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
        <a href="/" className="text-primary hover:underline">Ana səhifəyə qayıt</a>
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
      // If not logged in redirect or show alert
    }
  };

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

          {/* Main Content */}
          <div className="flex-1 min-w-0 py-5 sm:py-10">
            <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
              {/* Breadcrumb */}
              <div>
                <div className="flex flex-wrap gap-2">
                  <a className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors" href="/">Ana Səhifə</a>
                  <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
                  <a
                    className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors"
                    href={`${ROUTES.LISTINGS}?categoryId=${product.categoryId}`}
                  >
                    {product.category || 'Bütün elanlar'}
                  </a>
                  {product.subCategory && (
                    <>
                      <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
                      <a
                        className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href={`${ROUTES.LISTINGS}?categoryId=${product.categoryId}&subCategoryId=${product.subCategoryId}`}
                      >
                        {product.subCategory}
                      </a>
                    </>
                  )}
                  {/* Brand and Model from Dynamic Fields */}
                  {product.dynamicFields?.find(f => f.name === 'Marka') && (
                    <>
                      <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
                      <a
                        className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href={`${ROUTES.LISTINGS}?categoryId=${product.categoryId}${product.subCategoryId ? `&subCategoryId=${product.subCategoryId}` : ''}&p[${product.dynamicFields.find(f => f.name === 'Marka')!.categoryFieldId}]=${encodeURIComponent(product.dynamicFields.find(f => f.name === 'Marka')!.value as string)}`}
                      >
                        {product.dynamicFields.find(f => f.name === 'Marka')!.value}
                      </a>
                    </>
                  )}
                  <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
                  <span className="text-gray-900 text-sm font-medium leading-normal truncate max-w-[200px]">{product.title}</span>
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
                    {/* Main Swiper */}
                    <div className="relative w-full aspect-[4/3] max-h-[500px] bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                      {/* Blurred Background Effect (Letterboxing) */}
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

                      {/* Image Counter Overlay */}
                      <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                        {activeImageIndex + 1} / {images.length}
                      </div>

                      {/* Fullscreen Icon Overlay */}
                      <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-lg shadow-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined !text-[20px]">fullscreen</span>
                      </button>

                      {/* Custom Navigation Arrows */}
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

                    {/* Thumbnail Swiper */}
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

                  {/* Product Specifications & Dynamic Fields */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                        {/* Static Fields */}
                        <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                          <span className="text-[#8D94AD] text-[15px]">Şəhər</span>
                          <span className="text-[#212121] text-[15px] font-medium">{product.city || 'Göstərilməyib'}</span>
                        </div>
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

                        {/* Dynamic Fields */}
                        {product.dynamicFields && product.dynamicFields.map((field, idx) => (
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

                {/* Right Column - Price, Seller & Contact */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    {/* Price Box */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#8D94AD] mb-1">Qiymət</p>
                          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {formatPrice(product.price)}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleFavoriteToggle}
                            className={`flex cursor-pointer items-center justify-center overflow-hidden rounded-xl size-12 transition-all shadow-sm ${isFavorite
                              ? 'bg-red-50 text-red-500 border border-red-100'
                              : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                              }`}
                          >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                              favorite
                            </span>
                          </button>
                          <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl size-12 bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all shadow-sm">
                            <span className="material-symbols-outlined">flag</span>
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 w-full"></div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 rounded-full size-14 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                          <span className="text-2xl font-black">
                            {product.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 font-bold text-lg truncate">{product.fullName}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-xs text-green-500">verified_user</span>
                            <span>Doğrulanmış istifadəçi</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Options */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <span className="material-symbols-outlined">call</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Telefon nömrəsi</span>
                            <span className="text-gray-900 font-bold text-lg">
                              {showFullPhone
                                ? product.phoneNumber
                                : product.phoneNumber.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 ** **')}
                            </span>
                          </div>
                          {!showFullPhone && (
                            <button
                              onClick={() => setShowFullPhone(true)}
                              className="ml-auto bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                            >
                              Göstər
                            </button>
                          )}
                        </div>

                        <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-primary text-white text-[15px] font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 active:scale-[0.98]">
                          <span className="material-symbols-outlined !text-[20px]">chat</span>
                          <span className="truncate">Mesaj yaz</span>
                        </button>

                        <a
                          href={`https://wa.me/${product.phoneNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#25D366] text-white text-[15px] font-bold leading-normal gap-2 hover:bg-[#20ba59] transition-all shadow-lg hover:shadow-green-500/30 active:scale-[0.98]"
                        >
                          <i className="fa-brands fa-whatsapp text-2xl"></i>
                          <span className="truncate">WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Safety Tips */}
                    <div className="bg-[#FFF9E6] rounded-2xl p-4 border border-[#FFE7A3] space-y-2">
                      <div className="flex items-center gap-2 text-[#856404]">
                        <span className="material-symbols-outlined !text-[18px]">warning</span>
                        <h4 className="font-bold text-[13px]">Təhlükəsizlik:</h4>
                      </div>
                      <div className="text-[12px] text-[#856404] leading-relaxed">
                        Diqqət! Beh göndərməmişdən öncə sövdələşmənin təhlükəsiz olduğuna əmin olun! Qiymət şübhəli dərəcədə aşağıdırsa, ehtiyatlı olun və şübhəli elanlar haqqında dərhal bizə xəbər verin.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Ads */}
            {(similarVipProducts.length > 0 || similarNormalProducts.length > 0) && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Bənzər elanlar</h2>

                {similarVipProducts.length > 0 && (
                  <div className="mb-8">
                    <ProductGrid
                      products={similarVipProducts}
                      title=""
                      emptyMessage=""
                    />
                  </div>
                )}

                {similarNormalProducts.length > 0 && (
                  <ProductGrid
                    products={similarNormalProducts}
                    title=""
                    emptyMessage=""
                  />
                )}
              </div>
            )}
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

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white border-b border-white/10">
            <div className="flex flex-col">
              <h4 className="font-bold text-lg truncate max-w-[300px] md:max-w-xl">{product.title}</h4>
              <p className="text-primary font-bold">{formatPrice(product.price)}</p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined !text-[32px]">close</span>
            </button>
          </div>

          {/* Main Gallery in Modal */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            <button className="swiper-button-prev-modal absolute left-4 z-10 size-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
              <span className="material-symbols-outlined !text-[40px]">chevron_left</span>
            </button>

            <div className="w-full h-full flex items-center justify-center">
              <Swiper
                modules={[Navigation, Pagination, FreeMode]}
                navigation={{
                  prevEl: '.swiper-button-prev-modal',
                  nextEl: '.swiper-button-next-modal',
                }}
                initialSlide={activeImageIndex}
                onSlideChange={(swiper) => setActiveImageIndex(swiper.realIndex)}
                className="w-full h-full"
                spaceBetween={30}
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={`Full view ${idx + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <button className="swiper-button-next-modal absolute right-4 z-10 size-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
              <span className="material-symbols-outlined !text-[40px]">chevron_right</span>
            </button>
          </div>

          {/* Thumbnails in Modal */}
          <div className="p-6 bg-black/40 backdrop-blur-xl flex justify-center overflow-x-auto text-white">
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative size-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === idx ? 'border-primary scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`Modal thumb ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      <PromoteAdModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        adId={product.id}
      />
    </main>
  );
}
