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
  ADMIN_HELP: '/admin/help',
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
  { href: '/admin/help', icon: 'help_outline', label: 'Yardım və Səhifələr', filled: false },
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
    id: '4', 
    name: 'Daşınmaz əmlak', 
    slug: 'real-estate', 
    icon: 'home',
    image: '/category-images/dasinmaz_emlak_cat.png',
    description: 'Mənzillər, həyət və bağ evləri, torpaq sahələri...'
  },
  { 
    id: 'transport_parts', 
    name: 'Ehtiyat hissələri və aksesuarlar (avto)', 
    slug: 'auto-parts', 
    icon: 'settings',
    image: '/category-images/ehtiyyat_hisseleri_ve_aksesuarlar_avto_cat.png',
    description: ''
  },
  { 
    id: '1', 
    name: 'Elektronika', 
    slug: 'electronics', 
    icon: 'devices',
    image: '/category-images/elektronika_cat.png',
    description: 'Audio və video, kompüter aksesuarları, telefon...'
  },
  { 
    id: '3', 
    name: 'Ev və bağ üçün', 
    slug: 'home-garden', 
    icon: 'chair',
    image: '/category-images/ev_ve_bag_ucun_cat.png',
    description: 'Təmir və tikinti, mebel və interyer, məişət texn...'
  },
  { 
    id: '11', 
    name: 'Heyvanlar', 
    slug: 'animals', 
    icon: 'pets',
    image: '/category-images/heyvanlar_cat.png',
    description: 'Ev heyvanları, aksesuarlar və yem'
  },
  { 
    id: '8', 
    name: 'Hobbi və asudə', 
    slug: 'hobbies', 
    icon: 'sports_esports',
    image: '/category-images/hobbi_ve_asude_cat.png',
    description: 'Biletlər və səyahət, velosipedlər, kolleksiya, id...'
  },
  { 
    id: '12', 
    name: 'İş elanları', 
    slug: 'jobs', 
    icon: 'work',
    image: '/category-images/is_elanlari_cat.png',
    description: 'İş elanları, biznes təklifləri'
  },
  { 
    id: 'kids_school', 
    name: 'Məktəblilər üçün', 
    slug: 'school', 
    icon: 'school',
    image: '/category-images/mektebliler_ucun_cat.png',
    description: ''
  },
  { 
    id: '2', 
    name: 'Nəqliyyat', 
    slug: 'transport', 
    icon: 'directions_car',
    image: '/category-images/neqliyyat_cat.png',
    description: 'Avtomobillər, ehtiyat hissələri, aksesuarlar, av...'
  },
  { 
    id: '6', 
    name: 'Şəxsi əşyalar', 
    slug: 'personal', 
    icon: 'watch',
    image: '/category-images/sexsi_esyalar_cat.png',
    description: 'Geyim və ayaqqabılar, aksesuarlar, saat və zi...'
  },
  { 
    id: '10', 
    name: 'Uşaq aləmi', 
    slug: 'kids', 
    icon: 'stroller',
    image: '/category-images/usaq_alemi_cat.png',
    description: 'Uşaq geyimləri, oyuncaqlar, uşaq arabaları...'
  },
  { 
    id: '5', 
    name: 'Xidmətlər və biznes', 
    slug: 'services', 
    icon: 'home_repair_service',
    image: '/category-images/xidmetler_ve_biznes_cat.png',
    description: 'Avadanlıqların icarəsi və quraşdırılması, təmir...'
  }
] as const;
