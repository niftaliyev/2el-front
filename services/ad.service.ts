import axiosInstance from '@/lib/axios';
import {
  AdListItem,
  AdDetail,
  CreateAdRequest,
  CategoryDto,
  LookupItem,
  PackageItem,
  PaginatedResponse,
} from '@/types/api';

// ── Ad Filters (matches backend AdFilter) ────────────────────────────────────

export interface AdFilter {
  title?: string;
  categoryId?: string;
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  status?: string;
}

export interface SearchParams<T = AdFilter> {
  pageNumber: number;
  pageSize: number;
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>;
  filter?: T;
}

// ── Ad Service ────────────────────────────────────────────────────────────────

class AdService {
  /** All public ads (paginated) */
  async getAllAds(params?: SearchParams): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.post<PaginatedResponse<AdListItem[]>>('/ad/all', params ?? { pageNumber: 1, pageSize: 20 });
    return response.data;
  }

  /** Single ad detail */
  async getAdById(id: string): Promise<AdDetail> {
    const response = await axiosInstance.get<AdDetail>(`/ad/${id}`);
    return response.data;
  }

  /** Categories (optionally filtered by parent) */
  async getCategories(parentId?: string): Promise<CategoryDto[]> {
    const params = parentId ? { parentID: parentId } : {};
    const response = await axiosInstance.get<CategoryDto[]>('/category', { params });
    return response.data;
  }

  /** Ad types lookup */
  async getAdTypes(): Promise<LookupItem[]> {
    const response = await axiosInstance.get<LookupItem[]>('/ad/types');
    return response.data;
  }

  /** Cities lookup */
  async getCities(): Promise<LookupItem[]> {
    const response = await axiosInstance.get<LookupItem[]>('/lookup/cities');
    return response.data;
  }

  /** Create new ad */
  async createAd(adData: CreateAdRequest): Promise<void> {
    const formData = new FormData();
    formData.append('CityId', adData.CityId);
    formData.append('Price', adData.Price.toString());
    formData.append('IsDeliverable', adData.IsDeliverable.toString());
    formData.append('IsNew', adData.IsNew.toString());
    formData.append('PhoneNumber', adData.PhoneNumber);
    formData.append('AdTypeId', adData.AdTypeId);
    formData.append('Title', adData.Title);
    formData.append('CategoryId', adData.CategoryId);
    formData.append('FullName', adData.FullName);
    formData.append('Email', adData.Email);
    formData.append('Description', adData.Description);
    adData.Images.forEach((img) => formData.append('Images', img));
    await axiosInstance.post('/ad', formData);
  }

  /** Update existing ad */
  async updateAd(id: string, adData: CreateAdRequest): Promise<void> {
    const formData = new FormData();
    formData.append('CityId', adData.CityId);
    formData.append('Price', adData.Price.toString());
    formData.append('IsDeliverable', adData.IsDeliverable.toString());
    formData.append('IsNew', adData.IsNew.toString());
    formData.append('PhoneNumber', adData.PhoneNumber);
    formData.append('AdTypeId', adData.AdTypeId);
    formData.append('Title', adData.Title);
    formData.append('CategoryId', adData.CategoryId);
    formData.append('FullName', adData.FullName);
    formData.append('Email', adData.Email);
    formData.append('Description', adData.Description);
    adData.Images.forEach((img) => formData.append('Images', img));
    await axiosInstance.put(`/ad/${id}`, formData);
  }

  /** Delete ad */
  async deleteAd(id: string): Promise<void> {
    await axiosInstance.delete(`/ad/${id}`);
  }

  // ── My Ads (per status) ──────────────────────────────────────────────────

  async getMyAds(statusFilter?: string): Promise<AdListItem[]> {
    const params = statusFilter ? { statusFilter } : {};
    const response = await axiosInstance.get<AdListItem[]>('/ad/my-ads', { params });
    return response.data ?? [];
  }

  async getActiveAds(): Promise<AdListItem[]> {
    const response = await axiosInstance.get<AdListItem[]>('/ad/my-active-ads');
    return response.data ?? [];
  }

  async getPendingAds(): Promise<AdListItem[]> {
    const response = await axiosInstance.get<AdListItem[]>('/ad/my-pending-ads');
    return response.data ?? [];
  }

  async getInactiveAds(): Promise<AdListItem[]> {
    const response = await axiosInstance.get<AdListItem[]>('/ad/my-inactive-ads');
    return response.data ?? [];
  }

  async getRejectedAds(): Promise<AdListItem[]> {
    const response = await axiosInstance.get<AdListItem[]>('/ad/my-rejected-ads');
    return response.data ?? [];
  }

  // ── Packages ─────────────────────────────────────────────────────────────

  async getVipPackages(): Promise<PackageItem[]> {
    const response = await axiosInstance.get<PackageItem[]>('/packages/vip-list');
    return response.data ?? [];
  }

  async getPremiumPackages(): Promise<PackageItem[]> {
    const response = await axiosInstance.get<PackageItem[]>('/packages/premium-list');
    return response.data ?? [];
  }

  async getBoostPackages(): Promise<PackageItem[]> {
    const response = await axiosInstance.get<PackageItem[]>('/packages/boosts');
    return response.data ?? [];
  }

  async buyPackage(adId: string, priceId: string): Promise<void> {
    await axiosInstance.post(`/account/${adId}/buy-service`, { priceid: priceId });
  }

  // ── Favourites ────────────────────────────────────────────────────────────

  async addToFavourites(adId: string): Promise<void> {
    await axiosInstance.get('/favourites/add', { params: { adId } });
  }

  async removeFromFavourites(adId: string): Promise<void> {
    await axiosInstance.delete('/favourites', { params: { adId } });
  }

  async getFavourites(params?: SearchParams): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.post<PaginatedResponse<AdListItem[]>>('/favourites', params ?? { pageNumber: 1, pageSize: 20 });
    return response.data;
  }
}

export const adService = new AdService();
