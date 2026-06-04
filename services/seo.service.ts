import axiosInstance from '@/lib/axios';

export interface SeoPageData {
  id: string;
  slug: string;
  titleH1: string;
  contentTop?: string;
  titleH2?: string;
  contentBottom?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SitemapAdDto {
  id: string;
  pinCode?: number;
  parentCategorySlug?: string;
  childCategorySlug?: string;
  lastModified: string;
}

export interface SitemapPageDto {
  slug: string;
  lastModified: string;
}

class SeoService {
  async getPageBySlug(slug: string): Promise<SeoPageData | null> {
    try {
      const response = await axiosInstance.get<SeoPageData>(`/seo/pages/${slug}`);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getSitemapAds(): Promise<SitemapAdDto[]> {
    const response = await axiosInstance.get<SitemapAdDto[]>('/seo/sitemap/ads');
    return response.data || [];
  }

  async getSitemapPages(): Promise<SitemapPageDto[]> {
    const response = await axiosInstance.get<SitemapPageDto[]>('/seo/sitemap/pages');
    return response.data || [];
  }

  async getActivePages(): Promise<{ slug: string; titleH1: string }[]> {
    const response = await axiosInstance.get<{ slug: string; titleH1: string }[]>('/seo/pages');
    return response.data || [];
  }
}

export const seoService = new SeoService();
