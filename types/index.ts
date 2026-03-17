export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  isVerified: boolean;
}

export interface Location {
  id: string;
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

export interface Store {
  id: string;
  name: string;
  logo?: string;
  isVerified?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: Category;
  location: Location;
  seller: User;
  condition: 'new' | 'used' | 'refurbished';
  status: 'active' | 'sold' | 'reserved' | 'expired';
  viewCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  features?: Record<string, string | number | boolean>;
  isFeatured?: boolean;
  isPromoted?: boolean;
  isPremium?: boolean;
  store?: Store;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Product['condition'];
  sortBy?: 'latest' | 'price-asc' | 'price-desc' | 'popular';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  productId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}
