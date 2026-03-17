import { AdminUser, AdminAd, DashboardStats, RecentActivity, BulkActionPayload } from '@/types/admin';
import { generateDashboardStats, generateRecentActivities, generateAdminUsers, generateAdminAds } from '@/lib/adminData';

class AdminService {
  private users: AdminUser[] = generateAdminUsers(50);
  private ads: AdminAd[] = generateAdminAds(100);

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(generateDashboardStats()), 500)
    );
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(generateRecentActivities()), 500)
    );
  }

  // Ad Management
  async getAllAds(status?: string): Promise<AdminAd[]> {
    let filtered = [...this.ads];
    if (status && status !== 'all') {
      filtered = this.ads.filter(ad => ad.status === status);
    }
    return new Promise((resolve) =>
      setTimeout(() => resolve(filtered), 500)
    );
  }

  async getAdById(id: string): Promise<AdminAd | undefined> {
    const ad = this.ads.find(a => a.id === id);
    return new Promise((resolve) =>
      setTimeout(() => resolve(ad), 300)
    );
  }

  async approveAd(id: string): Promise<void> {
    const ad = this.ads.find(a => a.id === id);
    if (ad) {
      ad.status = 'active';
      ad.rejectionReason = undefined;
    }
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async rejectAd(id: string, reason: string): Promise<void> {
    const ad = this.ads.find(a => a.id === id);
    if (ad) {
      ad.status = 'rejected';
      ad.rejectionReason = reason;
    }
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async deleteAd(id: string): Promise<void> {
    this.ads = this.ads.filter(a => a.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async featureAd(id: string): Promise<void> {
    const ad = this.ads.find(a => a.id === id);
    if (ad) ad.isFeatured = true;
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async unfeatureAd(id: string): Promise<void> {
    const ad = this.ads.find(a => a.id === id);
    if (ad) ad.isFeatured = false;
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async bulkAdAction(payload: BulkActionPayload): Promise<void> {
    payload.ids.forEach(id => {
      const ad = this.ads.find(a => a.id === id);
      if (!ad) return;

      switch (payload.action) {
        case 'approve':
          ad.status = 'active';
          ad.rejectionReason = undefined;
          break;
        case 'reject':
          ad.status = 'rejected';
          ad.rejectionReason = payload.reason || 'Toplu rədd əməliyyatı';
          break;
        case 'delete':
          this.ads = this.ads.filter(a => a.id !== id);
          break;
        case 'feature':
          ad.isFeatured = true;
          break;
        case 'unfeature':
          ad.isFeatured = false;
          break;
      }
    });
    return new Promise((resolve) => setTimeout(() => resolve(), 800));
  }

  // User Management
  async getAllUsers(status?: string): Promise<AdminUser[]> {
    let filtered = [...this.users];
    if (status && status !== 'all') {
      filtered = this.users.filter(user => user.status === status);
    }
    return new Promise((resolve) =>
      setTimeout(() => resolve(filtered), 500)
    );
  }

  async getUserById(id: string): Promise<AdminUser | undefined> {
    const user = this.users.find(u => u.id === id);
    return new Promise((resolve) =>
      setTimeout(() => resolve(user), 300)
    );
  }

  async suspendUser(id: string): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (user) user.status = 'suspended';
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async activateUser(id: string): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (user) user.status = 'active';
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async banUser(id: string): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (user) user.status = 'banned';
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async deleteUser(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  async bulkUserAction(payload: BulkActionPayload): Promise<void> {
    payload.ids.forEach(id => {
      const user = this.users.find(u => u.id === id);
      if (!user) return;

      switch (payload.action) {
        case 'suspend':
          user.status = 'suspended';
          break;
        case 'activate':
          user.status = 'active';
          break;
        case 'delete':
          this.users = this.users.filter(u => u.id !== id);
          break;
      }
    });
    return new Promise((resolve) => setTimeout(() => resolve(), 800));
  }
}

export const adminService = new AdminService();
