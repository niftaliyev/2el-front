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
    
    // 3. PinCode (tap.az style)
    segments.push(product.pinCode?.toString() || product.adPinCode?.toString() || product.id || product.adId);
    
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
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CREATE_LISTING: '/elanlar/create',
  STORE_DETAIL: (slug: string) => `/shops/${slug}`,
  TERMS: '/pages/terms-and-conditions',
  RULES: '/pages/rules',
  PUBLIC_OFFER: '/pages/proposal',
  PRIVACY_POLICY: '/pages/privacy',
  ABOUT_US: '/pages/about',
  CATEGORY_LIMITS: '/pages/limits_by_category',
  PAID_SERVICES: '/pages/packages',
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

export const CATEGORIES = [
  {
    id: "fc77fbb6-c002-492d-8f16-e5992c7de2d4",
    name: "Daşınmaz əmlak",
    nameRu: "Недвижимость",
    slug: "dasinmaz-emlak",
    icon: "home",
    image: "/category-images/dasinmaz_emlak_cat.png",
    description: "Mənzillər, həyət və bağ evləri, torpaq sahələri..."
  },
  {
    id: "bf444708-6e76-4308-85dd-2b20b320969c",
    name: "Ehtiyat hissələri və aksesuarlar (avto)",
    nameRu: "Запчасти и аксессуары (авто)",
    slug: "ehtiyat-hisseleri-ve-aksesuarlar-avto",
    icon: "build",
    image: "/category-images/ehtiyyat_hisseleri_ve_aksesuarlar_avto_cat.png",
    description: ""
  },
  {
    id: "11874ca7-8404-4f9d-a978-0217d51c3b65",
    name: "Elektronika",
    nameRu: "Электроника",
    slug: "elektronika",
    icon: "devices",
    image: "/category-images/elektronika_cat.png",
    description: "Audio və video, kompüter aksesuarları, telefon..."
  },
  {
    id: "fbe3055d-6609-4173-918e-e3bbd9a9e2f8",
    name: "Ev və bağ üçün",
    nameRu: "Для дома и дачи",
    slug: "ev-ve-bag-ucun",
    icon: "chair",
    image: "/category-images/ev_ve_bag_ucun_cat.png",
    description: "Təmir və tikinti, mebel və interyer, məişət texn..."
  },
  {
    id: "193cc660-5839-42fe-b476-b5b519dcf7e2",
    name: "Heyvanlar",
    nameRu: "Животные",
    slug: "heyvanlar",
    icon: "pets",
    image: "/category-images/heyvanlar_cat.png",
    description: "Ev heyvanları, aksesuarlar və yem"
  },
  {
    id: "d26d231d-e267-4c04-8491-b3081ea02550",
    name: "Hobbi və asudə",
    nameRu: "Хобби и досуг",
    slug: "hobbi-ve-asude",
    icon: "sports_esports",
    image: "/category-images/hobbi_ve_asude_cat.png",
    description: "Biletlər və səyahət, velosipedlər, kolleksiya, id..."
  },
  {
    id: "a9db72a1-fcd5-419f-9f06-cb94684d2a4c",
    name: "İş elanları",
    nameRu: "Вакансии",
    slug: "is-elanlari",
    icon: "work",
    image: "/category-images/is_elanlari_cat.png",
    description: "İş elanları, biznes təklifləri"
  },
  {
    id: "697e8fbe-ddcc-458b-a3a6-c6c347c2d77c",
    name: "Məktəblilər üçün",
    nameRu: "Для школьников",
    slug: "mektebliler-ucun",
    icon: "school",
    image: "/category-images/mektebliler_ucun_cat.png",
    description: ""
  },
  {
    id: "f4395f20-4b95-4454-a192-a59605fa2271",
    name: "Nəqliyyat",
    nameRu: "Транспорт",
    slug: "neqliyyat",
    icon: "directions_car",
    image: "/category-images/neqliyyat_cat.png",
    description: "Avtomobillər, ehtiyat hissələri, aksesuarlar, av..."
  },
  {
    id: "3d11e8d5-5cc1-4fcf-88ec-5d8f6420096e",
    name: "Şəxsi əşyalar",
    nameRu: "Личные вещи",
    slug: "sexsi-esyalar",
    icon: "watch",
    image: "/category-images/sexsi_esyalar_cat.png",
    description: "Geyim və ayaqqabılar, aksesuarlar, saat və zi..."
  },
  {
    id: "472c8686-a814-42b1-9e41-4e7df8eeb78f",
    name: "Uşaq aləmi",
    nameRu: "Детский мир",
    slug: "usaq-alemi",
    icon: "stroller",
    image: "/category-images/usaq_alemi_cat.png",
    description: "Uşaq geyimləri, oyuncaqlar, uşaq arabaları..."
  },
  {
    id: "97d9b1de-4451-4224-911b-af038f6f5f94",
    name: "Xidmətlər və biznes",
    nameRu: "Услуги и бизнес",
    slug: "xidmetler-ve-biznes",
    icon: "home_repair_service",
    image: "/category-images/xidmetler_ve_biznes_cat.png",
    description: "Avadanlıqların icarəsi və quraşdırılması, təmir..."
  }
] as const;
