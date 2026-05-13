'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Container } from '@/components/layout';
import ProductGrid from '@/components/features/products/ProductGrid';
import { Product } from '@/types';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import BannerAd from '@/components/features/ads/BannerAd';
import { AdPosition } from '@/services/banner.service';

function VipListingsContent() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const paged = await adService.getPaginatedVipAds(page, 20);
        const items: AdListItem[] = paged.data ?? [];
        setTotalItems(paged.totalCount ?? 0);

        // Map AdListItem to Product type
        const mappedProducts: Product[] = items.map((item: AdListItem) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description ?? '',
          price: item.price,
          currency: '₼',
          images: item.image ? [getImageUrl(item.image)] : [],
          category: { id: item.categoryId ?? '0', name: (language === 'ru' && item.categoryRu ? item.categoryRu : item.category) ?? t('common.unknown'), slug: 'unknown' },
          location: { id: '0', city: item.city ?? 'Bakı', cityRu: item.cityRu, region: '', country: 'Azerbaijan' },
          seller: { id: '0', name: item.fullName ?? t('common.user'), email: item.email ?? '', createdAt: new Date(), isVerified: false },
          condition: item.isNew ? 'new' : 'used',
          status: (item.status ?? 'active').toLowerCase() as any,
          viewCount: item.viewCount ?? 0,
          favoriteCount: 0,
          createdAt: new Date(item.createdDate),
          updatedAt: new Date(item.createdDate),
          isPremium: item.isPremium,
          isFeatured: item.isVip,
          isBoosted: item.isBoosted,
          isFavourite: item.isFavourite,
          store: item.isStore ? {
            id: '0',
            name: item.storeName || item.fullName || t('common.store'),
            logo: item.storeLogoUrl ? getImageUrl(item.storeLogoUrl) : undefined,
            slug: item.storeSlug
          } : undefined
        }));

        if (page === 1) {
          setProducts(mappedProducts);
        } else {
          setProducts(prev => [...prev, ...mappedProducts]);
        }

        setHasMore((paged.totalPages ?? 0) > page);
      } catch (error) {
        console.error('Error fetching VIP ads:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchAds();
  }, [page]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <Container>
          <div className="py-4">
            <h1 className="text-[20px] font-bold text-[#212121] tracking-tight">
              {t('vipListings.title')} <span className="text-[#999] font-normal text-[15px] ml-1">({totalItems})</span>
            </h1>
          </div>
        </Container>
      </div>

      <div className="w-full flex">
        {/* Left Banner */}
        <aside className="hidden xl:block flex-1 min-w-[160px] 2xl:min-w-[200px]">
          <div className="sticky top-[64px] h-[calc(100vh-64px)] w-full">
            <BannerAd position={AdPosition.LeftSidebar} className="w-full h-full !rounded-none" noBoard />
          </div>
        </aside>

        {/* Main Content */}
        <div className="w-full max-w-[1024px] mx-auto px-4 lg:px-6 pb-6">
          <div className="w-full py-8">
            {/* Products Grid */}
            {loading && page === 1 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <ProductGrid products={products} title="" emptyMessage={t('vipListings.emptyMessage')} />
                <div ref={lastElementRef} className="h-10 mt-8" />
                {loadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-center text-gray-500 py-8 font-medium">{t('vipListings.allLoaded')}</p>
                )}
              </>
            )}
            </div>
          </div>

        {/* Right Banner */}
        <aside className="hidden xl:block flex-1 min-w-[160px] 2xl:min-w-[200px]">
          <div className="sticky top-[64px] h-[calc(100vh-64px)] w-full">
            <BannerAd position={AdPosition.RightSidebar} className="w-full h-full !rounded-none" noBoard />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function VipListingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <VipListingsContent />
    </Suspense>
  );
}
