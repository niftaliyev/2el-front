import axiosInstance from '@/lib/axios';
import {
  PendingBalanceRequest,
  CreditUserRequest,
  RoleItem,
  AdListItem,
  PaginatedResponse,
} from '@/types/api';

interface AdminPendingAdsResponse {
  data: AdListItem[];
  totalElements: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  totalPages: number;
}

class AdminService {
  // ── Ads ───────────────────────────────────────────────────────────────────

  async getPendingAds(page = 1, pageSize = 10): Promise<AdminPendingAdsResponse> {
    const response = await axiosInstance.get<AdminPendingAdsResponse>('/admin/ads/pending', {
      params: { page, pageSize },
    });
    return response.data;
  }

  async approveAd(id: string): Promise<void> {
    await axiosInstance.post(`/admin/ads/${id}/approve`);
  }

  async rejectAd(id: string, reason?: string): Promise<void> {
    await axiosInstance.post(`/admin/ads/${id}/reject`, { reason });
  }

  async getBoostedAds(): Promise<unknown[]> {
    const response = await axiosInstance.get<unknown[]>('/admin/boosted-ads');
    return response.data ?? [];
  }

  // ── Balance ───────────────────────────────────────────────────────────────

  async getPendingBalanceRequests(): Promise<PendingBalanceRequest[]> {
    const response = await axiosInstance.get<PendingBalanceRequest[]>('/admin/pending-balance-increase');
    return response.data ?? [];
  }

  async creditUser(dto: CreditUserRequest): Promise<void> {
    await axiosInstance.post('/admin/increase-balance', dto);
  }

  // ── Balance increase (user-facing) ────────────────────────────────────────

  async requestBalanceIncrease(formData: FormData): Promise<void> {
    await axiosInstance.post('/balance/increase', formData);
  }

  // ── Roles ─────────────────────────────────────────────────────────────────

  async getRoles(): Promise<RoleItem[]> {
    const response = await axiosInstance.get<RoleItem[]>('/roles');
    return response.data ?? [];
  }

  async createRole(roleName: string): Promise<void> {
    await axiosInstance.post(`/roles?roleName=${encodeURIComponent(roleName)}`);
  }

  async addPermissionsToRole(roleName: string, permissions: string[]): Promise<void> {
    await axiosInstance.post(`/roles/${roleName}/permissions`, permissions);
  }

  async assignRole(email: string, roleName: string): Promise<void> {
    await axiosInstance.post(`/roles/assign-role?email=${encodeURIComponent(email)}&roleName=${encodeURIComponent(roleName)}`);
  }

  // ── Admin Ad management stubs (feature/unfeature/delete/bulk) ─────────────
  // Note: Backend doesn't have a general "delete ad as admin" or "feature" endpoint yet.
  // These delegate to the approve/reject endpoints or are no-ops until backend adds them.

  async deleteAd(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/ads/${id}`);
  }

  async featureAd(id: string): Promise<void> {
    // Feature = approve for now
    await this.approveAd(id);
  }

  async unfeatureAd(id: string): Promise<void> {
    // Unfeature not yet implemented on backend
    console.warn('Admin unfeatureAd not yet implemented in backend');
  }

  async bulkAdAction(payload: { ids: string[]; action: string; reason?: string }): Promise<void> {
    for (const id of payload.ids) {
      if (payload.action === 'approve') await this.approveAd(id);
      else if (payload.action === 'reject') await this.rejectAd(id, payload.reason);
      else if (payload.action === 'delete') await this.deleteAd(id);
    }
  }

  // ── User management stubs (backend doesn't have user admin endpoints yet) ──

  async getAllUsers(status?: string): Promise<any[]> {
    console.warn('Admin getAllUsers not yet implemented in backend');
    return [];
  }

  async suspendUser(id: string): Promise<void> {
    console.warn('Admin suspendUser not yet implemented in backend');
  }

  async activateUser(id: string): Promise<void> {
    console.warn('Admin activateUser not yet implemented in backend');
  }

  async deleteUser(id: string): Promise<void> {
    console.warn('Admin deleteUser not yet implemented in backend');
  }

  async bulkUserAction(payload: { ids: string[]; action: string }): Promise<void> {
    console.warn('Admin bulkUserAction not yet implemented in backend');
  }

  async getDashboardStats(): Promise<any> {
    return {};
  }

  async getRecentActivities(): Promise<any[]> {
    return [];
  }

  async getAllAds(status?: string): Promise<any[]> {
    const data = await this.getPendingAds(1, 100);
    return data.data ?? [];
  }

  async updatePaymentDetail(content: string): Promise<void> {
    await axiosInstance.post('/admin/payment-detail', { content });
  }

  async updateSystemSettings(minStoreBalance: number): Promise<void> {
    await axiosInstance.post('/admin/system-settings', { minStoreBalance });
  }

  // ── Business Packages ─────────────────────────────────────────────────────

  async getAdminBusinessPackages(): Promise<any[]> {
    const response = await axiosInstance.get<any[]>('/admin/business-packages');
    return response.data ?? [];
  }

  async upsertBusinessPackage(pkg: any): Promise<void> {
    await axiosInstance.post('/admin/business-packages', pkg);
  }

  async deleteBusinessPackage(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/business-packages/${id}`);
  }

  async getUserBusinessPackages(): Promise<any[]> {
    const response = await axiosInstance.get<any[]>('/admin/user-business-packages');
    return response.data ?? [];
  }

  async getCompanySettings(): Promise<any> {
    const response = await axiosInstance.get('/admin/company-settings');
    return response.data;
  }

  async updateCompanySettings(data: any): Promise<void> {
    await axiosInstance.post('/admin/company-settings', data);
  }

  // ── Reports ────────────────────────────────────────────────────────────────

  async getAdReports(page = 1, pageSize = 10, status?: any): Promise<any> {
    const response = await axiosInstance.get('/admin/reports/ad', {
      params: { page, pageSize, status },
    });
    return response.data;
  }

  async getStoreReports(page = 1, pageSize = 10, status?: any): Promise<any> {
    const response = await axiosInstance.get('/admin/reports/store', {
      params: { page, pageSize, status },
    });
    return response.data;
  }

  async updateAdReportStatus(id: string, status: number): Promise<void> {
    await axiosInstance.patch(`/admin/reports/ad/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
    });
  }

  async updateStoreReportStatus(id: string, status: number): Promise<void> {
    await axiosInstance.patch(`/admin/reports/store/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
    });
  }

  async deleteAdReport(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/reports/ad/${id}`);
  }

  async deleteStoreReport(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/reports/store/${id}`);
  }

  // ── Seed Data ─────────────────────────────────────────────────────────────

  async getSeedDataCars(): Promise<string> {
    const response = await axiosInstance.get<string>('/admin/seed-data/cars');
    return response.data;
  }

  async updateSeedDataCars(json: string): Promise<void> {
    await axiosInstance.post('/admin/seed-data/cars', json, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getSeedDataPhones(): Promise<string> {
    const response = await axiosInstance.get<string>('/admin/seed-data/phones');
    return response.data;
  }

  async updateSeedDataPhones(json: string): Promise<void> {
    await axiosInstance.post('/admin/seed-data/phones', json, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async syncSeedData(): Promise<void> {
    await axiosInstance.post('/admin/seed-data/sync');
  }

  // ── Help Management ───────────────────────────────────────────────────────

  async upsertHelpCategory(data: any): Promise<any> {
    const response = await axiosInstance.post('/admin/help/category', data);
    return response.data;
  }

  async deleteHelpCategory(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/help/category/${id}`);
  }

  async upsertHelpItem(categoryId: string, data: any): Promise<any> {
    const response = await axiosInstance.post(`/admin/help/category/${categoryId}/item`, data);
    return response.data;
  }

  async deleteHelpItem(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/help/item/${id}`);
  }

  // Static Pages
  async upsertStaticPage(data: any): Promise<any> {
    const response = await axiosInstance.post('/admin/help/pages', data);
    return response.data;
  }

  async deleteStaticPage(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/help/pages/${id}`);
  }

  // Legal Policies
  async upsertLegalPolicy(data: any): Promise<any> {
    const response = await axiosInstance.post('/admin/help/legal', data);
    return response.data;
  }

  async deleteLegalPolicy(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/help/legal/${id}`);
  }

  // Privacy Policy
  async upsertPrivacyPolicy(data: any): Promise<any> {
    const response = await axiosInstance.post('/admin/help/privacy', data);
    return response.data;
  }

  async deletePrivacyPolicy(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/help/privacy/${id}`);
  }
}



export const adminService = new AdminService();
