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
    // No admin-specific delete endpoint - use adService.deleteAd or add the endpoint later
    console.warn('Admin deleteAd not yet implemented in backend');
  }

  async featureAd(id: string): Promise<void> {
    // Feature = approve for now
    await this.approveAd(id);
  }

  async unfeatureAd(id: string): Promise<void> {
    console.warn('Admin unfeatureAd not yet implemented in backend');
  }

  async bulkAdAction(payload: { ids: string[]; action: string; reason?: string }): Promise<void> {
    for (const id of payload.ids) {
      if (payload.action === 'approve') await this.approveAd(id);
      else if (payload.action === 'reject') await this.rejectAd(id, payload.reason);
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
    // Delegate to getPendingAds for backwards compat with admin UI
    const data = await this.getPendingAds(1, 100);
    return data.data ?? [];
  }
}

export const adminService = new AdminService();
