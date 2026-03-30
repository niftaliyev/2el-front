'use client';

import { useEffect, useState } from 'react';
import CategoryGrid from '@/components/features/categories/CategoryGrid';
import ProductGrid from '@/components/features/products/ProductGrid';
import { Category, Product } from '@/types';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';

// Mock data - replace with actual API calls
import { CATEGORIES } from '@/constants';

export default function Home() {
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES as any);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ICONS: Record<string, string> = {
      'Elektronika': 'devices',
      'Nəqliyyat': 'directions_car',
      'Ev və bağ üçün': 'chair',
      'Ehtiyat hissələri və aksesuarlar (avto)': 'build',
      'Daşınmaz əmlak': 'home',
      'Xidmətlər və biznes': 'home_repair_service',
      'Şəxsi əşyalar': 'watch',
      'Hobbi və asudə': 'sports_esports',
      'Uşaq aləmi': 'stroller',
      'Heyvanlar': 'pets',
      'İş elanları': 'work',
      'Məktəblilər üçün': 'school',
      'Mağazalar': 'store',
    };

    const fetchCategories = async () => {
      try {
        const tree = await adService.getCategoryTree();
        if (tree && tree.length > 0) {
          const dynamicCategories: Category[] = tree.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.name.toLowerCase().replace(/[^a-z0-9_]+/g, '-'),
            icon: ICONS[cat.name] || 'category',
            image: cat.imageUrl,
            description: '',
            children: cat.children?.map((child: any) => ({
              id: child.id,
              name: child.name,
              slug: child.name.toLowerCase().replace(/[^a-z0-9_]+/g, '-'),
              image: child.imageUrl,
              subCategories: child.subCategories?.map((sc: any) => ({
                 id: sc.id,
                 name: sc.name,
                 image: sc.imageUrl
              })) || []
            })) || []
          }));
          setCategories(dynamicCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPremiumAds = async () => {
      try {
        const ads = await adService.getPremiumAds();
        const transformedProducts: Product[] = ads.map((ad: AdListItem) => {
          const imageUrl = ad.image ? getImageUrl(ad.image) : null;
          return {
            id: ad.id.toString(),
            title: ad.title,
            description: ad.description ?? '',
            price: ad.price,
            currency: 'AZN',
            images: imageUrl ? [imageUrl] : [],
            category: { id: ad.categoryId ?? '1', name: ad.category ?? '', slug: '' },
            location: { id: '1', city: ad.city ?? '', region: '', country: 'Azerbaijan' },
            seller: { id: '1', name: '', email: '', createdAt: new Date(), isVerified: false },
            condition: ad.isNew ? 'new' : 'used',
            status: 'active',
            viewCount: ad.viewCount ?? 0,
            favoriteCount: 0,
            createdAt: new Date(ad.createdDate),
            updatedAt: new Date(ad.createdDate),
            isPremium: true,
            isFavourite: ad.isFavourite,
          } as Product;
        });
        setPremiumProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching premium ads:', error);
        setPremiumProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPremiumAds();

    // Random rotation every 5 minutes
    const interval = setInterval(fetchPremiumAds, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
            <CategoryGrid categories={categories} />

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
                title="Premium elanlar"
                viewAllLink="/listings"
                viewAllText="Son elanlar"
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
