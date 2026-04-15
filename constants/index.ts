import { generateSlug } from '@/lib/utils';

export const ROUTES = {
  HOME: '/',
  LISTINGS: '/elanlar',
  PRODUCT: (product: any) => {
    const segments: string[] = [];
    
    // 1. Root category (Level 1)
    const rootSlug = product.parentCategorySlug || (typeof product.category === 'object' ? product.category?.slug : null);
    if (rootSlug && rootSlug !== 'elanlar' && rootSlug !== 'unknown') {
      segments.push(rootSlug);
    }
    
    // 2. Child category (Level 2)
    const childSlug = product.childCategorySlug || (typeof product.subCategory === 'object' ? product.subCategory?.slug : null);
    if (childSlug && childSlug !== 'unknown' && childSlug !== rootSlug) {
      segments.push(childSlug);
    }
    
    // 3. Ad Slug + ID
    const adSlug = product.slug || (product.title ? generateSlug(product.title) : 'elan');
    segments.push(`${adSlug}-${product.id}`);
    
    // Build path, PURGE any 'elanlar' from inside segments
    const path = segments
      .filter(s => s && s.toLowerCase() !== 'elanlar' && s.toLowerCase() !== 'unknown')
      .join('/');
      
    // Using a clear test path to verify update
    return `/elanlar/${path}`;
  },
  CATEGORY: (slug: string) => `/elanlar/${slug}`,
  SUBCATEGORY: (catSlug: string, subCatSlug: string) => `/elanlar/${catSlug}/${subCatSlug}`,
  PROFILE: '/cabinet',
  MY_LISTINGS: '/cabinet/listings',
  FAVORITES: '/cabinet/favorites',
  MESSAGES: '/cabinet/messages',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CREATE_LISTING: '/elanlar/create',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ADS: '/admin/ads',
  ADMIN_USERS: '/admin/users',
  ADMIN_STORE_REQUESTS: '/admin/store-requests',
  ADMIN_BUSINESS_PACKAGES: '/admin/business-packages',
  ADMIN_REPORTS: '/admin/reports',
  STORE_DETAIL: (slug: string) => `/shops/${slug}`,
} as const;


export const PRODUCT_CONDITIONS = [
  { value: 'new', label: 'Yeni' },
  { value: 'used', label: 'İşlənmiş' },
] as const;

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
] as const;

export const CURRENCY = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
} as const;

export const DEFAULT_CURRENCY = 'AZN';

export const ITEMS_PER_PAGE = 24;

export const POPULAR_CATEGORIES = [
  'Electronics',
  'Vehicles',
  'Real Estate',
  'Fashion',
  'Home & Garden',
  'Sports',
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: '/admin', icon: 'dashboard', label: 'Dashboard', filled: true },
  { href: '/admin/ads', icon: 'article', label: 'Elan İdarəetməsi', filled: false },
  { href: '/admin/users', icon: 'group', label: 'İstifadəçi İdarəetməsi', filled: false },
  { href: '/admin/store-requests', icon: 'storefront', label: 'Mağaza Sorğuları', filled: false },
  { href: '/admin/business-packages', icon: 'inventory_2', label: 'Biznes Paketləri', filled: false },
  { href: '/admin/reports', icon: 'report', label: 'Şikayətlər', filled: false },
] as const;


export const AD_STATUSES = [
  { value: 'all', label: 'Hamısı', color: 'default' as const },
  { value: 'pending', label: 'Gözləmədə', color: 'warning' as const },
  { value: 'active', label: 'Aktiv', color: 'success' as const },
  { value: 'rejected', label: 'Rədd edilmiş', color: 'danger' as const },
  { value: 'expired', label: 'Vaxtı keçmiş', color: 'default' as const },
] as const;

export const USER_STATUSES = [
  { value: 'all', label: 'Hamısı', color: 'default' as const },
  { value: 'active', label: 'Aktiv', color: 'success' as const },
  { value: 'suspended', label: 'Dayandırılıb', color: 'warning' as const },
  { value: 'banned', label: 'Blok edilib', color: 'danger' as const },
] as const;

export const CATEGORIES = [
  { 
    id: '1', 
    name: 'Elektronika', 
    slug: 'electronics', 
    icon: 'devices',
    description: 'Audio və video, kompüter aksesuarları, telefo...',
    children: [
      { id: '1-1', name: 'Audio və video', slug: 'audio-video', icon: 'movie' },
      { id: '1-2', name: 'Kompüter aksesuarları', slug: 'computer-accessories', icon: 'mouse' },
      { id: '1-3', name: 'Oyunlar, pultlar və proqramlar', slug: 'games-consoles', icon: 'sports_esports', children: [
        { id: '1-3-1', name: 'Oyun konsolları', slug: 'consoles' },
        { id: '1-3-2', name: 'Konsollar üçün oyunlar', slug: 'console-games' },
        { id: '1-3-3', name: 'Kompüter oyunları', slug: 'pc-games' },
      ]},
      { id: '1-4', name: 'Masaüstü kompüterlər', slug: 'desktops', icon: 'desktop_windows' },
      { id: '1-5', name: 'Komponentlər və monitorlar', slug: 'components-monitors', icon: 'monitor' },
    ]
  },
  { 
    id: '2', 
    name: 'Nəqliyyat', 
    slug: 'transport', 
    icon: 'directions_car',
    description: 'Avtomobillər, ehtiyat hissələri, aksesuarlar, av...',
    children: [
      { id: '2-1', name: 'Avtomobillər', slug: 'cars', icon: 'directions_car' },
      { id: '2-2', name: 'Ehtiyat hissələri və aksesuarlar', slug: 'parts', icon: 'settings' },
      { id: '2-3', name: 'Motosikletlər', slug: 'motorcycles', icon: 'moped' },
    ]
  },
  { 
    id: '3', 
    name: 'Ev və bağ üçün', 
    slug: 'home-garden', 
    icon: 'chair',
    description: 'Təmir və tikinti, mebel və interyer, məişət texn...',
    children: [
      { id: '3-1', name: 'Mebel', slug: 'furniture', icon: 'chair' },
      { id: '3-2', name: 'Təmir və tikinti', slug: 'building', icon: 'construction' },
      { id: '3-3', name: 'Məişət texnikası', slug: 'appliances', icon: 'kitchen' },
    ]
  },
  { 
    id: '4', 
    name: 'Daşınmaz əmlak', 
    slug: 'real-estate', 
    icon: 'home',
    description: 'Mənzillər, həyət və bağ evləri, torpaq sahələri...',
    children: [
      { id: '4-1', name: 'Mənzillər', slug: 'apartments', icon: 'apartment' },
      { id: '4-2', name: 'Həyət evləri', slug: 'houses', icon: 'home' },
      { id: '4-3', name: 'Torpaq', slug: 'land', icon: 'landscape' },
    ]
  },
  { id: '5', name: 'Xidmətlər və biznes', slug: 'services', icon: 'home_repair_service', description: 'Avadanlıqların icarəsi və quraşdırılması, təmir...' },
  { id: '6', name: 'Şəxsi əşyalar', slug: 'personal', icon: 'watch', description: 'Geyim və ayaqqabılar, aksesuarlar, saat və zi...' },
  { id: '7', name: 'Telefonlar', slug: 'phones', icon: 'smartphone', description: 'Telefonlar, smartfonlar və aksesuarlar elanları' },
  { id: '8', name: 'Hobbi və asudə', slug: 'hobbies', icon: 'sports_esports', description: 'Biletlər və səyahət, velosipedlər, kolleksiya, id...' },
  { id: '9', name: 'Məişət texnikası', slug: 'appliances', icon: 'kitchen', description: 'Eviniz üçün məişət texnikası' },
  { id: '10', name: 'Uşaq aləmi', slug: 'kids', icon: 'stroller', description: 'Uşaq geyimləri, oyuncaqlar, uşaq arabaları...', children: [
    { id: '10-1', name: 'Məktəblilər üçün', slug: 'school', icon: 'school' }
  ]},
  { id: '11', name: 'Heyvanlar', slug: 'animals', icon: 'pets', description: 'Ev heyvanları, aksesuarlar və yem' },
  { id: '12', name: 'İş elanları', slug: 'jobs', icon: 'work', description: 'İş elanları, biznes təklifləri' },
] as const;
