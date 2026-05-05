import axiosInstance from '@/lib/axios';

export enum AdPosition {
  LeftSidebar = 1,
  RightSidebar = 2,
  Top = 3,
  Bottom = 4,
  InnerContent = 5,
}

export interface BannerDto {
  id: string;
  title: string;
  imageUrl?: string;
  targetUrl?: string;
  position: AdPosition;
}

export interface AdApplicationRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  message?: string;
}

export interface AdvertisingSettingDto {
  contactPhone: string;
  email: string;
  address: string;
  addressRu: string;
}

class BannerService {
  async getActiveBanners(position?: AdPosition, categoryId?: string, cityId?: string, language?: string, search?: string): Promise<BannerDto[]> {
    const params: any = {};
    if (position) params.position = position;
    if (categoryId) params.categoryId = categoryId;
    if (cityId) params.cityId = cityId;
    if (language) params.language = language;
    if (search) params.search = search;
    
    const response = await axiosInstance.get<BannerDto[]>('/banner/active', { params });
    return response.data;
  }

  async applyForAd(request: AdApplicationRequest): Promise<void> {
    await axiosInstance.post('/banner/apply', request);
  }

  async incrementView(id: string): Promise<void> {
    await axiosInstance.post(`/banner/${id}/view`);
  }

  async incrementClick(id: string): Promise<void> {
    await axiosInstance.post(`/banner/${id}/click`);
  }
  
  async getSettings(language?: string): Promise<AdvertisingSettingDto> {
    const response = await axiosInstance.get<AdvertisingSettingDto>('/banner/settings', { params: { language } });
    return response.data;
  }
}

export const bannerService = new BannerService();
