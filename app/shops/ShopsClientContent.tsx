'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { storeService } from '@/services/store.service';
import { adService } from '@/services/ad.service';
import { StoreListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

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
  'Telefonlar': 'smartphone',
  'Məişət texnikası': 'local_laundry_service',
  'Mağazalar': 'store',
};

const ITEMS_PER_PAGE = 12; // Increase page size for more grid content

export default function ShopsClientContent() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const [followedStoreIds, setFollowedStoreIds] = useState<Set<string>>(new Set());
  const [revealedPhoneNumbers, setRevealedPhoneNumbers] = useState<Set<string>>(new Set());
  const [activePhoneDropdownStoreId, setActivePhoneDropdownStoreId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      storeService.getStores(),
      adService.getCategoryTree(),
      adService.getCities()
    ]).then(([storeData, categoryTree, cityData]) => {
      const uniqueStores = Array.from(new Map(storeData.map(s => [s.id, s])).values());
      setStores(uniqueStores);

      const parentCategories = categoryTree.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        nameRu: cat.nameRu,
        icon: ICONS[cat.name] || cat.icon || 'category',
        imageUrl: cat.imageUrl
      }));

      const extraCategories: any[] = [];

      const electronics = categoryTree.find((c: any) => c.name === 'Elektronika');
      const phones = electronics?.children?.find((c: any) => c.name === 'Telefonlar');
      if (phones) {
        extraCategories.push({
          id: phones.id,
          name: phones.name,
          nameRu: phones.nameRu,
          icon: 'smartphone',
          imageUrl: phones.imageUrl
        });
      }

      const evVeBag = categoryTree.find((c: any) => c.name === 'Ev və bağ üçün');
      const meiset = evVeBag?.children?.find((c: any) => c.name === 'Məişət texnikası');
      if (meiset) {
        extraCategories.push({
          id: meiset.id,
          name: meiset.name,
          nameRu: meiset.nameRu,
          icon: 'local_laundry_service',
          imageUrl: meiset.imageUrl
        });
      }

      const combinedCategories = [...parentCategories, ...extraCategories];
      combinedCategories.sort((a, b) => a.name.localeCompare(b.name));

      setCategories(combinedCategories);
      setCities(cityData);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });

    // Initialize followed stores
    if (authService.isAuthenticated()) {
      storeService.getFollowedStores().then(followedStores => {
        setFollowedStoreIds(new Set(followedStores.map(s => s.id)));
      }).catch(err => console.error('Error fetching followed stores:', err));
    } else {
      try {
        const stored = localStorage.getItem('offline_following_stores');
        if (stored) {
          const ids = JSON.parse(stored);
          if (Array.isArray(ids)) {
            setFollowedStoreIds(new Set(ids));
          }
        }
      } catch (e) {
        console.error('Error reading offline followed stores:', e);
      }
    }

    const handleClickOutside = () => {
      setIsCategoryDropdownOpen(false);
      setIsCityDropdownOpen(false);
      setIsSortDropdownOpen(false);
      setActivePhoneDropdownStoreId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleToggleFollow = async (e: React.MouseEvent, storeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await storeService.toggleFollowStore(storeId);
      const isFollowing = followedStoreIds.has(storeId);

      setFollowedStoreIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(storeId)) {
          newSet.delete(storeId);
        } else {
          newSet.add(storeId);
        }
        return newSet;
      });

      if (isFollowing) {
        toast.success(language === 'ru' ? 'Вы отписались от магазина' : 'İzləmə ləğv edildi');
      } else {
        toast.success(language === 'ru' ? 'Вы подписались на магазин' : 'Mağaza izlənilir');
      }
    } catch (err) {
      console.error(err);
      toast.error(language === 'ru' ? 'Xəta baş verdi' : 'Xəta baş verdi');
    }
  };

  const handleToggleRevealPhone = (e: React.MouseEvent, storeId: string, hasMultiple: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultiple) {
      setActivePhoneDropdownStoreId(prev => prev === storeId ? null : storeId);
    } else {
      setRevealedPhoneNumbers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(storeId)) {
          newSet.delete(storeId);
        } else {
          newSet.add(storeId);
        }
        return newSet;
      });
    }
  };

  const getStoreDuration = (store: StoreListItem) => {
    if (store.createdDate) {
      const createdDate = new Date(store.createdDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 30) {
        return language === 'ru'
          ? `${diffDays} дн. на 2El.az`
          : `${diffDays} gün 2El.az-da`;
      }
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) {
        return language === 'ru'
          ? `${diffMonths} мес. на 2El.az`
          : `${diffMonths} ay 2El.az-da`;
      }
      const diffYears = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      if (remainingMonths === 0) {
        return language === 'ru'
          ? `${diffYears} г. на 2El.az`
          : `${diffYears} il 2El.az-da`;
      }
      return language === 'ru'
        ? `${diffYears} г. ${remainingMonths} мес. на 2El.az`
        : `${diffYears} il ${remainingMonths} ay 2El.az-da`;
    } else {
      // Deterministic fallback based on store ID hash
      const hashVal = store.id ? store.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 5;
      const mockMonths = (hashVal % 11) + 2; // 2 to 12 months
      return language === 'ru'
        ? `${mockMonths} мес. на 2El.az`
        : `${mockMonths} ay 2El.az-da`;
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch = (store.storeName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || (store.categories && store.categories.includes(selectedCategory));
    const matchesCity = !selectedCityId || store.cityId === selectedCityId;
    return matchesSearch && matchesCategory && matchesCity;
  }).sort((a, b) => {
    if (sortOrder === 'popularity') return (b.viewCount || 0) - (a.viewCount || 0);
    if (sortOrder === 'ads') return (b.adCount || 0) - (a.adCount || 0);
    if (sortOrder === 'az') return (a.storeName || '').localeCompare(b.storeName || '');
    if (sortOrder === 'za') return (b.storeName || '').localeCompare(a.storeName || '');
    return 0;
  });

  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (catName: string | null) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const selectedCategoryObj = categories.find(c => c.name === selectedCategory);

  return (
    <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 767px) {
          body {
            padding-bottom: 0px !important;
          }
        }
      `}} />
      <div className="flex flex-col gap-6">

        {/* Header Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold md:font-black text-gray-900 tracking-tight">{t('shops.title')}</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">{t('shops.subtitle')}</p>
        </div>

        {/* Filters Row - Responsive layout */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center w-full md:bg-white md:p-3 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm overflow-visible">
          {/* Search Box */}
          <div className="relative group w-full md:flex-1 md:min-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors !text-[20px]">search</span>
            <input
              type="text"
              placeholder={language === 'ru' ? 'Поиск магазина...' : 'Mağaza axtarışı'}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
            />
          </div>

          {/* Row 2: Category and City (side-by-side on mobile, individual on desktop) */}
          <div className="flex flex-row gap-2 w-full md:w-auto md:contents">
            {/* Category Dropdown */}
            <div className="relative flex-1 md:flex-none md:w-60 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  setIsCityDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full h-11 px-4 rounded-xl border text-sm font-bold text-gray-700 flex items-center justify-between transition-all cursor-pointer ${isCategoryDropdownOpen
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                disabled={isLoading}
              >
                <div className="flex items-center min-w-0">
                  {selectedCategoryObj ? (
                    selectedCategoryObj.imageUrl || LOCAL_IMAGES[selectedCategoryObj.name] ? (
                      <div className="size-[18px] mr-2 shrink-0 relative flex items-center justify-center">
                        <img
                          src={selectedCategoryObj.imageUrl ? getImageUrl(selectedCategoryObj.imageUrl) : LOCAL_IMAGES[selectedCategoryObj.name]}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="material-symbols-outlined !text-[18px] text-gray-400 mr-2 shrink-0">
                        {selectedCategoryObj.icon || 'category'}
                      </span>
                    )
                  ) : (
                    <span className="material-symbols-outlined !text-[18px] text-gray-400 mr-2 shrink-0">
                      grid_view
                    </span>
                  )}
                  <span className="truncate">
                    {selectedCategory
                      ? (language === 'ru' && selectedCategoryObj?.nameRu ? selectedCategoryObj.nameRu : selectedCategory)
                      : (language === 'ru' ? 'Категория' : 'Kateqoriya')}
                  </span>
                </div>
                <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[220px] max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200 no-scrollbar">
                  <div
                    className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all flex items-center ${selectedCategory === null ? 'text-primary bg-primary/5 font-black' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'
                      }`}
                    onClick={() => {
                      handleCategoryChange(null);
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined !text-[18px] mr-2 shrink-0">grid_view</span>
                    {language === 'ru' ? 'Все категории' : 'Bütün kateqoriyalar'}
                  </div>
                  {categories.map((cat) => {
                    const hasImage = cat.imageUrl || LOCAL_IMAGES[cat.name];
                    const imgSrc = cat.imageUrl ? getImageUrl(cat.imageUrl) : LOCAL_IMAGES[cat.name];
                    return (
                      <div
                        key={cat.id}
                        className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all flex items-center ${selectedCategory === cat.name ? 'text-primary bg-primary/5 font-black' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'
                          }`}
                        onClick={() => {
                          handleCategoryChange(cat.name);
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        {hasImage ? (
                          <div className="size-[18px] mr-2 shrink-0 relative flex items-center justify-center">
                            <img
                              src={imgSrc}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <span className="material-symbols-outlined !text-[18px] mr-2 shrink-0 text-gray-400">
                            {cat.icon || 'category'}
                          </span>
                        )}
                        <span className="truncate">{language === 'ru' && cat.nameRu ? cat.nameRu : cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* City Dropdown */}
            <div className="relative flex-1 md:flex-none md:w-52 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsCityDropdownOpen(!isCityDropdownOpen);
                  setIsCategoryDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full h-11 px-4 rounded-xl border text-sm font-bold text-gray-700 flex items-center justify-between transition-all cursor-pointer ${isCityDropdownOpen
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                disabled={isLoading}
              >
                <div className="flex items-center min-w-0">
                  <span className="material-symbols-outlined !text-[18px] text-gray-400 mr-2 shrink-0">location_on</span>
                  <span className="truncate">
                    {selectedCityId ? (language === 'ru' && cities.find(c => c.id === selectedCityId)?.nameRu ? cities.find(c => c.id === selectedCityId)?.nameRu : cities.find(c => c.id === selectedCityId)?.name) : t('shops.allCities')}
                  </span>
                </div>
                <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
              </button>
              {isCityDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200 no-scrollbar">
                  <div
                    className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all flex items-center ${!selectedCityId ? 'text-primary bg-primary/5 font-black' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'
                      }`}
                    onClick={() => {
                      setSelectedCityId(null);
                      setCurrentPage(1);
                      setIsCityDropdownOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined !text-[18px] mr-2 shrink-0">map</span>
                    {t('shops.allCities')}
                  </div>
                  {cities.map((city) => (
                    <div
                      key={city.id}
                      className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all flex items-center ${selectedCityId === city.id ? 'text-primary bg-primary/5 font-black' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'
                        }`}
                      onClick={() => {
                        setSelectedCityId(city.id);
                        setCurrentPage(1);
                        setIsCityDropdownOpen(false);
                      }}
                    >
                      <span className="material-symbols-outlined !text-[18px] mr-2 shrink-0 text-gray-400">location_city</span>
                      <span className="truncate">{language === 'ru' && city.nameRu ? city.nameRu : city.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Sort and View Mode Toggle (side-by-side on mobile, individual on desktop) */}
          {/* Sort Dropdown */}
          <div className="relative w-full md:w-52 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsCategoryDropdownOpen(false);
                setIsCityDropdownOpen(false);
              }}
              className={`w-full h-11 px-4 rounded-xl border text-sm font-bold text-gray-700 flex items-center justify-between transition-all cursor-pointer ${isSortDropdownOpen
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                }`}
              disabled={isLoading}
            >
              <div className="flex items-center min-w-0">
                <span className="material-symbols-outlined !text-[18px] text-gray-400 mr-2 shrink-0">swap_vert</span>
                <span className="truncate">
                  {sortOrder === 'default' && (language === 'ru' ? 'По умолчанию' : 'İlkin ayarlar üzrə')}
                  {sortOrder === 'popularity' && t('shops.sortPopularity')}
                  {sortOrder === 'ads' && t('shops.sortAdCount')}
                  {sortOrder === 'az' && t('shops.sortAZ')}
                  {sortOrder === 'za' && t('shops.sortZA')}
                </span>
              </div>
              <span className={`material-symbols-outlined !text-[18px] text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
            </button>
            {isSortDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  { id: 'default', label: language === 'ru' ? 'По умолчанию' : 'İlkin ayarlar üzrə', icon: 'sort' },
                  { id: 'popularity', label: t('shops.sortPopularity'), icon: 'trending_up' },
                  { id: 'ads', label: t('shops.sortAdCount'), icon: 'ads_click' },
                  { id: 'az', label: t('shops.sortAZ'), icon: 'text_rotation_down' },
                  { id: 'za', label: t('shops.sortZA'), icon: 'text_rotation_none' }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className={`px-5 py-3 text-sm font-semibold cursor-pointer transition-all flex items-center ${sortOrder === opt.id ? 'text-primary bg-primary/5 font-black' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'
                      }`}
                    onClick={() => {
                      handleSortChange(opt.id);
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined !text-[18px] mr-2 shrink-0 text-gray-400">{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stores Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {isLoading ? (
            /* Loading Skeleton */
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 flex flex-col justify-between h-[170px]">
                <div className="animate-pulse size-full flex flex-col justify-between">
                  <div className="flex gap-3 items-start">
                    <div className="size-14 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2 mt-1">
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-gray-50 pt-3 mt-2">
                    <div className="h-9 bg-gray-100 rounded-xl flex-1" />
                    <div className="h-9 bg-gray-100 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            currentStores.map((store) => {
              const phoneNumbers = [store.contactNumber, store.contactNumber2, store.contactNumber3].filter(Boolean) as string[];
              const hasMultiplePhones = phoneNumbers.length > 1;
              return (
                /* Compact Grid Card (tap.az style) */
                <div key={store.id} className="bg-white rounded-2xl border border-gray-200 hover:border-primary/20 hover:shadow-md transition-all duration-300 p-4 flex flex-col justify-between h-full group relative overflow-visible">
                  <Link href={`/shops/${store.slug || store.id}`} className="flex flex-col flex-1">
                    <div className="flex items-start gap-3">
                      {/* Logo Container */}
                      <div className="size-14 sm:size-16 rounded-xl border border-gray-100 bg-white relative overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                        {store.storeLogoUrl ? (
                          <Image
                            src={getImageUrl(store.storeLogoUrl)}
                            alt={`${store.storeName} logo`}
                            fill
                            className="object-cover p-1"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-gray-200">store</span>
                        )}
                      </div>

                      {/* Text info */}
                      <div className="flex-1 min-w-0 mt-0.5">
                        <h3 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1">
                          <span className="truncate">{store.storeName}</span>
                          <span className="material-symbols-outlined text-blue-500 !text-[15px] shrink-0">verified</span>
                        </h3>

                        <p className="text-[11px] font-bold text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{store.adCount || 0} {t('shops.ads')}</span>
                          <span className="text-gray-300">•</span>
                          <span className="truncate">{getStoreDuration(store)}</span>
                        </p>

                        <p className="text-[10px] font-bold text-gray-400 mt-1.5 truncate">
                          {(language === 'ru' ? store.headlineRu : store.headline) || (language === 'ru' ? store.categoriesRu?.[0] : store.categories?.[0]) || (language === 'ru' ? 'Магазин' : 'Mağaza')}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Bottom buttons */}
                  <div className="mt-4 flex gap-2 w-full pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleToggleFollow(e, store.id)}
                      className={`flex-1 h-9 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${followedStoreIds.has(store.id)
                        ? 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                        : 'bg-[#f4f6fd] hover:bg-primary/10 text-primary'
                        }`}
                    >
                      <span className="material-symbols-outlined !text-[16px] fill-current">
                        {followedStoreIds.has(store.id) ? 'check' : 'person_add'}
                      </span>
                      <span>
                        {followedStoreIds.has(store.id) ? t('storeDetail.followed') : t('storeDetail.followStore')}
                      </span>
                    </button>

                    {store.contactNumber ? (
                      <div className="relative flex-1 min-w-0">
                        <button
                          onClick={(e) => handleToggleRevealPhone(e, store.id, hasMultiplePhones)}
                          className={`w-full h-9 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 border transition-all cursor-pointer min-w-0 ${activePhoneDropdownStoreId === store.id
                            ? 'border-gray-950 bg-white text-gray-900 shadow-sm'
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                          {!hasMultiplePhones && revealedPhoneNumbers.has(store.id) ? (
                            <a
                              href={`tel:${store.contactNumber}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary hover:underline flex items-center gap-1 truncate w-full justify-center px-1"
                            >
                              <span className="material-symbols-outlined !text-[15px] shrink-0">call</span>
                              <span className="truncate">{store.contactNumber}</span>
                            </a>
                          ) : (
                            <>
                              <span className="material-symbols-outlined !text-[15px] shrink-0">call</span>
                              <span className="truncate">{language === 'ru' ? 'Показать' : 'Nömrəni göstər'}</span>
                            </>
                          )}
                        </button>

                        {hasMultiplePhones && activePhoneDropdownStoreId === store.id && (
                          <div className="absolute top-[calc(100%+6px)] right-0 z-[100] w-52 sm:w-56 bg-white rounded-2xl border border-gray-200 shadow-[0_15px_35px_rgba(0,0,0,0.12)] p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                            {phoneNumbers.map((num, idx) => (
                              <a
                                key={idx}
                                href={`tel:${num}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePhoneDropdownStoreId(null);
                                }}
                                className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-700 hover:text-primary"
                              >
                                <span className="material-symbols-outlined text-[#2ec271] !text-[18px] shrink-0">call</span>
                                <span className="text-sm font-bold tracking-tight truncate">{num}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        disabled
                        className="flex-1 h-9 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed min-w-0"
                      >
                        <span className="material-symbols-outlined !text-[15px] shrink-0">call</span>
                        <span className="truncate">{language === 'ru' ? 'Нет номера' : 'Nömrə yoxdur'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filteredStores.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex items-center justify-center size-9 rounded-xl text-xs font-black transition-all cursor-pointer ${currentPage === page
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
            </button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredStores.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-300 !text-3xl">storefront</span>
            </div>
            <h3 className="text-base font-black text-gray-900">{t('shops.noStores')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('shops.noStoresDesc')}</p>
          </div>
        )}
      </div>
    </main>
  );
}
