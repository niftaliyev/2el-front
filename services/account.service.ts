import axiosInstance from '@/lib/axios';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'Deposit' | 'Purchase';
  description: string;
}

export interface AdPlacementLimit {
  categoryId: string;
  categoryName: string;
  freeLimit: number;
  paidPrice: number;
  usedCount: number;
}

class AccountService {
  async getTransactions(): Promise<Transaction[]> {
    const response = await axiosInstance.get<Transaction[]>('/account/transactions');
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
}

export const accountService = new AccountService();
