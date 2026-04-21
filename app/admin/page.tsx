'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/features/admin/StatCard';
import ActivityFeed from '@/components/features/admin/ActivityFeed';
import { adminService } from '@/services/admin.service';
import { DashboardStats, RecentActivity } from '@/types/admin';
import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const pendingData = await adminService.getPendingAds(1, 1);
        // Build minimal stats from real API data
        setStats({
          totalUsers: 0, // No dedicated user list API for admin yet
          totalAds: pendingData.totalElements,
          pendingApprovals: pendingData.totalElements,
          activeAds: 0,
          todayUsers: 0,
          todayAds: 0,
          totalRevenue: 0,
        } as DashboardStats);
        setActivities([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">İdarəetmə paneli statistikası və son fəaliyyətlər</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Cəmi İstifadəçilər"
            value={stats.totalUsers}
            icon="group"
            variant="primary"
            change={{
              value: Math.round(((stats.todayUsers / stats.totalUsers) * 100) * 10) / 10,
              label: 'bu gün',
            }}
          />
          <StatCard
            title="Cəmi Elanlar"
            value={stats.totalAds}
            icon="article"
            variant="success"
            change={{
              value: Math.round(((stats.todayAds / stats.totalAds) * 100) * 10) / 10,
              label: 'bu gün',
            }}
          />
          <StatCard
            title="Gözləyən Elanlar"
            value={stats.pendingApprovals}
            icon="pending"
            variant="warning"
          />
          <StatCard
            title="Aktiv Elanlar"
            value={stats.activeAds}
            icon="check_circle"
            variant="success"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={ROUTES.ADMIN_ADS}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl">article</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Elan İdarəetməsi</h3>
              <p className="text-sm text-gray-600">Elanları idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href={ROUTES.ADMIN_USERS}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <span className="material-symbols-outlined text-purple-600 text-2xl">group</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">İstifadəçi İdarəetməsi</h3>
              <p className="text-sm text-gray-600">İstifadəçiləri idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/payment-details"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
              <span className="material-symbols-outlined text-amber-600 text-2xl">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Ödəniş Məlumatları</h3>
              <p className="text-sm text-gray-600">Bank hesablarını tənzimlə</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/help"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 bg-sky-50 rounded-lg group-hover:bg-sky-100 transition-colors">
              <span className="material-symbols-outlined text-sky-600 text-2xl">help_outline</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Yardım İdarəetməsi</h3>
              <p className="text-sm text-gray-600">Sual-cavabları idarə et</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/seed-data"

          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
              <span className="material-symbols-outlined text-rose-600 text-2xl">dataset</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Marka / Model</h3>
              <p className="text-sm text-gray-600">Marka və modelləri tənzimlə</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 bg-green-50 rounded-lg">
              <span className="material-symbols-outlined text-green-600 text-2xl">attach_money</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Cəmi Gəlir</h3>
              <p className="text-sm text-gray-600">{stats?.totalRevenue.toLocaleString()} ₼</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <ActivityFeed activities={activities} />
    </div>
  );
}
