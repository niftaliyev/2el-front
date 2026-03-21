import axiosInstance from '@/lib/axios';
import {
  StoreDetail,
  StoreAdItem,
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

  /** Get store ads */
  async getStoreAds(storeId: string, page = 1, pageSize = 20): Promise<StoreAdItem[]> {
    const response = await axiosInstance.get<StoreAdItem[]>(`/store/${storeId}/ads`, {
      params: { page, pageSize },
    });
    return response.data ?? [];
  }

  /** Create store */
  async createStore(dto: CreateStoreDto): Promise<void> {
    await axiosInstance.post('/store', dto);
  }

  /** Follow a store */
  async followStore(storeId: string): Promise<void> {
    await axiosInstance.post(`/store/${storeId}/follow`);
  }

  /** Unfollow a store */
  async unfollowStore(storeId: string): Promise<void> {
    await axiosInstance.delete(`/store/${storeId}/follow`);
  }
}

export const storeService = new StoreService();
