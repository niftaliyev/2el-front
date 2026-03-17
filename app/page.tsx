'use client';

import { useEffect, useState } from 'react';
import CategoryGrid from '@/components/features/categories/CategoryGrid';
import ProductGrid from '@/components/features/products/ProductGrid';
import { Category, Product } from '@/types';
import { adService, PremiumAd } from '@/services/ad.service';
import { getImageUrl } from '@/lib/utils';

// Mock data - replace with actual API calls
const mockCategories: Category[] = [
  { id: '1', name: 'Nəqliyyat', slug: 'transport', icon: 'directions_car' },
  { id: '2', name: 'Daşınmaz əmlak', slug: 'real-estate', icon: 'home' },
  { id: '3', name: 'Elektronika', slug: 'electronics', icon: 'devices' },
  { id: '4', name: 'İş və biznes', slug: 'business', icon: 'work' },
  { id: '5', name: 'Şəxsi əşyalar', slug: 'personal', icon: 'watch' },
  { id: '6', name: 'Hobbi və asudə', slug: 'hobbies', icon: 'sports_esports' },
  { id: '7', name: 'Heyvanlar', slug: 'animals', icon: 'pets' },
  { id: '8', name: 'Xidmətlər', slug: 'services', icon: 'home_repair_service' },
  { id: '9', name: 'Uşaq aləmi', slug: 'kids', icon: 'stroller' },
  { id: '10', name: 'Ev və bağ üçün', slug: 'home-garden', icon: 'chair' },
  { id: '11', name: 'Təmir və tikinti', slug: 'construction', icon: 'construction' },
  { id: '12', name: 'Digər', slug: 'other', icon: 'more_horiz' },
];

export default function Home() {
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPremiumAds = async () => {
      try {
        const premiumAds = await adService.getPremiumAds();
        
        // Transform PremiumAd to Product format
        const transformedProducts: Product[] = premiumAds.map((ad: PremiumAd) => {
          const imageUrl = getImageUrl(ad.image);
          
          return {
            id: ad.id.toString(),
            title: ad.title,
            description: '',
            price: ad.price,
            currency: 'AZN',
            images: imageUrl ? [imageUrl] : [],
            category: mockCategories[0], // Default category
            location: { id: '1', city: 'Bakı', region: 'Bakı', country: 'Azerbaijan' },
            seller: { 
              id: '1', 
              name: '', 
              email: '', 
              createdAt: new Date(), 
              isVerified: false 
            },
            condition: 'used',
            status: 'active',
            viewCount: 0,
            favoriteCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPremium: true,
          };
        });

        setPremiumProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching premium ads:', error);
        // Keep empty array on error
        setPremiumProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPremiumAds();
  }, []);

  return (
    <main className="bg-gray-50">
      <div className="container mx-auto">
        <div className="flex gap-4 lg:gap-6">
          {/* Left Banner */}
          <aside className="hidden xl:block w-48 2xl:w-64 flex-shrink-0">
            <div className="sticky top-4 pt-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 h-[600px] flex items-center justify-center border border-purple-200">
                <p className="text-sm text-gray-500 text-center">Reklam sahəsi</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Categories Section */}
            <CategoryGrid categories={mockCategories} />

            {/* Premium Products */}
            {isLoading ? (
              <div className="container mx-auto px-4 sm:px-10 py-5 sm:py-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Premium Elanlar</h1>
                    <p className="text-sm sm:text-base text-gray-600">Ən yaxşı və seçilmiş elanları kəşf edin</p>
                  </div>
                  <div className="flex items-center justify-center py-12">
                    <svg
                      className="animate-spin h-8 w-8 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <ProductGrid
                products={premiumProducts}
                title="Premium Elanlar"
                description="Ən yaxşı və seçilmiş elanları kəşf edin"
                viewAllLink="/listings?premium=true"
                emptyMessage="Premium elan tapılmadı"
              />
            )}
          </div>

          {/* Right Banner */}
          <aside className="hidden xl:block w-48 2xl:w-64 flex-shrink-0">
            <div className="sticky top-4 pt-4">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 h-[600px] flex items-center justify-center border border-blue-200">
                <p className="text-sm text-gray-500 text-center">Reklam sahəsi</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
