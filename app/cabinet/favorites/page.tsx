'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { ROUTES } from '@/constants';
import { formatPrice, getImageUrl, formatRelativeTime } from '@/lib/utils';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<AdListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchFavorites = async () => {
      try {
        const result = await adService.getFavourites({ pageNumber: 1, pageSize: 50 });
        setFavorites(result.data ?? []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (id: string) => {
    try {
      await adService.removeFromFavourites(id);
      setFavorites(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading */}
              <div className="mb-8 border-b border-gray-50 pb-6">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">
                  Seçilmişlərim
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Bəyəndiyiniz elanlar burada saxlanılır
                </p>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin h-8 w-8 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
                  <p className="text-gray-400 text-sm font-medium">Yüklenir...</p>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-6">
                  {favorites.map(ad => {
                    const imageUrl = ad.image ? getImageUrl(ad.image) : '/placeholder-product.jpg';
                    
                    return (
                      <div key={ad.id} className="relative group/card h-full">
                        <Link href={ROUTES.PRODUCT(ad.id)} className="h-full block">
                          <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                            {/* Image with next/image */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                              <Image
                                src={imageUrl}
                                alt={ad.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              
                              {/* Price Badge */}
                              <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1 rounded-xl shadow-lg border border-white z-10">
                                 <p className="text-primary font-bold text-base tabular-nums">
                                   {formatPrice(ad.price, 'AZN')}
                                 </p>
                              </div>

                              {/* Featured Badges */}
                              <div className="absolute top-3 left-3 flex gap-1 z-10">
                                {ad.isVip && (
                                  <div className="bg-blue-600 text-white p-1 rounded-lg shadow-lg">
                                    <span className="material-symbols-outlined !text-sm">stars</span>
                                  </div>
                                )}
                                {ad.isPremium && (
                                  <div className="bg-yellow-500 text-white p-1 rounded-lg shadow-lg">
                                    <span className="material-symbols-outlined !text-sm">workspace_premium</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col p-4 flex-1">
                              <h3 className="text-sm font-bold text-gray-900 group-hover/card:text-primary transition-colors line-clamp-2 mb-3 leading-tight">
                                {ad.title}
                              </h3>
                              
                              <div className="mt-auto space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                  <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-[14px]">location_on</span>
                                    <span className="truncate max-w-[80px]">{ad.city || ''}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-[14px]">calendar_today</span>
                                    <span>{mounted ? formatRelativeTime(ad.createdDate) : ''}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                        
                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFavorite(ad.id);
                          }}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-xl size-9 shadow-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center group/btn z-20 border border-white active:scale-95"
                          aria-label="Seçilmişlərdən sil"
                        >
                          <span className="material-symbols-outlined !text-xl font-bold transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                  <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-gray-300 text-4xl">heart_broken</span>
                  </div>
                  <h3 className="text-gray-900 text-lg font-bold">Seçilmiş elan yoxdur</h3>
                  <p className="text-gray-500 text-sm mt-1">Bəyəndiyiniz elanları bura əlavə edə bilərsiniz.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
