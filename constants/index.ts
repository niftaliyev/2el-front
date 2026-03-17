export const ROUTES = {
  HOME: '/',
  LISTINGS: '/listings',
  PRODUCT: (id: string) => `/products/${id}`,
  CATEGORY: (slug: string) => `/categories/${slug}`,
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
