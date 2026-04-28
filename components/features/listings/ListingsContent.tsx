'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import FilterPanel from '@/components/features/filters/FilterPanel';
import ProductGrid from '@/components/features/products/ProductGrid';
import { SearchFilters, Product, Category } from '@/types';
import { SORT_OPTIONS, ROUTES } from '@/constants';
import Select, { SelectOption } from '@/components/ui/Select';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl, generateSlug } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ListingsContent({ initialFilters }: { initialFilters?: Partial<SearchFilters> }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [vipProducts, setVipProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const isHeaderVisible = useScrollDirection();

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

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

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || initialFilters?.query || '',
    categoryId: searchParams.get('categoryId') || initialFilters?.categoryId || '',
    subCategoryId: searchParams.get('subCategoryId') || initialFilters?.subCategoryId || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : initialFilters?.minPrice,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : initialFilters?.maxPrice,
    cityId: searchParams.get('cityId') || initialFilters?.cityId || undefined,
    condition: (searchParams.get('condition') as any) || initialFilters?.condition || undefined,
    sortBy: searchParams.get('sortBy') || initialFilters?.sortBy || 'latest',
    isDeliverable: searchParams.get('delivery') === 'true' ? true : (searchParams.get('delivery') === 'false' ? false : initialFilters?.isDeliverable),
    userId: searchParams.get('userId') || initialFilters?.userId || undefined,
    dynamicProperties: {
      ...initialFilters?.dynamicProperties,
      ...Object.fromEntries(
        Array.from(searchParams.entries())
          .filter(([key]) => key.startsWith('p[') && key.endsWith(']'))
          .map(([key, value]) => [key.substring(2, key.length - 1), value])
      )
    },
  });

  // Sync state when URL params or initialFilters change
  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    const currentCat = searchParams.get('categoryId') || initialFilters?.categoryId || '';
    const currentSubCat = searchParams.get('subCategoryId') || initialFilters?.subCategoryId || '';
    const currentMin = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : initialFilters?.minPrice;
    const currentMax = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : initialFilters?.maxPrice;
    const currentCity = searchParams.get('cityId') || initialFilters?.cityId || undefined;
    const currentCondition = (searchParams.get('condition') as any) || initialFilters?.condition || undefined;
    const currentSort = searchParams.get('sortBy') || initialFilters?.sortBy || 'latest';
    const currentDelivery = searchParams.get('delivery') === 'true' ? true : (searchParams.get('delivery') === 'false' ? false : initialFilters?.isDeliverable);
    const currentUser = searchParams.get('userId') || initialFilters?.userId || undefined;

    const currentDynamic = {
      ...initialFilters?.dynamicProperties,
      ...Object.fromEntries(
        Array.from(searchParams.entries())
          .filter(([key]) => key.startsWith('p[') && key.endsWith(']'))
          .map(([key, value]) => [key.substring(2, key.length - 1), value])
      )
    };

    const newFilters: SearchFilters = {
      query: currentQ,
      categoryId: currentCat,
      subCategoryId: currentSubCat,
      minPrice: currentMin,
      maxPrice: currentMax,
      cityId: currentCity,
      condition: currentCondition,
      sortBy: currentSort,
      isDeliverable: currentDelivery,
      dynamicProperties: currentDynamic,
      userId: currentUser,
    };

    // Deep comparison to prevent infinite loops
    const hasChanged = JSON.stringify(newFilters) !== JSON.stringify(filters);

    if (hasChanged) {
      setFilters(newFilters);
      setPage(1);
      setProducts([]);
    }
  }, [searchParams, initialFilters, filters]);

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(Math.round(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handleCarouselScroll();
    window.addEventListener('resize', handleCarouselScroll);
    return () => window.removeEventListener('resize', handleCarouselScroll);
  }, [categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const tree = await adService.getCategoryTree();
        if (tree && tree.length > 0) {
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

          const mapped = tree.map((cat: any) => ({
            id: cat.id,
            name: language === 'ru' && cat.nameRu ? cat.nameRu : cat.name,
            icon: ICONS[cat.name] || 'category',
            image: LOCAL_IMAGES[cat.name] || getImageUrl(cat.imageUrl),
            slug: generateSlug(cat.name),
            categoryFields: cat.categoryFields || [],
            subCategories: cat.subCategories?.map((sc: any) => ({
              ...sc,
              name: language === 'ru' && sc.nameRu ? sc.nameRu : sc.name,
              parentSlug: generateSlug(cat.name),
              image: getImageUrl(sc.imageUrl)
            })) || [],
            children: cat.children?.map((child: any) => ({
              id: child.id,
              name: language === 'ru' && child.nameRu ? child.nameRu : child.name,
              slug: generateSlug(child.name),
              image: getImageUrl(child.imageUrl),
              parentId: cat.id,
              parentSlug: generateSlug(cat.name),
              categoryFields: child.categoryFields || [],
              subCategories: child.subCategories?.map((sc: any) => ({
                ...sc,
                name: language === 'ru' && sc.nameRu ? sc.nameRu : sc.name,
                parentSlug: `${generateSlug(cat.name)}/${generateSlug(child.name)}`,
                image: getImageUrl(sc.imageUrl)
              })) || [],
              children: child.children?.map((gc: any) => ({
                id: gc.id,
                name: language === 'ru' && gc.nameRu ? gc.nameRu : gc.name,
                slug: generateSlug(gc.name),
                image: getImageUrl(gc.imageUrl),
                parentId: child.id,
                parentSlug: `${generateSlug(cat.name)}/${generateSlug(child.name)}`,
                categoryFields: gc.categoryFields || [],
                subCategories: gc.subCategories?.map((sc: any) => ({
                  ...sc,
                  name: language === 'ru' && sc.nameRu ? sc.nameRu : sc.name,
                  parentSlug: `${generateSlug(cat.name)}/${generateSlug(child.name)}/${generateSlug(gc.name)}`,
                  image: getImageUrl(sc.imageUrl)
                })) || []
              })) || []
            })) || []
          }));
          setCategories(mapped);
        }
      } catch (e) {
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [language]);

  useEffect(() => {
    const fetchVipAds = async () => {
      try {
        const ads = await adService.getVipAds({
          categoryId: filters.categoryId,
          subCategoryId: filters.subCategoryId,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          search: filters.query,
          cityId: filters.cityId,
          isNew: filters.condition === 'new' ? true : (filters.condition === 'used' ? false : undefined),
          isDeliverable: filters.isDeliverable,
          userId: filters.userId,
          ...Object.fromEntries(
            Object.entries(filters.dynamicProperties || {}).map(([id, val]) => [`p[${id}]`, val])
          )
        } as any);
        const mappedProducts: Product[] = ads.map((item: AdListItem) => ({
          id: item.id.toString(),
          title: item.title,
          slug: item.slug,
          description: item.description ?? '',
          price: item.price,
          currency: '₼',
          images: item.image ? [getImageUrl(item.image)] : [],
          category: {
            id: item.categoryId ?? '0',
            name: language === 'ru' && item.categoryRu ? item.categoryRu : (item.category ?? 'Unknown'),
            slug: item.parentCategorySlug || (item.category ? generateSlug(item.category) : 'unknown')
          },
          subCategory: item.childCategorySlug ? {
            id: item.subCategoryId ?? '0',
            name: '',
            slug: item.childCategorySlug
          } : undefined,
          location: { id: '0', city: item.city ?? 'Bakı', cityRu: item.cityRu, region: '', country: 'Azerbaijan' },
          seller: { id: '0', name: item.fullName ?? 'User', email: item.email ?? '', createdAt: new Date(), isVerified: false },
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
            id: '',
            name: item.storeName || item.fullName || 'Mağaza',
            logo: item.storeLogoUrl ? getImageUrl(item.storeLogoUrl) : undefined,
            slug: item.storeSlug
          } : undefined,
        }));
        setVipProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching vip ads:', error);
      }
    };
    fetchVipAds();
  }, [filters, language]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const paged = await adService.getAllAds({
          pageNumber: page,
          pageSize: 20,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          search: filters.query,
          categoryId: filters.categoryId,
          subCategoryId: filters.subCategoryId,
          cityId: filters.cityId,
          isNew: filters.condition === 'new' ? true : (filters.condition === 'used' ? false : undefined),
          isDeliverable: filters.isDeliverable,
          sortBy: filters.sortBy !== 'latest' ? filters.sortBy : undefined,
          userId: filters.userId,
          ...Object.fromEntries(
            Object.entries(filters.dynamicProperties || {}).map(([id, val]) => [`p[${id}]`, val])
          )
        });
        const items: AdListItem[] = paged.data ?? [];
        setTotalElements(paged.totalCount ?? 0);

        const mappedProducts: Product[] = items.map((item: AdListItem) => ({
          id: item.id.toString(),
          title: item.title,
          slug: item.slug,
          description: item.description ?? '',
          price: item.price,
          currency: '₼',
          images: item.image ? [getImageUrl(item.image)] : [],
          category: {
            id: item.categoryId ?? '0',
            name: language === 'ru' && item.categoryRu ? item.categoryRu : (item.category ?? 'Unknown'),
            slug: item.parentCategorySlug || (item.category ? generateSlug(item.category) : 'unknown')
          },
          subCategory: item.childCategorySlug ? {
            id: item.subCategoryId ?? '0',
            name: '',
            slug: item.childCategorySlug
          } : undefined,
          location: { id: '0', city: item.city ?? 'Bakı', cityRu: item.cityRu, region: '', country: 'Azerbaijan' },
          seller: { id: '0', name: item.fullName ?? 'User', email: item.email ?? '', createdAt: new Date(), isVerified: false },
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
            id: '',
            name: item.storeName || item.fullName || 'Mağaza',
            logo: item.storeLogoUrl ? getImageUrl(item.storeLogoUrl) : undefined,
            slug: item.storeSlug
          } : undefined,
        }));

        if (page === 1) {
          setProducts(mappedProducts);
        } else {
          setProducts(prev => [...prev, ...mappedProducts]);
        }

        setHasMore((paged.totalPages ?? 0) > page);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchAds();
  }, [filters, page, language]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.query) params.set('q', newFilters.query); else params.delete('q');
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId); else params.delete('categoryId');
    if (newFilters.subCategoryId) params.set('subCategoryId', newFilters.subCategoryId); else params.delete('subCategoryId');
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString()); else params.delete('minPrice');
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString()); else params.delete('maxPrice');
    if (newFilters.cityId) params.set('cityId', newFilters.cityId); else params.delete('cityId');
    if (newFilters.condition) params.set('condition', newFilters.condition); else params.delete('condition');
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy); else params.delete('sortBy');
    if (newFilters.userId) params.set('userId', newFilters.userId); else params.delete('userId');
    if (newFilters.isDeliverable === true) params.set('delivery', 'true');
    else if (newFilters.isDeliverable === false) params.set('delivery', 'false');
    else params.delete('delivery');

    // Clean dynamic properties from searchParams first
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith('p[')) params.delete(key);
    });

    if (newFilters.dynamicProperties) {
      Object.entries(newFilters.dynamicProperties).forEach(([id, val]) => {
        if (val) params.set(`p[${id}]`, val);
      });
    }

    // Use the current pathname to maintain clean URLs if possible, or fallback to /elanlar
    const pathname = window.location.pathname;
    const isElanlarPath = pathname.startsWith('/elanlar');
    const basePath = isElanlarPath ? pathname : '/elanlar';

    const newPath = `${basePath}?${params.toString()}`;
    router.push(newPath);
  };

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const fetched = await adService.getCities();
        setCities(fetched);
      } catch (e) { }
    };
    fetchCities();
  }, [language]);

  const getCityLabel = () => {
    if (!filters.cityId) return t('listings.city');
    const cityIdStr = filters.cityId.toString();
    const city = cities.find(c => c.id.toString() === cityIdStr);
    return (language === 'ru' && city?.nameRu ? city.nameRu : city?.name) || t('listings.city');
  };

  const getPriceLabel = () => {
    if (!filters.minPrice && !filters.maxPrice) return t('listings.price');
    if (filters.minPrice && filters.maxPrice) return `${filters.minPrice} - ${filters.maxPrice} ₼`;
    if (filters.minPrice) return `${t('listings.minPrice')} ${filters.minPrice} ₼`;
    return `${t('listings.maxPrice')} ${filters.maxPrice} ₼`;
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <Container className="pt-3 sm:pt-6 pb-8 px-3 sm:px-6">
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <h1 className="text-[17px] sm:text-[20px] font-bold text-[#212121] tracking-tight">
              {t('listings.allCategories')} <span className="text-[#999] font-normal text-[13px] sm:text-[15px] ml-1">({totalElements})</span>
            </h1>
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined !text-[18px]">tune</span>
              {t('listings.filter')}
            </button>
          </div>
        </div>

        {/* STICKY MOBILE BAR */}
        <div className={`z-[91] bg-white/95 backdrop-blur-md sticky lg:relative transition-all duration-300 ease-in-out -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 pt-2 pb-2 mb-2 top-[112px] sm:top-[116px] lg:top-auto lg:!translate-y-0 lg:!opacity-100 lg:!pointer-events-auto ${isHeaderVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-[150px] opacity-0 pointer-events-none'
          }`}>
          <div className="relative group lg:mb-0 mb-3">
            {showLeftScroll && (
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-11 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                aria-label={t('listings.slideLeft')}>
                <span className="material-symbols-outlined !text-[#212121]">chevron_left</span>
              </button>
            )}

            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto overscroll-x-contain scrollbar-hide gap-3 pb-2 items-start scroll-smooth"
            >
              {categoriesLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-[10px] flex-shrink-0 w-[88px] animate-pulse">
                    <div className="w-[88px] h-[88px] bg-gray-100 rounded-2xl"></div>
                    <div className="h-3 w-16 bg-gray-100 rounded"></div>
                  </div>
                ))
              ) : (
                (() => {
                  const allCategoriesFlattened: any[] = [];
                  const flatten = (items: any[]) => {
                    items.forEach(item => {
                      allCategoriesFlattened.push(item);
                      if (item.children) flatten(item.children);
                      if (item.subCategories) flatten(item.subCategories);
                    });
                  };
                  flatten(categories);

                  const currentCategoryId = filters.categoryId;
                  const currentSubCategoryId = filters.subCategoryId;

                  const activeCat = allCategoriesFlattened.find(c => c.id === currentCategoryId);
                  const activeSub = allCategoriesFlattened.find(c => c.id === currentSubCategoryId);

                  let itemsToShow: any[] = [];
                  let backHref = '/elanlar';

                  if (!currentCategoryId) {
                    itemsToShow = categories;
                  } else if (currentCategoryId && !currentSubCategoryId) {
                    const combinedChildren = [
                      ...(activeCat?.children || []),
                      ...(activeCat?.subCategories || [])
                    ];

                    if (combinedChildren.length > 0) {
                      itemsToShow = combinedChildren;
                      const parent = allCategoriesFlattened.find(c => c.children?.some((ch: any) => ch.id === currentCategoryId));
                      backHref = parent?.slug ? ROUTES.CATEGORY(parent.slug) : '/elanlar';
                    } else {
                      const parent = allCategoriesFlattened.find(c => c.children?.some((ch: any) => ch.id === currentCategoryId));
                      const combinedBrother = [
                        ...(parent?.children || []),
                        ...(parent?.subCategories || [])
                      ];
                      itemsToShow = combinedBrother;

                      if (parent) {
                        backHref = parent.slug ? ROUTES.CATEGORY(parent.slug) : `/elanlar?categoryId=${parent.id}`;
                      } else {
                        backHref = '/elanlar';
                      }
                    }
                  } else {
                    const parent = allCategoriesFlattened.find(c => (c.subCategories || c.children)?.some((sc: any) => sc.id === currentSubCategoryId));
                    if (parent) {
                      itemsToShow = (parent.subCategories || parent.children) || [];
                      backHref = parent.slug ? ROUTES.CATEGORY(parent.slug) : `/elanlar?categoryId=${currentCategoryId}`;
                    }
                  }

                  return (
                    <>
                      {currentCategoryId && (
                        <Link href={backHref} key="back-button" className="group flex flex-col items-center gap-[10px] flex-shrink-0 w-[88px]">
                          <div className="flex items-center justify-center w-[88px] h-[88px] bg-[#f1f2f4] rounded-2xl group-hover:bg-[#e9e9eb] transition-colors">
                            <span className="material-symbols-outlined !text-[32px] text-[#212121] transition-colors">
                              arrow_back
                            </span>
                          </div>
                          <span className="text-[13px] text-[#212121] text-center leading-[1.3] px-1">
                            {t('listings.back')}
                          </span>
                        </Link>
                      )}

                      {itemsToShow.map((item: any) => {
                        const isActive = currentCategoryId === item.id || currentSubCategoryId === item.id;

                        let href = '/elanlar';
                        if (item.parentSlug && item.slug) {
                          href = `/elanlar/${item.parentSlug}/${item.slug}`;
                        } else if (item.slug) {
                          href = `/elanlar/${item.slug}`;
                        } else {
                          href = `/elanlar?categoryId=${item.id}`;
                        }

                        return (
                          <Link
                            href={href}
                            key={item.id}
                            className="group flex flex-col items-center gap-[10px] flex-shrink-0 w-[88px]"
                          >
                            <div className={`flex items-center justify-center w-[88px] h-[88px] rounded-2xl transition-colors overflow-hidden ${isActive ? 'bg-[#607afb]/10 ring-2 ring-[#607afb]/20' : 'bg-[#f1f2f4] group-hover:bg-[#e9e9eb]'}`}>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain scale-[1.4] -translate-x-5 translate-y-0 transition-all duration-500 group-hover:scale-[1.5]"
                                />
                              ) : (
                                <span className={`material-symbols-outlined !text-[32px] transition-colors ${isActive ? 'text-[#607afb]' : 'text-[#212121]'}`}>
                                  {item.icon || 'category'}
                                </span>
                              )}
                            </div>
                            <span className={`text-[13px] text-center leading-[1.3] px-1 line-clamp-2 ${isActive ? 'text-[#607afb] font-bold' : 'text-[#212121]'}`}>
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}
                    </>
                  );
                })()
              )}
            </div>

            {showRightScroll && (
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-11 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                aria-label={t('listings.slideRight')}>
                <span className="material-symbols-outlined !text-[#212121]">chevron_right</span>
              </button>
            )}
          </div>

          {/* Mobile Filter Pills Row - Moved here to stick with categories! */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto overscroll-x-contain scrollbar-hide">
            <button
              onClick={() => setIsSortModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap ${filters.sortBy !== 'latest' && filters.sortBy !== undefined ? 'bg-primary text-white' : 'bg-[#f1f3f7] text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span className="material-symbols-outlined !text-[18px]">sort</span>
              <span>{filters.sortBy === 'cheap' ? t('listings.sortByCheap') : filters.sortBy === 'expensive' ? t('listings.sortByExpensive') : t('listings.sortByDate')}</span>
              <span className="material-symbols-outlined !text-[18px]">expand_more</span>
            </button>

            <button
              onClick={() => setIsPriceModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap ${filters.minPrice || filters.maxPrice ? 'bg-primary text-white' : 'bg-[#f1f3f7] text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span>{getPriceLabel()}</span>
              <span className="material-symbols-outlined !text-[18px]">expand_more</span>
            </button>

            <button
              onClick={() => setIsCityModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap ${filters.cityId ? 'bg-primary text-white' : 'bg-[#f1f3f7] text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span>{getCityLabel()}</span>
              <span className="material-symbols-outlined !text-[18px]">expand_more</span>
            </button>
          </div>
        </div>

        {/* Mobile Filter Panel (slide-down) */}
        {isMobileFilterOpen && (
          <div className="lg:hidden mb-4 bg-gray-50 rounded-2xl p-4 border border-gray-200 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#212121]">{t('listings.filters')}</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <span className="material-symbols-outlined !text-[22px]">close</span>
              </button>
            </div>
            <FilterPanel filters={filters} onFilterChange={(f) => { handleFilterChange(f); setIsMobileFilterOpen(false); }} categories={categories} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-8 items-start mt-2 sm:mt-6">
          <aside className="lg:col-span-1 hidden lg:block sticky top-24 w-full pr-2 pb-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-[#212121] font-bold text-[15px] mb-3">{t('listings.allCategories')}</h3>
              <ul className="space-y-[10px] pl-2">
                {categoriesLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <li key={i} className="animate-pulse flex items-center gap-2">
                      <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                    </li>
                  ))
                ) : (
                  categories.map(c => {
                    const isParentSelected = filters.categoryId === c.id;
                    const children = (c as any).children || [];
                    const hasSelectedChild = children.some((ch: any) =>
                      filters.categoryId === ch.id ||
                      ch.children?.some((sub: any) => filters.subCategoryId === sub.id)
                    );

                    return (
                      <li key={c.id}>
                        <Link href={`/elanlar/${c.slug}`} className={`text-[14px] hover:text-[#607afb] transition-colors ${isParentSelected ? 'text-[#607afb] font-bold' : 'text-[#4e4e4e]'}`}>
                          {c.name}
                        </Link>
                        {(isParentSelected || hasSelectedChild) && children.length > 0 && (
                          <ul className="mt-2 ml-4 space-y-2 border-l border-gray-100 pl-3">
                            {children.map((child: any) => {
                              const isChildSelected = filters.categoryId === child.id;
                              const subCategories = child.children || [];
                              const hasSelectedSub = subCategories.some((sub: any) => filters.subCategoryId === sub.id);

                              return (
                                <li key={child.id}>
                                  <Link
                                    href={`/elanlar/${c.slug}/${child.slug}`}
                                    className={`text-[13px] hover:text-[#607afb] transition-colors ${(isChildSelected || hasSelectedSub) ? 'text-[#607afb] font-semibold' : 'text-gray-500'}`}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} categories={categories} />
          </aside>

          <div className="lg:col-span-3">

            <div className="hidden lg:flex items-center mb-3 sm:mb-6">
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className={`flex items-center gap-2 px-[14px] py-[8px] bg-white border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-[#212121] select-none text-[14px] ${isSortOpen ? 'border-gray-400 shadow-sm bg-gray-50' : 'border-gray-200'}`}
                >
                  <span className={`material-symbols-outlined !text-[18px] transition-colors ${filters.sortBy !== 'latest' && filters.sortBy !== undefined ? 'text-[#607afb]' : 'text-gray-500'}`}>
                    sort
                  </span>
                  <span className="pt-px">
                    {filters.sortBy === 'cheap' ? t('listings.sortByCheap') : filters.sortBy === 'expensive' ? t('listings.sortByExpensive') : t('listings.sortByDate')}
                  </span>
                  <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isSortOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[200px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1.5 z-50 border border-gray-100 flex flex-col">
                    <button
                      onClick={() => { handleFilterChange({ ...filters, sortBy: 'latest' }); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#f1f2f4] text-[14px] transition-colors flex items-center justify-between ${filters.sortBy === 'latest' || filters.sortBy === undefined ? 'text-[#607afb] font-medium' : 'text-[#212121]'}`}
                    >
                      {t('listings.sortByDate')}
                      {(filters.sortBy === 'latest' || filters.sortBy === undefined) && <span className="material-symbols-outlined !text-[18px]">check</span>}
                    </button>
                    <button
                      onClick={() => { handleFilterChange({ ...filters, sortBy: 'cheap' }); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#f1f2f4] text-[14px] transition-colors flex items-center justify-between ${filters.sortBy === 'cheap' ? 'text-[#607afb] font-medium' : 'text-[#212121]'}`}
                    >
                      {t('listings.sortByCheap')}
                      {filters.sortBy === 'cheap' && <span className="material-symbols-outlined !text-[18px]">check</span>}
                    </button>
                    <button
                      onClick={() => { handleFilterChange({ ...filters, sortBy: 'expensive' }); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#f1f2f4] text-[14px] transition-colors flex items-center justify-between ${filters.sortBy === 'expensive' ? 'text-[#607afb] font-medium' : 'text-[#212121]'}`}
                    >
                      {t('listings.sortByExpensive')}
                      {filters.sortBy === 'expensive' && <span className="material-symbols-outlined !text-[18px]">check</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {vipProducts.length > 0 && page === 1 && (
              <div className="mb-10">
                <div className="flex items-end justify-between mb-[14px]">
                  <h2 className="text-[16px] text-[#212121] font-normal">{t('listings.vipAds')}</h2>
                  <Link href="/elanlar/vip" className="text-[14px] text-[#0057e6] hover:underline">
                    {t('listings.allAds')}
                  </Link>
                </div>
                <ProductGrid
                  products={vipProducts}
                  emptyMessage=""
                />
              </div>
            )}

            {loading && page === 1 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#607afb]"></div>
              </div>
            ) : (
              <>
                <div className="mb-[14px]">
                  <h2 className="text-[16px] text-[#212121] font-normal">{t('listings.ads')}</h2>
                </div>
                <ProductGrid products={products} />
                <div ref={lastElementRef} className="h-10 mt-8" />
                {loadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#607afb]"></div>
                  </div>
                )}
                {/* End of list message removed as per user request */}
              </>
            )}
          </div>
        </div>
      </Container>

      {/* Price Filter Modal */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        title={t('listings.price')}
      >
        <div className="p-4 sm:p-0">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 ml-1">{t('listings.minimum')}</label>
              <input
                type="number"
                placeholder={t('listings.minPrice')}
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-12 px-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-primary/20 focus:bg-white transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 ml-1">{t('listings.maximum')}</label>
              <input
                type="number"
                placeholder={t('listings.maxPrice')}
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-12 px-4 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-primary/20 focus:bg-white transition-all"
              />
            </div>
          </div>
          <Button
            className="w-full h-12 rounded-xl font-bold"
            onClick={() => setIsPriceModalOpen(false)}
          >
            {t('listings.showResults')}
          </Button>
        </div>
      </Modal>

      {/* City Filter Modal */}
      <Modal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        title={t('listings.city')}
      >
        <div className="flex-1 overflow-y-auto p-4 sm:p-0 space-y-1">
          <button
            onClick={() => { handleFilterChange({ ...filters, cityId: undefined }); setIsCityModalOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${!filters.cityId ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            {t('listings.allCities')}
          </button>
          {cities.map(city => (
            <button
              key={city.id}
              onClick={() => { handleFilterChange({ ...filters, cityId: city.id.toString() }); setIsCityModalOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${filters.cityId?.toString() === city.id.toString() ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              {language === 'ru' && city.nameRu ? city.nameRu : city.name}
            </button>
          ))}
        </div>
      </Modal>

      {/* Sort Filter Modal */}
      <Modal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        title={t('listings.sort')}
      >
        <div className="p-4 sm:p-0 space-y-1">
          <button
            onClick={() => { handleFilterChange({ ...filters, sortBy: 'latest' }); setIsSortModalOpen(false); }}
            className={`w-full text-left px-4 py-4 rounded-xl transition-colors ${filters.sortBy === 'latest' || !filters.sortBy ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            {t('listings.sortByDate')}
          </button>
          <button
            onClick={() => { handleFilterChange({ ...filters, sortBy: 'cheap' }); setIsSortModalOpen(false); }}
            className={`w-full text-left px-4 py-4 rounded-xl transition-colors ${filters.sortBy === 'cheap' ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            {t('listings.sortByCheap')}
          </button>
          <button
            onClick={() => { handleFilterChange({ ...filters, sortBy: 'expensive' }); setIsSortModalOpen(false); }}
            className={`w-full text-left px-4 py-4 rounded-xl transition-colors ${filters.sortBy === 'expensive' ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            {t('listings.sortByExpensive')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
