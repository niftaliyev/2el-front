'use client';

import { useEffect, useState } from 'react';
import { AdminAd } from '@/types/admin';
import { adminService } from '@/services/admin.service';
import AdminAdTable from '@/components/features/admin/AdminAdTable';
import AdminActionModal from '@/components/features/admin/AdminActionModal';
import BulkActionBar from '@/components/features/admin/BulkActionBar';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { AD_STATUSES } from '@/constants';

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | 'delete' | 'feature';
    ad: AdminAd | null;
  }>({
    isOpen: false,
    action: 'approve',
    ad: null,
  });

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    filterAds();
  }, [ads, activeTab, searchQuery]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAds();
      setAds(data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAds = () => {
    let filtered = [...ads];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(ad => ad.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ad =>
        ad.title.toLowerCase().includes(query) ||
        ad.seller.name.toLowerCase().includes(query) ||
        ad.seller.email.toLowerCase().includes(query)
      );
    }

    setFilteredAds(filtered);
  };

  const getTabCounts = () => {
    const counts: Record<string, number> = {};
    AD_STATUSES.forEach(status => {
      if (status.value === 'all') {
        counts[status.value] = ads.length;
      } else {
        counts[status.value] = ads.filter(ad => ad.status === status.value).length;
      }
    });
    return counts;
  };

  const handleAction = (action: string, ad: AdminAd) => {
    setModalState({
      isOpen: true,
      action: action as any,
      ad,
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!modalState.ad) return;

    try {
      switch (modalState.action) {
        case 'approve':
          await adminService.approveAd(modalState.ad.id);
          break;
        case 'reject':
          await adminService.rejectAd(modalState.ad.id, reason || 'Səbəb göstərilməyib');
          break;
        case 'delete':
          await adminService.deleteAd(modalState.ad.id);
          break;
        case 'feature':
          if (modalState.ad.isFeatured) {
            await adminService.unfeatureAd(modalState.ad.id);
          } else {
            await adminService.featureAd(modalState.ad.id);
          }
          break;
      }
      await fetchAds();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete' | 'feature') => {
    if (selectedIds.length === 0) return;

    try {
      await adminService.bulkAdAction({
        action,
        ids: selectedIds,
        reason: action === 'reject' ? 'Toplu rədd əməliyyatı' : undefined,
      });
      await fetchAds();
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">Elan İdarəetməsi</h1>
        <p className="text-gray-600">Bütün elanları idarə edin, təsdiqləyin və ya rədd edin</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <Input
          type="text"
          placeholder="Elan, satıcı və ya e-poçt ünvanı ilə axtar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-2 overflow-x-auto">
          {AD_STATUSES.map((status) => (
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
        <AdminAdTable
          ads={filteredAds}
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
            label: 'Təsdiq et',
            icon: 'check_circle',
            onClick: () => handleBulkAction('approve'),
            variant: 'primary',
          },
          {
            label: 'Rədd et',
            icon: 'cancel',
            onClick: () => handleBulkAction('reject'),
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
        itemType="ad"
        itemTitle={modalState.ad?.title || ''}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
