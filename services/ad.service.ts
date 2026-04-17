import axiosInstance from '@/lib/axios';
import { authService } from './auth.service';
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
  BusinessPackageDto,
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
  cityId?: string;
  isNew?: boolean;
  sortBy?: string;
  isDeliverable?: boolean;
  [key: string]: any;
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
    if (adData.PackagePriceId) formData.append('PackagePriceId', adData.PackagePriceId);
    adData.Images.forEach((img) => formData.append('Images', img));
    await axiosInstance.post('/ad', formData);
  }

  /** Update existing ad */
  async updateAd(id: string, adData: CreateAdRequest & { DeletedImageIds?: string[]; MainImageId?: string; NewMainImageIndex?: number }): Promise<void> {
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

    if (adData.MainImageId) {
      formData.append('MainImageId', adData.MainImageId);
    } else if (adData.NewMainImageIndex !== undefined) {
      formData.append('NewMainImageIndex', adData.NewMainImageIndex.toString());
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

  /** VIP ads (Random 4) */
  async getVipAds(params?: SearchParams): Promise<AdListItem[]> {
    const response = await axiosInstance.get<AdListItem[]>('/ad/vip', { params });
    return response.data ?? [];
  }

  /** VIP ads (Paginated) */
  async getPaginatedVipAds(page: number, pageSize: number = 12): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.get<PaginatedResponse<AdListItem[]>>('/ad/vip-all', { params: { page, pageSize } });
    return response.data;
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

  /** Reactivate / Renew expired ad */
  async reactivateAd(id: string): Promise<any> {
    const response = await axiosInstance.post(`/ad/${id}/reactivate`);
    return response.data;
  }

  // ── My Ads (per status) ──────────────────────────────────────────────────

  async getMyAds(page = 1, pageSize = 10, statusFilter?: string): Promise<PaginatedResponse<AdListItem[]>> {
    const params = { page, pageSize, ...(statusFilter ? { statusFilter } : {}) };
    const response = await axiosInstance.get<PaginatedResponse<AdListItem[]>>('/ad/my', { params });
    return response.data;
  }

  async getActiveAds(page = 1, pageSize = 10): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.get<PaginatedResponse<AdListItem[]>>('/ad/my-active-ads', { params: { page, pageSize } });
    return response.data;
  }

  async getPendingAds(page = 1, pageSize = 10): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.get<PaginatedResponse<AdListItem[]>>('/ad/my-pending-ads', { params: { page, pageSize } });
    return response.data;
  }

  async getInactiveAds(page = 1, pageSize = 10): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.get<PaginatedResponse<AdListItem[]>>('/ad/my-inactive-ads', { params: { page, pageSize } });
    return response.data;
  }

  async getRejectedAds(page = 1, pageSize = 10): Promise<PaginatedResponse<AdListItem[]>> {
    const response = await axiosInstance.get<PaginatedResponse<AdListItem[]>>('/ad/my-rejected-ads', { params: { page, pageSize } });
    return response.data;
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

  async getAllPackages(): Promise<PackageItem[]> {
    const response = await axiosInstance.get<PackageItem[]>('/packages/all-prices');
    return response.data ?? [];
  }

  async buyPackage(adId: string, packageId: string): Promise<void> {
    await axiosInstance.post(`/account/${adId}/buy-service`, { packageId });
  }

  async getBusinessPackages(): Promise<BusinessPackageDto[]> {
    const response = await axiosInstance.get<BusinessPackageDto[]>('/packages/business');
    return response.data ?? [];
  }

  async getMyBusinessPackages(): Promise<any[]> {
    const response = await axiosInstance.get<any[]>('/packages/my-business');
    return response.data ?? [];
  }

  async getTransactions(page = 1, pageSize = 10): Promise<PaginatedResponse<any[]>> {
    const response = await axiosInstance.get<PaginatedResponse<any[]>>('/account/transactions', {
      params: { page, pageSize },
    });
    return response.data;
  }

  async getInvoices(status?: string, page = 1, pageSize = 10): Promise<PaginatedResponse<any[]>> {
    const params = { status, page, pageSize };
    const response = await axiosInstance.get<PaginatedResponse<any[]>>('/account/invoices', { params });
    return response.data;
  }

  async buyBusinessPackage(packageId: string, durationDays: number): Promise<void> {
    await axiosInstance.post('/packages/buy-business', { packageId, durationDays });
  }

  // ── Favourites ────────────────────────────────────────────────────────────

  private getLocalFavourites(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('offline_favourites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setLocalFavourites(ids: string[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('offline_favourites', JSON.stringify(ids));
  }

  async addToFavourites(adId: string): Promise<void> {
    if (authService.isAuthenticated()) {
      await axiosInstance.get('/favourites/add', { params: { adId } });
    } else {
      const favs = this.getLocalFavourites();
      if (!favs.includes(adId)) {
        favs.push(adId);
        this.setLocalFavourites(favs);
      }
    }
  }

  async removeFromFavourites(adId: string): Promise<void> {
    if (authService.isAuthenticated()) {
      await axiosInstance.delete('/favourites', { params: { adId } });
    } else {
      let favs = this.getLocalFavourites();
      favs = favs.filter(id => id !== adId);
      this.setLocalFavourites(favs);
    }
  }

  async getFavourites(params?: SearchParams): Promise<PaginatedResponse<AdListItem[]>> {
    if (authService.isAuthenticated()) {
      const response = await axiosInstance.post<PaginatedResponse<AdListItem[]>>('/favourites', params ?? { pageNumber: 1, pageSize: 20 });
      return response.data;
    } else {
      const favs = this.getLocalFavourites();
      if (favs.length === 0) {
        return { data: [], totalPages: 0, totalElements: 0, pageNumber: 1, pageSize: 20 };
      }
      const response = await axiosInstance.post<AdListItem[]>('/ad/by-ids', favs);
      return {
        data: response.data,
        pageNumber: 1,
        pageSize: favs.length,
        totalPages: 1,
        totalElements: favs.length,
      };
    }
  }

  async syncOfflineFavourites(): Promise<void> {
    if (!authService.isAuthenticated()) return;
    const favs = this.getLocalFavourites();
    if (favs.length === 0) return;
    
    for (const adId of favs) {
      try {
        await axiosInstance.get('/favourites/add', { params: { adId } });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('offline_favourites');
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

  /** Get user's category usage (count in last 30 days) */
  async getCategoryUsage(categoryId: string): Promise<number> {
    const response = await axiosInstance.get<{ usage: number }>(`/ad/usage/${categoryId}`);
    return response.data.usage;
  }
}

export const adService = new AdService();
