'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

// Mock product data - in real app, fetch from API
const mockProduct = {
  id: '1',
  title: 'iPhone 13 Pro Max 256GB',
  description: 'Great condition iPhone 13 Pro Max with 256GB storage. Barely used, always kept in a case. Includes original box, charger, and cable. Battery health at 98%. No scratches or dents. Unlocked and ready for any carrier.',
  price: 1500,
  currency: '₼',
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCpNALD7ss1o2G_YcVp1G3jzMNWDlVJdPGSIgRsasgNRaTHCh4ZkovaEZ1x1dkFPMnbA7UHesbHqdX0Q2tIHuiR5JGBEcp22Dg9IFBIyj3Qyk-hOARpBjuuSxtbPMEeyhiqt66wSSk1uoWYd7L_EsuiyctDuyGle7E3a3Ch5GF0kz-H9fOSfK9cd0gvLNTP9kCqI92do_ZKMdO3Gi8C4pX8Gm-m6qeYHOeAxRi_T-hIw7Ifm1r-CWfk2RsNC-S7O1HRZQa6lG5FY3k',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCpNALD7ss1o2G_YcVp1G3jzMNWDlVJdPGSIgRsasgNRaTHCh4ZkovaEZ1x1dkFPMnbA7UHesbHqdX0Q2tIHuiR5JGBEcp22Dg9IFBIyj3Qyk-hOARpBjuuSxtbPMEeyhiqt66wSSk1uoWYd7L_EsuiyctDuyGle7E3a3Ch5GF0kz-H9fOSfK9cd0gvLNTP9kCqI92do_ZKMdO3Gi8C4pX8Gm-m6qeYHOeAxRi_T-hIw7Ifm1r-CWfk2RsNC-S7O1HRZQa6lG5FY3k',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCpNALD7ss1o2G_YcVp1G3jzMNWDlVJdPGSIgRsasgNRaTHCh4ZkovaEZ1x1dkFPMnbA7UHesbHqdX0Q2tIHuiR5JGBEcp22Dg9IFBIyj3Qyk-hOARpBjuuSxtbPMEeyhiqt66wSSk1uoWYd7L_EsuiyctDuyGle7E3a3Ch5GF0kz-H9fOSfK9cd0gvLNTP9kCqI92do_ZKMdO3Gi8C4pX8Gm-m6qeYHOeAxRi_T-hIw7Ifm1r-CWfk2RsNC-S7O1HRZQa6lG5FY3k',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCpNALD7ss1o2G_YcVp1G3jzMNWDlVJdPGSIgRsasgNRaTHCh4ZkovaEZ1x1dkFPMnbA7UHesbHqdX0Q2tIHuiR5JGBEcp22Dg9IFBIyj3Qyk-hOARpBjuuSxtbPMEeyhiqt66wSSk1uoWYd7L_EsuiyctDuyGle7E3a3Ch5GF0kz-H9fOSfK9cd0gvLNTP9kCqI92do_ZKMdO3Gi8C4pX8Gm-m6qeYHOeAxRi_T-hIw7Ifm1r-CWfk2RsNC-S7O1HRZQa6lG5FY3k',
    'https://images.ft.com/v3/image/raw/ftcms%3A2aa4edd5-0ed9-4627-8178-1e392eb9501e?source=next-article&fit=scale-down&quality=highest&width=1440&dpr=1'
  ],
  category: { id: '1', name: 'Electronics', slug: 'electronics' },
  location: { id: '1', city: 'Baku', region: 'Nasimi', country: 'Azerbaijan' },
  seller: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+994501234567',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    isVerified: true
  },
  condition: 'used' as const,
  status: 'active' as const,
  viewCount: 245,
  favoriteCount: 12,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  updatedAt: new Date(),
  features: {
    'Storage': '256GB',
    'Color': 'Graphite',
    'Battery Health': '98%',
  }
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  return (
    <main className="w-full flex justify-center py-5 sm:py-10 px-4 bg-white min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <div>
            <div className="flex flex-wrap gap-2">
              <a className="text-gray-500 text-sm font-medium leading-normal" href="/">Ana Səhifə</a>
              <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
              <a className="text-gray-500 text-sm font-medium leading-normal" href="#">{mockProduct.category.name}</a>
              <span className="text-gray-500 text-sm font-medium leading-normal">/</span>
              <span className="text-gray-900 text-sm font-medium leading-normal">{mockProduct.title}</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex min-w-72 flex-col gap-3">
              <h1 className="text-gray-900 text-4xl font-black leading-tight tracking-[-0.033em]">{mockProduct.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Swiper */}
              <div className="relative w-full aspect-[16/9] bg-white rounded-xl overflow-hidden shadow-sm">
                <Swiper
                  modules={[Navigation, Pagination, Thumbs]}
                  navigation={{
                    prevEl: '.swiper-button-prev-custom',
                    nextEl: '.swiper-button-next-custom',
                  }}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  pagination={{ clickable: true }}
                  className="h-full w-full"
                  loop={true}
                  spaceBetween={0}
                >
                  {mockProduct.images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="relative w-full h-full">
                        <Image
                          src={img}
                          alt={`${mockProduct.title} - Image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation Arrows */}
                <button className="swiper-button-prev-custom absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-black/30 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/50 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="swiper-button-next-custom absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-black/30 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/50 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Thumbnail Swiper */}
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Thumbs]}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                className="thumbs-swiper"
              >
                {mockProduct.images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all">
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
            </div>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm">Şəhər</p>
                <p className="text-gray-900 font-bold">{mockProduct.location.city}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm">Vəziyyət</p>
                <p className="text-gray-900 font-bold capitalize">{mockProduct.condition === 'used' ? 'İşlənmiş' : 'Yeni'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm">Kateqoriya</p>
                <p className="text-gray-900 font-bold">{mockProduct.category.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm">Baxış sayı</p>
                <p className="text-gray-900 font-bold">{mockProduct.viewCount}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <p className="text-gray-900 text-base leading-relaxed whitespace-pre-line">
                {mockProduct.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                <span>Elan №: {mockProduct.id}</span>
                <span>Baxış sayı: {mockProduct.viewCount}</span>
                <span>Yeniləndi: {formatRelativeTime(mockProduct.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info & Seller */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-primary">
                  {formatPrice(mockProduct.price, mockProduct.currency)}
                </h3>
                <div className="flex gap-2">
                  <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                  <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined">flag</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Seller Info */}
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full size-14 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {mockProduct.seller.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-lg">{mockProduct.seller.name}</p>
                  <p className="text-sm text-gray-500">Şəxsi</p>
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined text-primary">call</span>
                  <span className="text-gray-900 font-semibold text-lg">{mockProduct.seller.phone?.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '($1) $2-**-**') || '(050) 555-**-**'}</span>
                  <a className="ml-auto text-primary text-sm font-bold cursor-pointer">Göstər</a>
                </div>
                <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary-dark transition-colors">
                  <span className="material-symbols-outlined">chat</span>
                  <span className="truncate">Mesaj yaz</span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
