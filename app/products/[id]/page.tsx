'use client';

import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { formatPrice, formatRelativeTime, getImageUrl } from '@/lib/utils';
import { adService } from '@/services/ad.service';
import { AdDetail } from '@/types/api';
import { ROUTES } from '@/constants';

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await adService.getAdById(id);
        setProduct(data);
        setIsFavorite(data.isFavourite);
        // Increment view count when viewed
        adService.incrementViewCount(id).catch(err => console.error('Error incrementing view count:', err));
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
    <main className="w-full flex justify-center py-5 sm:py-10 px-4 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <div>
            <div className="flex flex-wrap gap-2">
              <a className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors" href="/">Ana Səhifə</a>
              <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
              <a className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors" href={`${ROUTES.LISTINGS}?category=${product.categoryId}`}>
                {product.category || 'Naməlum'}
              </a>
              {product.subCategory && (
                <>
                  <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
                  <a className="text-gray-500 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">{product.subCategory}</a>
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
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
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
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Swiper */}
                <div className="relative w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden shadow-md">
                  <Swiper
                    modules={[Navigation, Pagination, Thumbs]}
                    navigation={{
                      prevEl: '.swiper-button-prev-custom',
                      nextEl: '.swiper-button-next-custom',
                    }}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    pagination={{ clickable: true }}
                    className="h-full w-full"
                    loop={images.length > 1}
                    spaceBetween={0}
                  >
                    {images.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full">
                          <Image
                            src={img}
                            alt={`${product.title} - Image ${idx + 1}`}
                            fill
                            className="object-contain bg-black/5"
                            priority={idx === 0}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button className="swiper-button-prev-custom absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-black/30 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/50 transition-colors">
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button className="swiper-button-next-custom absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-black/30 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/50 transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Swiper */}
                {images.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    modules={[FreeMode, Thumbs]}
                    spaceBetween={10}
                    slidesPerView={Math.min(images.length, 6)}
                    freeMode={true}
                    watchSlidesProgress={true}
                    className="thumbs-swiper"
                  >
                    {images.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all shadow-sm">
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
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold">Xüsusiyyətlər</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-4 gap-x-12">
                    {/* Static Fields */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500 text-sm font-medium">Şəhər</span>
                      <span className="text-gray-900 font-bold">{product.city || 'Göstərilməyib'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500 text-sm font-medium">Vəziyyət</span>
                      <span className="text-gray-900 font-bold uppercase">{product.isNew ? 'Yeni' : 'İşlənmiş'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500 text-sm font-medium">Çatdırılma</span>
                      <span className="text-gray-900 font-bold">{product.isDeliverable ? 'Bəli' : 'Xeyr'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500 text-sm font-medium">Malın növü</span>
                      <span className="text-gray-900 font-bold">{product.adType || 'Göstərilməyib'}</span>
                    </div>

                    {/* Dynamic Fields */}
                    {product.dynamicFields && product.dynamicFields.map((field, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm font-medium">{field.name}</span>
                        <span className="text-gray-900 font-bold">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-gray-900 font-bold text-xl">Təsvir</h3>
                </div>
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 pt-6 border-t border-gray-50">
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
              </div>
            </div>

            {/* Right Column - Price, Seller & Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Price Box */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">Qiymət</p>
                      <h3 className="text-4xl font-black text-primary">
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

                    <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-primary text-white text-base font-black leading-normal tracking-[0.015em] gap-3 hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 active:scale-[0.98]">
                      <span className="material-symbols-outlined">chat</span>
                      <span className="truncate">Mesaj yaz</span>
                    </button>

                    <a
                      href={`https://wa.me/${product.phoneNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-[#25D366] text-white text-base font-black leading-normal gap-3 hover:bg-[#20ba59] transition-all shadow-lg hover:shadow-green-500/30 active:scale-[0.98]"
                    >
                      <i className="fa-brands fa-whatsapp text-2xl"></i>
                      <span className="truncate">WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <span className="material-symbols-outlined">security</span>
                    <h4 className="font-bold text-sm">Təhlükəsizlik məsləhətləri</h4>
                  </div>
                  <ul className="text-xs text-amber-700/80 space-y-2 list-disc list-inside">
                    <li>Ödəniş etməzdən əvvəl məhsulu görün</li>
                    <li>Heç vaxt kart məlumatlarınızı paylaşmayın</li>
                    <li>Sikkələrdən və qeyri-rəsmi ödənişlərdən qaçın</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
