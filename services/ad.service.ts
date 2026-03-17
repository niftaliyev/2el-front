import axiosInstance from '@/lib/axios';

export interface CategoryResponse {
  id: number;
  name: string;
  parentId?: number;
}

export interface AdType {
  id: number;
  name: string;
}

export interface CreateAdRequest {
  CityId: number;
  Price: number;
  IsDeliverable: boolean;
  IsNew: boolean;
  PhoneNumber: string;
  AdTypeId: number;
  Title: string;
  Images: File[];
  CategoryId: number;
  FullName: string;
  Email: string;
  Description: string;
}

export interface AccountAd {
  id: number;
  title: string;
  description: string;
  status: string; // "Pending", "Active", "Inactive", "Rejected"
  createdAt: string;
  images: string[];
  category: string;
  price: number;
  phoneNumber: string;
  email: string;
  isVip: boolean;
  isPremium: boolean;
  isBoosted: boolean;
  boostedAt: string | null;
  isNew: boolean;
  isDeliverable: boolean;
  viewCount: number;
  expiresAt: string;
  city: string;
  adType: string;
  fullName: string;
  isStore: boolean;
}

export interface PremiumAd {
  id: number;
  title: string;
  price: number;
  image: string;
}

export interface ListingResponse {
  id: number;
  title: string;
  price: number;
  status: string;
  image: string;
  createdAt: string;
}

class AdService {
  /**
   * Get all ads
   */
  async getAllAds(): Promise<ListingResponse[]> {
    const response = await axiosInstance.get<ListingResponse[]>('/ad/all');
    return response.data;
  }

  /**
   * Get categories
   * @param parentId Optional parent ID to get subcategories
   */
  async getCategories(parentId?: number): Promise<CategoryResponse[]> {
    const params = parentId ? { parentID: parentId } : {};
    const response = await axiosInstance.get<CategoryResponse[]>('/category', { params });
    return response.data;
  }

  /**
   * Get ad types
   */
  async getAdTypes(): Promise<AdType[]> {
    const response = await axiosInstance.get<AdType[]>('/ad/types');
    return response.data;
  }

  /**
   * Create a new ad
   */
  async createAd(adData: CreateAdRequest): Promise<any> {
    const formData = new FormData();

    // Append all fields to FormData
    formData.append('CityId', adData.CityId.toString());
    formData.append('Price', adData.Price.toString());
    formData.append('IsDeliverable', adData.IsDeliverable.toString());
    formData.append('IsNew', adData.IsNew.toString());
    formData.append('PhoneNumber', adData.PhoneNumber);
    formData.append('AdTypeId', adData.AdTypeId.toString());
    formData.append('Title', adData.Title);
    formData.append('CategoryId', adData.CategoryId.toString());
    formData.append('FullName', adData.FullName);
    formData.append('Email', adData.Email);
    formData.append('Description', adData.Description);

    // Append images
    adData.Images.forEach((image) => {
      formData.append('Images', image);
    });

    // For FormData, axios will automatically set Content-Type with boundary
    // The interceptor will handle removing the default Content-Type header
    const response = await axiosInstance.post('/ad', formData);

    return response.data;
  }

  /**
   * Get active ads for current user
   */
  async getActiveAds(): Promise<AccountAd[]> {
    const response = await axiosInstance.get<AccountAd[]>('/account/my-active-ads');
    return response.data || [];
  }

  /**
   * Get pending ads for current user
   */
  async getPendingAds(): Promise<AccountAd[]> {
    const response = await axiosInstance.get<AccountAd[]>('/account/my-pending-ads');
    return response.data || [];
  }

  /**
   * Get inactive ads for current user
   */
  async getInactiveAds(): Promise<AccountAd[]> {
    const response = await axiosInstance.get<AccountAd[]>('/account/my-inactive-ads');
    return response.data || [];
  }

  /**
   * Get rejected ads for current user
   */
  async getRejectedAds(): Promise<AccountAd[]> {
    const response = await axiosInstance.get<AccountAd[]>('/account/my-rejected-ads');
    return response.data || [];
  }

  /**
   * Delete an ad
   */
  async deleteAd(adId: number): Promise<void> {
    await axiosInstance.delete(`/account/ads/${adId}`);
  }

  /**
   * Promote an ad
   */
  async promoteAd(adId: number): Promise<any> {
    const response = await axiosInstance.post(`/account/ads/${adId}/promote`);
    return response.data;
  }

  /**
   * Get premium ads
   */
  async getPremiumAds(): Promise<PremiumAd[]> {
    const response = await axiosInstance.get<PremiumAd[]>('/ad/premium');
    return response.data || [];
  }
  /**
   * Get ad by ID
   */
  async getAdById(id: number): Promise<AccountAd> {
    // Mock implementation for now
    const mockAd: AccountAd = {
      id: id,
      title: 'Mock Ad Title',
      description: 'This is a mock description for testing edit functionality.',
      status: 'Active',
      createdAt: new Date().toISOString(),
      images: [],
      category: 'Electronics',
      price: 1500,
      phoneNumber: '+994501234567',
      email: 'test@example.com',
      isVip: false,
      isPremium: false,
      isBoosted: false,
      boostedAt: null,
      isNew: true,
      isDeliverable: true,
      viewCount: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      city: 'Bakı',
      adType: 'Sell',
      fullName: 'Test User',
      isStore: false,
    };
    return new Promise((resolve) => setTimeout(() => resolve(mockAd), 500));
  }

  /**
   * Update an ad
   */
  async updateAd(id: number, adData: CreateAdRequest): Promise<any> {
    // Mock implementation
    console.log(`Updating ad ${id} with data:`, adData);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  }
}

// Export singleton instance
export const adService = new AdService();
