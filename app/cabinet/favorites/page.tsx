'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { ROUTES } from '@/constants';
import { formatPrice, getImageUrl, formatRelativeTime } from '@/lib/utils';
import { adService } from '@/services/ad.service';
import { storeService } from '@/services/store.service';
import { AdListItem, StoreListItem } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { storeService as storeSvc } from '@/services/store.service';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<AdListItem[]>([]);
  const [followedStores, setFollowedStores] = useState<StoreListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'stores'>('ads');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'ads') {
        const result = await adService.getFavourites({ pageNumber: 1, pageSize: 50 });
        setFavorites(result.data ?? []);
      } else {
        if (isAuthenticated) {
           const { storeService } = await import('@/services/store.service');
           // Assuming a getFollowedStores exists in the service
           const response = await storeService.getFollowedStores?.();
           setFollowedStores(response || []);
        } else {
           const response = await storeService.getFollowedStoresByIds();
           setFollowedStores(response || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      await adService.removeFromFavourites(id);
      setFavorites(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleUnfollowStore = async (id: string) => {
    try {
      await storeService.toggleFollowStore(id);
      setFollowedStores(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error unfollowing store:', error);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-8">
              {/* Page Heading and Tabs */}
              <div className="mb-4 sm:mb-8 border-b border-gray-100 pb-0 shadow-sm">
                <div className="px-1 sm:px-0 mb-6">
                  <h1 className="text-gray-900 text-2xl sm:text-4xl font-black leading-tight tracking-tight mb-2">
                    Seçilmişlər
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">
                    {activeTab === 'ads' ? 'Bəyəndiyiniz elanlar burada saxlanılır' : 'İzlədiyiniz mağazalar burada saxlanılır'}
                  </p>
                </div>

                <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab('ads')}
                    className={`pb-4 px-1 text-sm sm:text-base font-bold transition-all relative whitespace-nowrap ${
                      activeTab === 'ads' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Elanlar ({favorites.length})
                    {activeTab === 'ads' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('stores')}
                    className={`pb-4 px-1 text-sm sm:text-base font-bold transition-all relative whitespace-nowrap ${
                      activeTab === 'stores' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Mağazalar ({followedStores.length})
                    {activeTab === 'stores' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin h-8 w-8 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
                  <p className="text-gray-400 text-sm font-medium">Yüklenir...</p>
                </div>
              ) : activeTab === 'ads' ? (
                favorites.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                    {favorites.map(ad => {
                      const imageUrl = ad.image ? getImageUrl(ad.image) : '/placeholder-product.jpg';
                      
                      return (
                        <div key={ad.id} className="relative group/card h-full">
                          <Link href={ROUTES.PRODUCT(ad)} className="h-full block">
                            <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                              {/* Image with next/image */}
                              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                <Image
                                  src={imageUrl}
                                  alt={ad.title}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                
                                {/* Price Badge */}
                                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-white/95 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-lg border border-white z-10">
                                   <p className="text-primary font-bold text-sm sm:text-base tabular-nums">
                                     {formatPrice(ad.price, 'AZN')}
                                   </p>
                                </div>
  
                                {/* Featured Badges */}
                                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-0.5 sm:gap-1 z-10">
                                  {ad.isVip && (
                                    <div className="bg-blue-600 text-white p-0.5 sm:p-1 rounded-md sm:rounded-lg shadow-lg">
                                      <span className="material-symbols-outlined !text-[11px] sm:!text-sm">stars</span>
                                    </div>
                                  )}
                                  {ad.isPremium && (
                                    <div className="bg-yellow-500 text-white p-0.5 sm:p-1 rounded-md sm:rounded-lg shadow-lg">
                                      <span className="material-symbols-outlined !text-[11px] sm:!text-sm">workspace_premium</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col p-2 sm:p-4 flex-1">
                                <h3 className="text-[12px] sm:text-sm font-bold text-gray-900 group-hover/card:text-primary transition-colors line-clamp-2 mb-2 sm:mb-3 leading-tight min-h-[30px] sm:min-h-0">
                                  {ad.title}
                                </h3>
                                
                                <div className="mt-auto space-y-1 sm:space-y-2">
                                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                      <span className="material-symbols-outlined !text-[12px] sm:!text-[14px]">location_on</span>
                                      <span className="truncate max-w-[50px] sm:max-w-[80px]">{ad.city || ''}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                      <span className="material-symbols-outlined !text-[12px] sm:!text-[14px]">calendar_today</span>
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
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-md rounded-lg sm:rounded-xl size-7 sm:size-9 shadow-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center group/btn z-20 border border-white active:scale-95"
                            aria-label="Seçilmişlərdən sil"
                          >
                            <span className="material-symbols-outlined !text-base sm:!text-xl font-bold transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
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
                )
              ) : (
                followedStores.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {followedStores.map(store => (
                      <div key={store.id} className="relative group/card bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                        <Link href={ROUTES.STORE_DETAIL(store.slug || '')} className="flex items-center gap-4">
                          <div className="size-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 relative">
                            {store.storeLogoUrl ? (
                              <Image src={getImageUrl(store.storeLogoUrl)} alt={store.storeName} fill className="object-contain p-2" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-gray-300 text-3xl">storefront</span></div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-gray-900 font-bold truncate group-hover/card:text-primary transition-colors">{store.storeName}</h3>
                            <p className="text-gray-500 text-xs mt-0.5 truncate">{store.headline || 'Mağaza'}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-gray-400 uppercase">
                              <span>{store.adCount} elan</span>
                              <span>{store.followerCount} izləyici</span>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => handleUnfollowStore(store.id)}
                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                          title="İzləməyi dayandır"
                        >
                          <span className="material-symbols-outlined font-bold">person_remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                    <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-gray-300 text-4xl">storefront</span>
                    </div>
                    <h3 className="text-gray-900 text-lg font-bold">İzlənilən mağaza yoxdur</h3>
                    <p className="text-gray-500 text-sm mt-1">Mağazaları izləyərək yeni elanlardan xəbərdar ola bilərsiniz.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
