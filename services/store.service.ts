import axiosInstance from '@/lib/axios';
import { authService } from './auth.service';
import {
  StoreDetail,
  StoreAdItem,
  StoreListItem,
  PaginatedResponse,
  AdListItem,
} from '@/types/api';

export interface CreateStoreDto {
  storeName: string;
  description: string;
  contactNumber: string;
  address: string;
  website?: string;
}

class StoreService {
  /** Get store detail */
  async getStore(storeId: string): Promise<StoreDetail> {
    const response = await axiosInstance.get<StoreDetail>(`/store/${storeId}`);
    return response.data;
  }

  /** Get all stores */
  async getStores(): Promise<StoreListItem[]> {
    const response = await axiosInstance.get<StoreListItem[]>('/store');
    return response.data ?? [];
  }

  /** Get store ads */
  async getStoreAds(storeId: string, page = 1, pageSize = 20): Promise<StoreAdItem[]> {
    const response = await axiosInstance.get<StoreAdItem[]>(`/store/${storeId}/ads`, {
      params: { page, pageSize },
    });
    return response.data ?? [];
  }

  /** Get followed stores for authenticated user */
  async getFollowedStores(): Promise<StoreListItem[]> {
    const response = await axiosInstance.get<StoreListItem[]>('/store/followed');
    return response.data ?? [];
  }

  /** Create store */
  async createStore(dto: CreateStoreDto): Promise<void> {
    await axiosInstance.post('/store', dto);
  }

  private getLocalFollowedStores(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('offline_following_stores');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setLocalFollowedStores(ids: string[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('offline_following_stores', JSON.stringify(ids));
  }

  async toggleFollowStore(storeId: string): Promise<{ message: string }> {
    if (authService.isAuthenticated()) {
      const response = await axiosInstance.post<{ message: string }>(`/store/${storeId}/follow`);
      return response.data;
    } else {
      let favs = this.getLocalFollowedStores();
      if (favs.includes(storeId)) {
        favs = favs.filter(id => id !== storeId);
        this.setLocalFollowedStores(favs);
        return { message: "İzləmə ləğv edildi" };
      } else {
        favs.push(storeId);
        this.setLocalFollowedStores(favs);
        return { message: "Mağaza izlənilir" };
      }
    }
  }

  async getFollowedStoresByIds(): Promise<StoreListItem[]> {
    const favs = this.getLocalFollowedStores();
    if (favs.length === 0) return [];
    const response = await axiosInstance.post<StoreListItem[]>('/store/by-ids', favs);
    return response.data;
  }

  async syncOfflineFollowedStores(): Promise<void> {
    if (!authService.isAuthenticated()) return;
    const favs = this.getLocalFollowedStores();
    if (favs.length === 0) return;
    
    for (const storeId of favs) {
      try {
        await axiosInstance.post(`/store/${storeId}/follow`);
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('offline_following_stores');
  }

  /** Create store request */
  async createStoreRequest(formData: FormData): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/store/request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /** Get all store requests (Admin only) */
  async getStoreRequests(): Promise<any[]> {
    const response = await axiosInstance.get<any[]>('/admin/store-requests');
    return response.data ?? [];
  }


  /** Approve store request (Admin only) */
  async approveStoreRequest(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(`/admin/store-requests/${id}/approve`);
    return response.data;
  }


  /** Reject store request (Admin only) */
  async rejectStoreRequest(id: string, reason: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(`/admin/store-requests/${id}/reject`, JSON.stringify(reason), {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }


  /** Delete store request (Admin only) */
  async deleteStoreRequest(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/admin/store-requests/${id}`);
    return response.data;
  }


  /** Check if the current user has an active store */
  async getUserStoreStatus(): Promise<{ hasStore: boolean; hasPendingRequest: boolean }> {
    const response = await axiosInstance.get<{ hasStore: boolean; hasPendingRequest: boolean }>('/store/my-status');
    return response.data;
  }

  /** Get current user's store for edit */
  async getMyStore(): Promise<any> {
    const response = await axiosInstance.get('/store/my-store');
    return response.data;
  }

  /** Get store detail by slug */
  async getStoreBySlug(slug: string): Promise<StoreDetail> {
    const response = await axiosInstance.get<StoreDetail>(`/store/slug/${slug}`);
    return response.data;
  }

  /** Increment store view count */
  async incrementStoreView(slug: string): Promise<void> {
    await axiosInstance.post(`/store/slug/${slug}/view`);
  }

  /** Update current user's store */
  async updateStore(formData: FormData): Promise<{ message: string }> {
    const response = await axiosInstance.put('/store/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /** Get minimum balance required for store request */
  async getMinStoreBalance(): Promise<number> {
    const response = await axiosInstance.get<{ minBalance: number }>('/store/min-balance');
    return response.data.minBalance;
  }
}


export const storeService = new StoreService();
