'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import FilterPanel from '@/components/features/filters/FilterPanel';
import ProductGrid from '@/components/features/products/ProductGrid';
import { SearchFilters, Product, Category } from '@/types';
import { SORT_OPTIONS } from '@/constants';
import Select, { SelectOption } from '@/components/ui/Select';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [vipProducts, setVipProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
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
    query: searchParams.get('q') || '',
    categoryId: searchParams.get('categoryId') || '',
    subCategoryId: searchParams.get('subCategoryId') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    cityId: searchParams.get('cityId') || undefined,
    condition: searchParams.get('condition') as any || undefined,
    sortBy: searchParams.get('sortBy') || 'latest',
    isDeliverable: searchParams.get('delivery') === 'true' ? true : (searchParams.get('delivery') === 'false' ? false : undefined),
    dynamicProperties: Object.fromEntries(
      Array.from(searchParams.entries())
        .filter(([key]) => key.startsWith('p[') && key.endsWith(']'))
        .map(([key, value]) => [key.substring(2, key.length - 1), value])
    ),
  });

  // Sync state when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      query: searchParams.get('q') || '',
      categoryId: searchParams.get('categoryId') || '',
      subCategoryId: searchParams.get('subCategoryId') || '',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      cityId: searchParams.get('cityId') || undefined,
      condition: searchParams.get('condition') as any || undefined,
      sortBy: searchParams.get('sortBy') || 'latest',
      isDeliverable: searchParams.get('delivery') === 'true' ? true : (searchParams.get('delivery') === 'false' ? false : undefined),
      dynamicProperties: Object.fromEntries(
        Array.from(searchParams.entries())
          .filter(([key]) => key.startsWith('p[') && key.endsWith(']'))
          .map(([key, value]) => [key.substring(2, key.length - 1), value])
      ),
    }));
    setPage(1);
    setProducts([]);
  }, [searchParams]);

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
          const mapped = tree.map((cat: any) => ({
             id: cat.id, 
             name: cat.name, 
             icon: ICONS[cat.name] || 'category', 
             slug: cat.name.toLowerCase().replace(/[^a-z0-9_]+/g, '-'),
             children: cat.children?.map((child: any) => ({
               id: child.id,
               name: child.name,
               parentId: cat.id,
               children: child.children?.map((gc: any) => ({
                 id: gc.id,
                 name: gc.name,
                 parentId: child.id,
                 subCategories: gc.subCategories || []
               })),
               subCategories: child.subCategories || []
             }))
          }));
          setCategories(mapped);
        }
      } catch(e) {}
    };
    fetchCategories();
  }, []);

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
          ...Object.fromEntries(
            Object.entries(filters.dynamicProperties || {}).map(([id, val]) => [`p[${id}]`, val])
          )
        } as any);
        const mappedProducts: Product[] = ads.map((item: AdListItem) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description ?? '',
          price: item.price,
          currency: '₼',
          images: item.image ? [getImageUrl(item.image)] : [],
          category: { id: item.categoryId ?? '0', name: item.category ?? 'Unknown', slug: 'unknown' },
          location: { id: '0', city: item.city ?? 'Bakı', region: '', country: 'Azerbaijan' },
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
        }));
        setVipProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching vip ads:', error);
      }
    };
    fetchVipAds();
  }, [filters]);

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
          ...Object.fromEntries(
            Object.entries(filters.dynamicProperties || {}).map(([id, val]) => [`p[${id}]`, val])
          )
        });
        const items: AdListItem[] = paged.data ?? [];
        setTotalElements(paged.totalCount ?? 0);

        // Map AdListItem to Product type
        const mappedProducts: Product[] = items.map((item: AdListItem) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description ?? '',
          price: item.price,
          currency: '₼',
          images: item.image ? [getImageUrl(item.image)] : [],
          category: { id: item.categoryId ?? '0', name: item.category ?? 'Unknown', slug: 'unknown' },
          location: { id: '0', city: item.city ?? 'Bakı', region: '', country: 'Azerbaijan' },
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
  }, [filters, page]); 

  const handleFilterChange = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId);
    if (newFilters.subCategoryId) params.set('subCategoryId', newFilters.subCategoryId);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.cityId) params.set('cityId', newFilters.cityId);
    if (newFilters.condition) params.set('condition', newFilters.condition);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.isDeliverable === true) params.set('delivery', 'true');
    else if (newFilters.isDeliverable === false) params.set('delivery', 'false');
    
    if (newFilters.dynamicProperties) {
      Object.entries(newFilters.dynamicProperties).forEach(([id, val]) => {
        if (val) params.set(`p[${id}]`, val);
      });
    }
    
    const newUrl = `/listings?${params.toString()}`;
    const currentUrl = `/listings?${searchParams.toString()}`;
    
    if (newUrl !== currentUrl) {
      router.push(newUrl);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <Container className="pt-6 pb-8">
        {/* Header Section */}
        <div className="mb-4">
          <h1 className="text-[20px] font-bold text-[#212121] mb-6 tracking-tight">
            Bütün kateqoriyalar <span className="text-[#999] font-normal text-[15px] ml-1">({totalElements})</span>
          </h1>

          {/* Categories Carousel */}
          <div className="relative group">
            {showLeftScroll && (
              <button 
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-11 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                aria-label="Sola sürüşdür"
              >
                <span className="material-symbols-outlined !text-[#212121]">chevron_left</span>
              </button>
            )}
            
            <div 
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 items-start scroll-smooth"
            >
                  {(() => {
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
                    let backHref = '/listings';

                    if (!currentCategoryId) {
                      itemsToShow = categories;
                    } else if (currentCategoryId && !currentSubCategoryId) {
                      // Level 1: Category. If it has Children OR SubCategories (Brands), show them.
                      const combinedChildren = [
                        ...(activeCat?.children || []),
                        ...(activeCat?.subCategories || [])
                      ];
                      
                      if (combinedChildren.length > 0) {
                        itemsToShow = combinedChildren;
                        const parent = allCategoriesFlattened.find(c => c.children?.some((ch: any) => ch.id === currentCategoryId));
                        backHref = parent ? `/listings?categoryId=${parent.id}` : '/listings';
                      } else {
                        const parent = allCategoriesFlattened.find(c => c.children?.some((ch: any) => ch.id === currentCategoryId));
                        const combinedBrother = [
                          ...(parent?.children || []),
                          ...(parent?.subCategories || [])
                        ];
                        itemsToShow = combinedBrother;
                        backHref = parent?.parentId ? `/listings?categoryId=${parent.parentId}` : '/listings';
                      }
                    } else {
                      // Level 2: SubCategory selected. Show its brothers.
                      const parent = allCategoriesFlattened.find(c => c.subCategories?.some((sc: any) => sc.id === currentSubCategoryId));
                      if (parent) {
                         itemsToShow = parent.subCategories || [];
                         backHref = `/listings?categoryId=${currentCategoryId}`;
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
                                  Geri
                               </span>
                          </Link>
                        )}
                        
                        {itemsToShow.map((item: any) => {
                          const isActive = currentCategoryId === item.id || currentSubCategoryId === item.id;
                          const hasChildren = (item.children?.length || 0) > 0 || (item.subCategories?.length || 0) > 0;
                          
                          let href = `/listings?categoryId=${item.id}`;
                          
                          // Correct DTO mapping for link generation
                          const isSubCategory = item.categoryId !== undefined; // SubCategoryDto has categoryId prop
                          
                          if (currentCategoryId && !currentSubCategoryId) {
                             if (isSubCategory) {
                                href = `/listings?categoryId=${currentCategoryId}&subCategoryId=${item.id}`;
                             } else if (hasChildren) {
                                href = `/listings?categoryId=${item.id}`;
                             }
                          } else if (currentSubCategoryId) {
                             href = `/listings?categoryId=${currentCategoryId}&subCategoryId=${item.id}`;
                          }

                          return (
                            <Link 
                              href={href}
                              key={item.id} 
                              className="group flex flex-col items-center gap-[10px] flex-shrink-0 w-[88px]"
                            >
                               <div className={`flex items-center justify-center w-[88px] h-[88px] rounded-2xl transition-colors overflow-hidden ${isActive ? 'bg-[#ff4f08]/10 ring-2 ring-[#ff4f08]/20' : 'bg-[#f1f2f4] group-hover:bg-[#e9e9eb]'}`}>
                                  {item.image ? (
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      className="w-full h-full object-contain p-2"
                                    />
                                  ) : (
                                    <span className={`material-symbols-outlined !text-[32px] transition-colors ${isActive ? 'text-[#ff4f08]' : 'text-[#212121]'}`}>
                                      {item.icon || 'category'}
                                    </span>
                                  )}
                               </div>
                               <span className={`text-[13px] text-center leading-[1.3] px-1 line-clamp-2 ${isActive ? 'text-[#ff4f08] font-bold' : 'text-[#212121]'}`}>
                                  {item.name}
                                </span>
                            </Link>
                          );
                        })}
                      </>
                    );
                  })()}
            </div>

            {showRightScroll && (
              <button 
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-11 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                aria-label="Sağa sürüşdür"
              >
                <span className="material-symbols-outlined !text-[#212121]">chevron_right</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-8 items-start mt-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block sticky top-24 w-full pr-2 pb-8 max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {/* Sidebar Categories List */}
            <div className="mb-6">
               <h3 className="text-[#212121] font-bold text-[15px] mb-3">Bütün kateqoriyalar</h3>
               <ul className="space-y-[10px] pl-2">
                  {categories.map(c => {
                    const isParentSelected = filters.categoryId === c.id;
                    const children = (c as any).children || [];
                    // Check if any child or grandchild(subcategory) is selected
                    const hasSelectedChild = children.some((ch: any) => 
                      filters.categoryId === ch.id || 
                      ch.children?.some((sub: any) => filters.subCategoryId === sub.id)
                    );
                    
                    return (
                      <li key={c.id}>
                        <Link href={`/listings?categoryId=${c.id}`} className={`text-[14px] hover:text-[#ff4f08] transition-colors ${isParentSelected ? 'text-[#ff4f08] font-bold' : 'text-[#4e4e4e]'}`}>
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
                                    href={`/listings?categoryId=${child.id}`} 
                                    className={`text-[13px] hover:text-[#ff4f08] transition-colors ${(isChildSelected || hasSelectedSub) ? 'text-[#ff4f08] font-semibold' : 'text-gray-500'}`}
                                  >
                                    {child.name}
                                  </Link>
                                  {(isChildSelected || hasSelectedSub) && subCategories.length > 0 && (
                                    <ul className="mt-2 ml-4 space-y-2 border-l border-gray-100 pl-3">
                                      {subCategories.map((sub: any) => (
                                        <li key={sub.id}>
                                          <Link 
                                            href={`/listings?categoryId=${child.id}&subCategoryId=${sub.id}`} 
                                            className={`text-[12px] hover:text-[#ff4f08] transition-colors ${filters.subCategoryId === sub.id ? 'text-[#ff4f08] font-semibold' : 'text-gray-400'}`}
                                          >
                                            {sub.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
               </ul>
            </div>
            {/* Filter Panel */}
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} categories={categories} />
          </aside>

          {/* Mobile Filter Button (Visible on mobile only) */}
          <div className="lg:hidden mb-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm w-full font-medium text-gray-700 justify-center">
              <span className="material-symbols-outlined">filter_list</span>
              Filtrlər
            </button>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center mb-6">
               <div className="relative" ref={sortRef}>
                 <button 
                   onClick={() => setIsSortOpen(!isSortOpen)}
                   className={`flex items-center gap-2 px-[14px] py-[8px] bg-white border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-[#212121] select-none text-[14px] ${isSortOpen ? 'border-gray-400 shadow-sm bg-gray-50' : 'border-gray-200'}`}
                 >
                    <span className={`material-symbols-outlined !text-[18px] transition-colors ${filters.sortBy !== 'latest' && filters.sortBy !== undefined ? 'text-[#ff4f08]' : 'text-gray-500'}`}>
                      sort
                    </span>
                    <span className="pt-px">
                      {filters.sortBy === 'cheap' ? 'Öncə ucuz' : filters.sortBy === 'expensive' ? 'Öncə baha' : 'Tarix üzrə'}
                    </span>
                    <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                 </button>
                 
                 {isSortOpen && (
                   <div className="absolute top-full left-0 mt-2 w-[200px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1.5 z-50 border border-gray-100 flex flex-col">
                     <button 
                       onClick={() => { handleFilterChange({ ...filters, sortBy: 'latest' }); setIsSortOpen(false); }}
                       className={`w-full text-left px-4 py-2.5 hover:bg-[#f1f2f4] text-[14px] transition-colors flex items-center justify-between ${filters.sortBy === 'latest' || filters.sortBy === undefined ? 'text-[#ff4f08] font-medium' : 'text-[#212121]'}`}
                     >
                       Tarix üzrə
                       {(filters.sortBy === 'latest' || filters.sortBy === undefined) && <span className="material-symbols-outlined !text-[18px]">check</span>}
                     </button>
                     <button 
                       onClick={() => { handleFilterChange({ ...filters, sortBy: 'cheap' }); setIsSortOpen(false); }}
                       className={`w-full text-left px-4 py-2.5 hover:bg-[#f1f2f4] text-[14px] transition-colors flex items-center justify-between ${filters.sortBy === 'cheap' ? 'text-[#ff4f08] font-medium' : 'text-[#212121]'}`}
                     >
                       Öncə ucuz
                       {filters.sortBy === 'cheap' && <span className="material-symbols-outlined !text-[18px]">check</span>}
                     </button>
                     <button 
                       onClick={() => { handleFilterChange({ ...filters, sortBy: 'expensive' }); setIsSortOpen(false); }}
                       className={`w-full text-left px-4 py-2.5 hover:bg-[#f1f2f4] text-[14px] transition-colors flex items-center justify-between ${filters.sortBy === 'expensive' ? 'text-[#ff4f08] font-medium' : 'text-[#212121]'}`}
                     >
                       Öncə baha
                       {filters.sortBy === 'expensive' && <span className="material-symbols-outlined !text-[18px]">check</span>}
                     </button>
                   </div>
                 )}
               </div>
            </div>

            {/* VIP Ads Section */}
            {vipProducts.length > 0 && page === 1 && (
              <div className="mb-10">
                <div className="flex items-end justify-between mb-[14px]">
                  <h2 className="text-[16px] text-[#212121] font-normal">VIP elanlar</h2>
                  <Link href="/listings/vip" className="text-[14px] text-[#0057e6] hover:underline">
                    Hamısı
                  </Link>
                </div>
                <ProductGrid 
                  products={vipProducts} 
                  emptyMessage="" 
                />
              </div>
            )}

            {/* Products Grid */}
            {loading && page === 1 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4f08]"></div>
              </div>
            ) : (
              <>
                <div className="mb-[14px]">
                  <h2 className="text-[16px] text-[#212121] font-normal">Elanlar</h2>
                </div>
                <ProductGrid products={products} />
                <div ref={lastElementRef} className="h-10 mt-8" />
                {loadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4f08]"></div>
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-center text-gray-500 py-8">Bütün elanlar yükləndi.</p>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}
