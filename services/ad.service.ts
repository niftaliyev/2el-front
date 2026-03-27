import axiosInstance from '@/lib/axios';
import {
  AdListItem,
  AdDetail,
  AdEditData,
  CreateAdRequest,
  CategoryDto,
  SubCategoryDto,
  ContactInfo,
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

export interface SearchParams {
  pageNumber: number;
  pageSize: number;
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
}

// ── Ad Service ────────────────────────────────────────────────────────────────

class AdService {
  /** All public ads (paginated) */
  async getAllAds(params?: SearchParams): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.get<PaginatedResponse<AdListItem[]>>('/ad', { params });
    return response.data;
  }

  /** Single ad detail */
  async getAdById(id: string): Promise<AdDetail> {
    const response = await axiosInstance.get<AdDetail>(`/ad/${id}`);
    return response.data;
  }

  /** Categories (optionally filtered by parent) */
  async getCategories(parentId?: string): Promise<CategoryDto[]> {
    const params = parentId ? { parentId: parentId } : {};
    const response = await axiosInstance.get<CategoryDto[]>('/category', { params });
    return response.data;
  }

  /** Category Tree (for navigation, filters, etc.) */
  async getCategoryTree(): Promise<CategoryDto[]> {
    const response = await axiosInstance.get<CategoryDto[]>('/category/tree');
    return response.data;
  }

  /** SubCategories (brands, types, etc.) */
  async getSubCategories(categoryId: string): Promise<SubCategoryDto[]> {
    const response = await axiosInstance.get<SubCategoryDto[]>(`/category/${categoryId}/subcategories`);
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
    if (adData.SubCategoryId) formData.append('SubCategoryId', adData.SubCategoryId);
    formData.append('FullName', adData.FullName);
    formData.append('Email', adData.Email);
    formData.append('Description', adData.Description);
    if (adData.DynamicFieldsJson) formData.append('DynamicFieldsJson', adData.DynamicFieldsJson);
    adData.Images.forEach((img) => formData.append('Images', img));
    await axiosInstance.post('/ad', formData);
  }

  /** Update existing ad */
  async updateAd(id: string, adData: CreateAdRequest & { DeletedImageIds?: string[] }): Promise<void> {
    const formData = new FormData();
    formData.append('CityId', adData.CityId);
    formData.append('Price', adData.Price.toString());
    formData.append('IsDeliverable', adData.IsDeliverable.toString());
    formData.append('IsNew', adData.IsNew.toString());
    formData.append('PhoneNumber', adData.PhoneNumber);
    formData.append('AdTypeId', adData.AdTypeId);
    formData.append('Title', adData.Title);
    formData.append('CategoryId', adData.CategoryId);
    if (adData.SubCategoryId) formData.append('SubCategoryId', adData.SubCategoryId);
    formData.append('FullName', adData.FullName);
    formData.append('Email', adData.Email);
    formData.append('Description', adData.Description);
    if (adData.DynamicFieldsJson) formData.append('DynamicFieldsJson', adData.DynamicFieldsJson);
    
    // In update, images sent are new images
    adData.Images.forEach((img) => formData.append('NewImages', img));
    
    // Append deleted image IDs if any
    if (adData.DeletedImageIds) {
      adData.DeletedImageIds.forEach(imgId => formData.append('DeletedImageIds', imgId));
    }
    
    await axiosInstance.put(`/ad/${id}`, formData);
  }

  /** Get ad edit data (with dynamic fields) */
  async getEditData(id: string): Promise<AdEditData> {
    const response = await axiosInstance.get<AdEditData>(`/ad/${id}/edit`);
    return response.data;
  }

  /** Get user contact info for auto-filling ad creation form */
  async getContactInfo(): Promise<ContactInfo> {
    const response = await axiosInstance.get<ContactInfo>('/account/contact-info');
    return response.data;
  }

  /** VIP ads */
  async getVipAds(): Promise<AdListItem[]> {
    const response = await axiosInstance.get<AdListItem[]>('/ad/vip');
    return response.data ?? [];
  }

  /** Premium ads */
  async getPremiumAds(): Promise<AdListItem[]> {
    const response = await axiosInstance.get<AdListItem[]>('/ad/premium');
    return response.data ?? [];
  }

  /** Get user profile */
  async getProfile(): Promise<any> {
    const response = await axiosInstance.get('/account/profile');
    return response.data;
  }

  /** Update user profile */
  async updateProfile(data: { fullName?: string; phoneNumber?: string; profilePhoto?: File }): Promise<void> {
    const formData = new FormData();
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
    if (data.profilePhoto) formData.append('profilePhoto', data.profilePhoto);
    await axiosInstance.put('/account/profile', formData);
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

  async buyPackage(adId: string, packageId: string): Promise<void> {
    await axiosInstance.post(`/account/${adId}/buy-service`, { packageId });
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

  /** Increase balance request */
  async increaseBalance(amount: number, image: File): Promise<void> {
    const formData = new FormData();
    formData.append('Amount', amount.toString());
    formData.append('Image', image);
    await axiosInstance.post('/balance/increase', formData);
  }

  /** Increase view count */
  async incrementViewCount(id: string): Promise<void> {
    await axiosInstance.post(`/ad/${id}/view`);
  }
}

export const adService = new AdService();
