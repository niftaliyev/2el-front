'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { Product } from '@/types';
import { ROUTES } from '@/constants';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface FavoriteListing {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  category: string;
}

// Mock data - replace with API call
const mockFavorites: FavoriteListing[] = [
  {
    id: '1',
    title: 'BMW X5, 2020',
    location: 'Bakı',
    price: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    category: 'Nəqliyyat'
  },
  {
    id: '2',
    title: 'Yaşayış kompleksində 2 otaqlı mənzil',
    location: 'Bakı, Nərimanov ray.',
    price: 180000,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    category: 'Daşınmaz əmlak'
  },
  {
    id: '3',
    title: 'Gaming Laptop MSI',
    location: 'Bakı, Yasamal ray.',
    price: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
    category: 'Elektronika'
  },
  {
    id: '4',
    title: 'Ofis üçün yazı masası',
    location: 'Gəncə',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
    category: 'Mebel'
  }
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockFavorites);

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter(item => item.id !== id));
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
                  Seçilmiş Elanlar
                </h1>
                <p className="text-gray-500 text-base font-normal leading-normal">
                  Bəyəndiyiniz elanlar burada saxlanılır
                </p>
              </div>

              {/* Favorites Grid */}
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map(listing => (
                    <div key={listing.id} className="relative group">
                      <Link href={ROUTES.PRODUCT(listing.id)} className="h-full">
                        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                          <div className="relative">
                            <div
                              className="aspect-[4/3] bg-cover bg-center"
                              style={{ backgroundImage: `url("${listing.imageUrl}")` }}
                            />
                          </div>
                          <div className="flex flex-col px-4 pt-4 pb-4 flex-1">
                            <p className="text-lg font-bold text-gray-900 mb-1">
                              {formatPrice(listing.price, 'AZN')}
                            </p>
                            <h3 className="text-base font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3">
                              {listing.title}
                            </h3>
                            <div className="flex justify-between text-sm text-gray-500 mt-auto">
                              <span className="truncate">{listing.location}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(listing.id)}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors z-10"
                        aria-label="Seçilmişlərdən sil"
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
                    Seçilmiş elan yoxdur
                  </p>
                  <p className="text-gray-500">
                    Bəyəndiyiniz elanları ürək ikonuna klikləyərək əlavə edin
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
