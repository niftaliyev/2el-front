'use client';

import { useEffect, useState } from 'react';
import CategoryGrid from '@/components/features/categories/CategoryGrid';
import ProductGrid from '@/components/features/products/ProductGrid';
import { Category, Product } from '@/types';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl, generateSlug } from '@/lib/utils';

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
        const LOCAL_IMAGES: Record<string, string> = {
          'Elektronika': '/category-images/elektronika_cat.png',
          'Nəqliyyat': '/category-images/neqliyyat_cat.png',
          'Ev və bağ üçün': '/category-images/ev_ve_bag_ucun_cat.png',
          'Daşınmaz əmlak': '/category-images/dasinmaz_emlak_cat.png',
          'Xidmətlər və biznes': '/category-images/xidmetler_ve_biznes_cat.png',
          'Şəxsi əşyalar': '/category-images/sexsi_esyalar_cat.png',
          'Hobbi və asudə': '/category-images/hobbi_ve_asude_cat.png',
          'Uşaq aləmi': '/category-images/usaq_alemi_cat.png',
          'Heyvanlar': '/category-images/heyvanlar_cat.png',
          'İş elanları': '/category-images/is_elanlari_cat.png',
          'Ehtiyat hissələri və aksesuarlar (avto)': '/category-images/ehtiyyat_hisseleri_ve_aksesuarlar_avto_cat.png',
          'Məktəblilər üçün': '/category-images/mektebliler_ucun_cat.png'
        };

        const tree = await adService.getCategoryTree();
        if (tree && tree.length > 0) {
          const dynamicCategories: Category[] = tree.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: generateSlug(cat.name),
            icon: ICONS[cat.name] || 'category',
            image: LOCAL_IMAGES[cat.name] || getImageUrl(cat.imageUrl),
            description: '',
            children: cat.children?.map((child: any) => ({
              id: child.id,
              name: child.name,
              slug: generateSlug(child.name),
              image: getImageUrl(child.imageUrl),
              subCategories: child.subCategories?.map((sc: any) => ({
                id: sc.id,
                name: sc.name,
                slug: generateSlug(sc.name),
                image: getImageUrl(sc.imageUrl)
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
            slug: ad.slug,
            description: ad.description ?? '',
            price: ad.price,
            currency: '₼',
            images: imageUrl ? [imageUrl] : [],
            category: {
              id: ad.categoryId ?? '1',
              name: ad.category ?? '',
              slug: ad.parentCategorySlug || (ad.category ? generateSlug(ad.category) : '')
            },
            subCategory: ad.childCategorySlug ? {
              id: ad.subCategoryId ?? '0',
              name: '',
              slug: ad.childCategorySlug
            } : undefined,
            location: { id: '1', city: ad.city ?? '', region: '', country: 'Azerbaijan' },
            seller: { id: '1', name: '', email: '', createdAt: new Date(), isVerified: false },
            condition: ad.isNew ? 'new' : 'used',
            status: 'active',
            viewCount: ad.viewCount ?? 0,
            favoriteCount: 0,
            createdAt: new Date(ad.createdDate),
            updatedAt: new Date(ad.createdDate),
            isPremium: true,
            isFeatured: ad.isVip,
            isBoosted: ad.isBoosted,
            isFavourite: ad.isFavourite,
            store: ad.isStore ? {
              id: '',
              name: ad.storeName || ad.fullName || 'Mağaza',
              logo: ad.storeLogoUrl ? getImageUrl(ad.storeLogoUrl) : undefined,
              slug: ad.storeSlug
            } : undefined,
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
    <main className="bg-gray-50 flex-1">
      <div className="container mx-auto">
        <div className="flex gap-4 lg:gap-6">
          {/* Left Banner - only xl+ */}
          <aside className="hidden xl:block w-48 2xl:w-64 flex-shrink-0">
            <div className="sticky top-20 pt-4">
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
            <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-6">
              {isLoading ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Premium Elanlar</h1>
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
              ) : (
                <ProductGrid
                  products={premiumProducts}
                  title="Premium elanlar"
                  viewAllLink="/elanlar"
                  viewAllText="Son elanlar"
                  emptyMessage="Premium elan tapılmadı"
                />
              )}
            </div>
          </div>

          {/* Right Banner - only xl+ */}
          <aside className="hidden xl:block w-48 2xl:w-64 flex-shrink-0">
            <div className="sticky top-20 pt-4">
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
