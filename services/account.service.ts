import axiosInstance from '@/lib/axios';
import { PaginatedResponse } from '@/types/api';

export interface Transaction {
  id: string;
  title: string;
  titleRu?: string;
  amount: number;
  date: string;
  type: 'Deposit' | 'Purchase' | 'Withdrawal' | 'Refund';
  description: string;
  descriptionRu?: string;
  adId?: string;
  adTitle?: string;
}

export interface AdPlacementLimit {
  categoryId: string;
  categoryName: string;
  categoryNameRu?: string;
  parentCategoryName?: string;
  parentCategoryNameRu?: string;
  categoryImageUrl?: string;
  freeLimit: number;
  usedCount: number;
  usedFreeCount: number;
  paidCount: number;
  nextFreeAt?: string;
  paidPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  serviceType: string;
  serviceTypeRu?: string;
  createdDate: string;
  paidDate?: string;
  pdfUrl?: string;
}

class AccountService {
  async getTransactions(page = 1, pageSize = 10, filter?: number): Promise<PaginatedResponse<Transaction[]>> {
    const response = await axiosInstance.get<PaginatedResponse<Transaction[]>>('/account/transactions', {
      params: { page, pageSize, filter }
    });
    return response.data;
  }

  async getInvoices(page = 1, pageSize = 10, status?: string): Promise<PaginatedResponse<Invoice[]>> {
    const response = await axiosInstance.get<PaginatedResponse<Invoice[]>>('/account/invoices', {
      params: { page, pageSize, status }
    });
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await axiosInstance.get<Invoice>(`/account/invoices/${id}`);
    return response.data;
  }

  async getPlacementLimits(): Promise<AdPlacementLimit[]> {
    const response = await axiosInstance.get<AdPlacementLimit[]>('/account/placement-limits');
    return response.data;
  }

  async getProfile() {
    const response = await axiosInstance.get('/account/profile');
    return response.data;
  }

  async updateProfile(formData: FormData) {
    const response = await axiosInstance.put('/account/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async topUpBalance(formData: FormData) {
    const response = await axiosInstance.post('/balance/increase', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getPaymentDetail(): Promise<{ content: string }> {
    const response = await axiosInstance.get('/balance/payment-detail');
    return response.data;
  }
  getInvoiceDownloadUrl(id: string): string {
    return `${axiosInstance.defaults.baseURL}account/invoices/${id}/download-pdf`;
  }

  async getCompanySettings() {
    const response = await axiosInstance.get('/account/company-settings');
    return response.data;
  }
}

export const accountService = new AccountService();
