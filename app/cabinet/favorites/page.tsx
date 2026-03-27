'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { ROUTES } from '@/constants';
import { formatPrice } from '@/lib/utils';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<AdListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <UserSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Page Heading */}
              <div className="mb-6">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                  Se&#231;ilmi&#351; Elanlar
                </h1>
                <p className="text-gray-500 text-base font-normal leading-normal">
                  B&#601;y&#601;ndiyiniz elanlar burada saxlan&#305;l&#305;r
                </p>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map(ad => (
                    <div key={ad.id} className="relative group">
                      <Link href={ROUTES.PRODUCT(ad.id)} className="h-full">
                        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                          <div className="relative">
                            <div
                              className="aspect-[4/3] bg-cover bg-center bg-gray-100"
                              style={{ backgroundImage: ad.image ? `url("${getImageUrl(ad.image)}")` : 'none' }}
                            />
                          </div>
                          <div className="flex flex-col px-4 pt-4 pb-4 flex-1">
                            <p className="text-lg font-bold text-gray-900 mb-1">
                              {formatPrice(ad.price, 'AZN')}
                            </p>
                            <h3 className="text-base font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3">
                              {ad.title}
                            </h3>
                            <div className="flex justify-between text-sm text-gray-500 mt-auto">
                              <span className="truncate">{ad.city || ''}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(ad.id)}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors z-10"
                        aria-label="Se&#231;ilmi&#351;l&#601;rd&#601;n sil"
                      >
                        <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                          favorite
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                    favorite_border
                  </span>
                  <p className="text-gray-900 text-xl font-semibold mb-2">
                    Se&#231;ilmi&#351; elan yoxdur
                  </p>
                  <p className="text-gray-500">
                    B&#601;y&#601;ndiyiniz elanlar&#305; &#252;r&#601;k ikonuna klikl&#601;y&#601;r&#601;k &#601;lav&#601; edin
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
