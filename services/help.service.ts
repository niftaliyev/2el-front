import axiosInstance from '@/lib/axios';
import { HelpCategory, StaticPage, LegalPolicy, PrivacyPolicy } from '@/types/help';

export const helpService = {
  getContent: async (): Promise<HelpCategory[]> => {
    const response = await axiosInstance.get<HelpCategory[]>('/help/content');
    return response.data;
  },

  getCategory: async (slug: string): Promise<HelpCategory> => {
    const response = await axiosInstance.get<HelpCategory>(`/help/category/${slug}`);
    return response.data;
  },

  getStaticPages: async (): Promise<StaticPage[]> => {
    const response = await axiosInstance.get<StaticPage[]>('/help/pages');
    return response.data;
  },

  getStaticPage: async (slug: string): Promise<StaticPage> => {
    const response = await axiosInstance.get<StaticPage>(`/help/pages/${slug}`);
    return response.data;
  },

  getLegalPolicies: async (): Promise<LegalPolicy[]> => {
    const response = await axiosInstance.get<LegalPolicy[]>('/help/legal');
    return response.data;
  },

  getLegalPolicy: async (slug: string): Promise<LegalPolicy> => {
    const response = await axiosInstance.get<LegalPolicy>(`/help/legal/${slug}`);
    return response.data;
  },

  getPrivacyPolicy: async (slug: string): Promise<PrivacyPolicy> => {
    const response = await axiosInstance.get<PrivacyPolicy>(`/help/privacy/${slug}`);
    return response.data;
  }
};
