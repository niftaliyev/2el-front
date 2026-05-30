'use client';

import { useEffect, useState } from 'react';
import CategoryGrid from '@/components/features/categories/CategoryGrid';
import ProductGrid from '@/components/features/products/ProductGrid';
import { Category, Product } from '@/types';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl, generateSlug } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import BannerAd from '@/components/features/ads/BannerAd';
import { AdPosition } from '@/services/banner.service';
import ProductCardSkeleton from '@/components/features/products/ProductCardSkeleton';

// Mock data - replace with actual API calls
import { CATEGORIES } from '@/constants';

export default function Home() {
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES as any);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();

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
            name: language === 'ru' && cat.nameRu ? cat.nameRu : cat.name,
            slug: generateSlug(cat.name),
            icon: ICONS[cat.name] || 'category',
            image: LOCAL_IMAGES[cat.name] || getImageUrl(cat.imageUrl),
            description: '',
            children: cat.children?.map((child: any) => ({
              id: child.id,
              name: language === 'ru' && child.nameRu ? child.nameRu : child.name,
              slug: generateSlug(child.name),
              image: getImageUrl(child.imageUrl),
              subCategories: child.subCategories?.map((sc: any) => ({
                id: sc.id,
                name: language === 'ru' && sc.nameRu ? sc.nameRu : sc.name,
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
  }, [language]);

  useEffect(() => {
    const fetchPremiumAds = async () => {
      try {
        const ads = await adService.getPremiumAds();
        const transformedProducts: Product[] = ads.map((ad: AdListItem) => {
          const imageUrl = ad.image ? getImageUrl(ad.image) : null;
          return {
            id: ad.id.toString(),
            title: ad.title,
            pinCode: ad.pinCode,
            parentCategorySlug: ad.parentCategorySlug,
            childCategorySlug: ad.childCategorySlug,
            description: ad.description ?? '',
            price: ad.price,
            currency: '₼',
            images: imageUrl ? [imageUrl] : [],
            category: {
              id: ad.categoryId ?? '1',
              name: language === 'ru' && ad.categoryRu ? ad.categoryRu : (ad.category ?? ''),
              slug: ad.parentCategorySlug || (ad.category ? generateSlug(ad.category) : '')
            },
            subCategory: ad.childCategorySlug ? {
              id: ad.subCategoryId ?? '0',
              name: '',
              slug: ad.childCategorySlug
            } : undefined,
            location: { id: '1', city: ad.city ?? '', cityRu: ad.cityRu, region: '', country: 'Azerbaijan' },
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
  }, [language]);

  return (
    <main className="bg-gray-50 flex-1 flex flex-col">
      <div className="w-full flex flex-1">
        {/* Left Banner - only xl+ */}
        <aside className="hidden xl:block flex-1 min-w-[160px] 2xl:min-w-[200px]">
          <div className="sticky top-[64px] h-[calc(100vh-64px)] w-full">
            <BannerAd position={AdPosition.LeftSidebar} className="w-full h-full !rounded-none" noBoard />
          </div>
        </aside>

        {/* Main Content */}
        <div className="w-full max-w-[1024px] mx-auto px-2 sm:px-4 lg:px-6 pb-6">
          <div className="w-full pt-2 sm:pt-4">
            {/* Categories Section */}
            <CategoryGrid categories={categories} />

            {/* Premium Products */}
            <div className="px-1 sm:px-4 pt-2 sm:pt-4 pb-4 sm:pb-6">
              {isLoading ? (
                <div className="w-full">
                  <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#212121]">{t('home.premiumAds')}</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <ProductCardSkeleton key={idx} />
                    ))}
                  </div>
                </div>
              ) : (
                <ProductGrid
                  products={premiumProducts}
                  title={t('home.premiumAds')}
                  viewAllLink="/elanlar"
                  viewAllText={t('home.latestAds')}
                  emptyMessage={t('home.premiumAdsNotFound')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Banner - only xl+ */}
        <aside className="hidden xl:block flex-1 min-w-[160px] 2xl:min-w-[200px]">
          <div className="sticky top-[64px] h-[calc(100vh-64px)] w-full">
            <BannerAd position={AdPosition.RightSidebar} className="w-full h-full !rounded-none" noBoard />
          </div>
        </aside>
      </div>
    </main>
  );

}
