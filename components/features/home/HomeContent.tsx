'use client';

import { useEffect, useState } from 'react';
import CategoryGrid from '@/components/features/categories/CategoryGrid';
import ProductGrid from '@/components/features/products/ProductGrid';
import { Category, Product } from '@/types';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl, generateSlug } from '@/lib/utils';
import { CATEGORIES } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomeContent() {
  const { language } = useLanguage();
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getInitialCategories = () => {
    const base = CATEGORIES.map(cat => ({
      ...cat,
      name: language === 'ru' && (cat as any).nameRu ? (cat as any).nameRu : cat.name
    }));

    const extras = [
      {
        id: 'telefonlar-init',
        name: language === 'ru' ? 'Телефоны' : 'Telefonlar',
        nameRu: 'Телефоны',
        slug: 'elektronika/telefonlar',
        icon: 'smartphone',
        image: '/category-images/telefonlar_cat.png',
        children: []
      },
      {
        id: 'meiset-init',
        name: language === 'ru' ? 'Бытовая техника' : 'Məişət texnikası',
        nameRu: 'Бытовая техника',
        slug: 'ev-ve-bag-ucun/meiset-texnikasi',
        icon: 'local_laundry_service',
        image: '/category-images/meiset_texnikasi_cat.png',
        children: []
      }
    ];

    const combined = [...base, ...extras];
    combined.sort((a, b) => a.name.localeCompare(b.name, language === 'ru' ? 'ru' : 'az'));

    combined.push({
      id: 'magazalar-init',
      name: language === 'ru' ? 'Магазины' : 'Mağazalar',
      nameRu: 'Магазины',
      slug: '/shops',
      icon: 'store',
      image: '/category-images/magazalar.png',
      children: []
    });

    return combined;
  };

  const [categories, setCategories] = useState<Category[]>(() => getInitialCategories());

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
          'Məktəblilər üçün': '/category-images/mektebliler_ucun_cat.png',
          'Telefonlar': '/category-images/telefonlar_cat.png',
          'Məişət texnikası': '/category-images/meiset_texnikasi_cat.png',
          'Mağazalar': '/category-images/magazalar.png'
        };

        const tree = await adService.getCategoryTree();
        if (tree && tree.length > 0) {
          const parentCategories: Category[] = tree.map((cat: any) => ({
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
              image: LOCAL_IMAGES[child.name] || getImageUrl(child.imageUrl),
              subCategories: child.subCategories?.map((sc: any) => ({
                id: sc.id,
                name: language === 'ru' && sc.nameRu ? sc.nameRu : sc.name,
                slug: generateSlug(sc.name),
                image: getImageUrl(sc.imageUrl)
              })) || []
            })) || []
          }));

          const extraCategories: Category[] = [];

          // 1. Telefonlar under Elektronika
          const electronics = tree.find((c: any) => c.name === 'Elektronika');
          const phones = electronics?.children?.find((c: any) => c.name === 'Telefonlar');
          if (electronics && phones) {
            extraCategories.push({
              id: phones.id,
              name: language === 'ru' && phones.nameRu ? phones.nameRu : phones.name,
              slug: `${generateSlug(electronics.name)}/${generateSlug(phones.name)}`,
              icon: 'smartphone',
              image: LOCAL_IMAGES['Telefonlar'],
              description: '',
              children: []
            });
          }

          // 2. Məişət texnikası under Ev və bağ üçün
          const evVeBag = tree.find((c: any) => c.name === 'Ev və bağ üçün');
          const meiset = evVeBag?.children?.find((c: any) => c.name === 'Məişət texnikası');
          if (evVeBag && meiset) {
            extraCategories.push({
              id: meiset.id,
              name: language === 'ru' && meiset.nameRu ? meiset.nameRu : meiset.name,
              slug: `${generateSlug(evVeBag.name)}/${generateSlug(meiset.name)}`,
              icon: 'local_laundry_service',
              image: LOCAL_IMAGES['Məişət texnikası'],
              description: '',
              children: []
            });
          }

          const allCategories = [...parentCategories, ...extraCategories];
          allCategories.sort((a, b) => a.name.localeCompare(b.name, language === 'ru' ? 'ru' : 'az'));

          // Add Mağazalar at the end
          allCategories.push({
            id: 'magazalar',
            name: language === 'ru' ? 'Магазины' : 'Mağazalar',
            slug: '/shops',
            icon: 'store',
            image: LOCAL_IMAGES['Mağazalar'],
            description: '',
            children: []
          });

          setCategories(allCategories);
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
            description: ad.description ?? '',
            price: ad.price,
            currency: '₼',
            images: imageUrl ? [imageUrl] : [],
            category: { id: ad.categoryId ?? '1', name: ad.category ?? '', slug: '' },
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

    const interval = setInterval(fetchPremiumAds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-gray-50">
      <div className="container mx-auto">
        <div className="flex gap-4 lg:gap-6">
          <aside className="hidden xl:block w-48 2xl:w-64 flex-shrink-0">
            <div className="sticky top-4 pt-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 h-[600px] flex items-center justify-center border border-purple-200">
                <p className="text-sm text-gray-500 text-center">Reklam sahəsi</p>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <CategoryGrid categories={categories} />
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
