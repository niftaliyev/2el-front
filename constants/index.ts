export const ROUTES = {
  HOME: '/',
  LISTINGS: '/listings',
  PRODUCT: (id: string) => `/products/${id}`,
  CATEGORY: (id: string) => `/listings?categoryId=${id}`,
  SUBCATEGORY: (id: string) => `/listings?subCategoryId=${id}`,
  PROFILE: '/cabinet',
  MY_LISTINGS: '/cabinet/listings',
  FAVORITES: '/cabinet/favorites',
  MESSAGES: '/cabinet/messages',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CREATE_LISTING: '/listings/create',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ADS: '/admin/ads',
  ADMIN_USERS: '/admin/users',
} as const;

export const PRODUCT_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
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
      { id: '1-1', name: 'Audio və video', slug: 'audio-video' },
      { id: '1-2', name: 'Kompüter aksesuarları', slug: 'computer-accessories' },
      { id: '1-3', name: 'Oyunlar, pultlar və proqramlar', slug: 'games-consoles', children: [
        { id: '1-3-1', name: 'Oyun konsolları', slug: 'consoles' },
        { id: '1-3-2', name: 'Konsollar üçün oyunlar', slug: 'console-games' },
        { id: '1-3-3', name: 'Kompüter oyunları', slug: 'pc-games' },
      ]},
      { id: '1-4', name: 'Masaüstü kompüterlər', slug: 'desktops' },
      { id: '1-5', name: 'Komponentlər və monitorlar', slug: 'components-monitors' },
    ]
  },
  { 
    id: '2', 
    name: 'Nəqliyyat', 
    slug: 'transport', 
    icon: 'directions_car',
    description: 'Avtomobillər, ehtiyat hissələri, aksesuarlar, av...',
    children: [
      { id: '2-1', name: 'Avtomobillər', slug: 'cars' },
      { id: '2-2', name: 'Ehtiyat hissələri', slug: 'parts' },
      { id: '2-3', name: 'Motosikletlər', slug: 'motorcycles' },
    ]
  },
  { 
    id: '3', 
    name: 'Ev və bağ üçün', 
    slug: 'home-garden', 
    icon: 'chair',
    description: 'Təmir və tikinti, mebel və interyer, məişət texn...',
    children: [
      { id: '3-1', name: 'Mebel', slug: 'furniture' },
      { id: '3-2', name: 'Təmir və tikinti', slug: 'repair' },
      { id: '3-3', name: 'Məişət texnikası', slug: 'appliances' },
    ]
  },
  { 
    id: '4', 
    name: 'Daşınmaz əmlak', 
    slug: 'real-estate', 
    icon: 'home',
    description: 'Mənzillər, həyət və bağ evləri, torpaq sahələri...',
    children: [
      { id: '4-1', name: 'Mənzillər', slug: 'apartments' },
      { id: '4-2', name: 'Həyət evləri', slug: 'houses' },
      { id: '4-3', name: 'Torpaq', slug: 'land' },
    ]
  },
  { id: '5', name: 'Xidmətlər və biznes', slug: 'services', icon: 'home_repair_service', description: 'Avadanlıqların icarəsi və quraşdırılması, təmir...' },
  { id: '6', name: 'Şəxsi əşyalar', slug: 'personal', icon: 'watch', description: 'Geyim və ayaqqabılar, aksesuarlar, saat və zi...' },
  { id: '7', name: 'Telefonlar', slug: 'phones', icon: 'smartphone', description: 'Telefonlar, smartfonlar və aksesuarlar elanları' },
  { id: '8', name: 'Hobbi və asudə', slug: 'hobbies', icon: 'sports_esports', description: 'Biletlər və səyahət, velosipedlər, kolleksiya, id...' },
  { id: '9', name: 'Məişət texnikası', slug: 'appliances', icon: 'kitchen', description: 'Eviniz üçün məişət texnikası' },
  { id: '10', name: 'Uşaq aləmi', slug: 'kids', icon: 'stroller', description: 'Uşaq geyimləri, oyuncaqlar, uşaq arabaları...' },
  { id: '11', name: 'Heyvanlar', slug: 'animals', icon: 'pets', description: 'Ev heyvanları, aksesuarlar və yem' },
  { id: '12', name: 'İş və biznes', slug: 'business', icon: 'work', description: 'İş elanları, biznes təklifləri' },
] as const;
