'use client';

import { useEffect, useState } from 'react';
import { AdminUser } from '@/types/admin';
import { adminService } from '@/services/admin.service';
import AdminUserTable from '@/components/features/admin/AdminUserTable';
import AdminActionModal from '@/components/features/admin/AdminActionModal';
import BulkActionBar from '@/components/features/admin/BulkActionBar';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { USER_STATUSES } from '@/constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'suspend' | 'activate' | 'delete';
    user: AdminUser | null;
  }>({
    isOpen: false,
    action: 'suspend',
    user: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, activeTab, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => user.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const getTabCounts = () => {
    const counts: Record<string, number> = {};
    USER_STATUSES.forEach(status => {
      if (status.value === 'all') {
        counts[status.value] = users.length;
      } else {
        counts[status.value] = users.filter(user => user.status === status.value).length;
      }
    });
    return counts;
  };

  const handleAction = (action: string, user: AdminUser) => {
    setModalState({
      isOpen: true,
      action: action as any,
      user,
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!modalState.user) return;

    try {
      switch (modalState.action) {
        case 'suspend':
          await adminService.suspendUser(modalState.user.id);
          break;
        case 'activate':
          await adminService.activateUser(modalState.user.id);
          break;
        case 'delete':
          await adminService.deleteUser(modalState.user.id);
          break;
      }
      await fetchUsers();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedIds.length === 0) return;

    try {
      await adminService.bulkUserAction({
        action,
        ids: selectedIds,
      });
      await fetchUsers();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const tabCounts = getTabCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">İstifadəçi İdarəetməsi</h1>
        <p className="text-gray-600">Bütün istifadəçiləri idarə edin və nəzarət edin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 bg-blue-50 rounded-lg">
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cəmi</p>
              <p className="text-2xl font-bold text-gray-900">{tabCounts['all']}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 bg-green-50 rounded-lg">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Aktiv</p>
              <p className="text-2xl font-bold text-gray-900">{tabCounts['active']}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 bg-amber-50 rounded-lg">
              <span className="material-symbols-outlined text-amber-600">block</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dayandırılıb</p>
              <p className="text-2xl font-bold text-gray-900">{tabCounts['suspended']}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 bg-red-50 rounded-lg">
              <span className="material-symbols-outlined text-red-600">cancel</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Blok edilib</p>
              <p className="text-2xl font-bold text-gray-900">{tabCounts['banned']}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <Input
          type="text"
          placeholder="Ad, e-poçt və ya telefon ilə axtar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-2 overflow-x-auto">
          {USER_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setActiveTab(status.value);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                activeTab === status.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{status.label}</span>
              <Badge variant={status.color}>
                {tabCounts[status.value] || 0}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AdminUserTable
          users={filteredUsers}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAction={handleAction}
        />
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: 'Aktivləşdir',
            icon: 'check_circle',
            onClick: () => handleBulkAction('activate'),
            variant: 'primary',
          },
          {
            label: 'Dayandır',
            icon: 'block',
            onClick: () => handleBulkAction('suspend'),
            variant: 'secondary',
          },
          {
            label: 'Sil',
            icon: 'delete',
            onClick: () => handleBulkAction('delete'),
            variant: 'danger',
          },
        ]}
      />

      {/* Action Modal */}
      <AdminActionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        action={modalState.action}
        itemType="user"
        itemTitle={modalState.user?.name || ''}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
