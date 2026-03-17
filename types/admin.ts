import { User } from './index';

export interface AdminUser extends User {
  status: 'active' | 'suspended' | 'banned';
  registeredAt: Date;
  lastLogin: Date;
  adsCount: number;
  isAdmin?: boolean;
}

export interface AdminAd {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  location: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  status: 'active' | 'pending' | 'rejected' | 'expired';
  isPremium: boolean;
  isFeatured: boolean;
  isBoosted: boolean;
  createdAt: Date;
  viewCount: number;
  rejectionReason?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  pendingApprovals: number;
  activeAds: number;
  totalRevenue: number;
  todayUsers: number;
  todayAds: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'ad_created' | 'ad_approved' | 'ad_rejected' | 'ad_deleted' | 'user_suspended';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
  };
}

export type BulkAction = 'approve' | 'reject' | 'delete' | 'feature' | 'unfeature' | 'suspend' | 'activate';

export interface BulkActionPayload {
  action: BulkAction;
  ids: string[];
  reason?: string;
}
