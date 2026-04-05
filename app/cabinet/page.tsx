'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import UserListingCard from '@/components/features/cabinet/UserListingCard';
import PromoteAdModal from '@/components/features/cabinet/PromoteAdModal';
import { adService } from '@/services/ad.service';
import { AdListItem } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { Modal, ConfirmDialog, Button } from '@/components/ui';

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  postedDate: string;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
}

export default function CabinetPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'inactive' | 'rejected'>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoteAdId, setPromoteAdId] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    active: 0,
    pending: 0,
    inactive: 0,
    rejected: 0,
  });
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let ads: AdListItem[] = [];
      switch (activeTab) {
        case 'active':
          ads = await adService.getActiveAds();
          break;
        case 'pending':
          ads = await adService.getPendingAds();
          break;
        case 'inactive':
          ads = await adService.getInactiveAds();
          break;
        case 'rejected':
          ads = await adService.getRejectedAds();
          break;
      }

      const transformedListings: Listing[] = ads.map(ad => {
        const formattedDate = ad.createdDate
          ? new Date(ad.createdDate).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : '';
        const imageUrl = ad.image ? getImageUrl(ad.image) : '';
        const normalizedStatus = ad.status.toLowerCase() as 'active' | 'pending' | 'inactive' | 'rejected';
        return {
          id: ad.id.toString(),
          title: ad.title,
          location: ad.city || 'Şəhər göstərilməyib',
          price: ad.price,
          imageUrl,
          postedDate: formattedDate,
          status: normalizedStatus,
        };
      });

      setListings(transformedListings);
    } catch (err: any) {
      setError('Elanları yükləmək mümkün olmadı');
      console.error('Error fetching ads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const [active, pending, inactive, rejected] = await Promise.all([
        adService.getActiveAds(),
        adService.getPendingAds(),
        adService.getInactiveAds(),
        adService.getRejectedAds(),
      ]);

      setCounts({
        active: active.length,
        pending: pending.length,
        inactive: inactive.length,
        rejected: rejected.length,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [activeTab]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const getTabCount = (status: 'active' | 'pending' | 'inactive' | 'rejected') => {
    return counts[status];
  };

  const handlePromote = (id: string) => {
    setPromoteAdId(id);
  };

  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/listings/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteAdId) return;

    setIsDeleting(true);
    try {
      await adService.deleteAd(deleteAdId);
      setListings(prev => prev.filter(listing => listing.id !== deleteAdId));
      setCounts(prev => ({
        ...prev,
        [activeTab]: prev[activeTab as keyof typeof prev] - 1,
      }));
      toast.success('Elan uğurla silindi');
    } catch (err: any) {
      console.error('Error deleting ad:', err);
      toast.error(err.message || 'Elanı silmək mümkün olmadı');
    } finally {
      setIsDeleting(false);
      setDeleteAdId(null);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await adService.reactivateAd(id);
      if (result.isSuccess) {
        toast.success('Elan yeniləndi və baxışa göndərildi');
        setActiveTab('pending');
        fetchCounts();
      } else {
        toast.error(result.message || 'Xəta baş verdi');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading */}
              <div className="mb-6">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">
                  Elanlarım
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Elanlarınızı idarə edin və statuslarını izləyin
                </p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100 mb-8 overflow-hidden">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth">
                  {(['active', 'pending', 'inactive', 'rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 pb-4 pt-1 border-b-2 transition-all whitespace-nowrap group ${activeTab === tab ? 'border-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      <p className={`text-sm font-bold transition-colors ${activeTab === tab ? 'text-primary' : ''
                        }`}>
                        {tab === 'active' ? 'Aktiv' : tab === 'pending' ? 'Gözləmədə' : tab === 'inactive' ? 'Passiv' : 'Rədd edilmiş'}
                      </p>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${activeTab === tab
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-500'
                        }`}>
                        {getTabCount(tab)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error/Status */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500 text-xl font-bold italic">warning</span>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Loading */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin h-8 w-8 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
                  <p className="text-gray-400 text-sm font-medium">Yüklenir...</p>
                </div>
              ) : (
                listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {listings.map(listing => (
                      <UserListingCard
                        key={listing.id}
                        listing={listing}
                        onPromote={handlePromote}
                        onEdit={handleEdit}
                        onDelete={(id) => setDeleteAdId(id)}
                        onReactivate={handleReactivate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                    <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-gray-300 text-4xl">layers_clear</span>
                    </div>
                    <h3 className="text-gray-900 text-lg font-bold">Elan tapılmadı</h3>
                    <p className="text-gray-500 text-sm mt-1">Bu bölmədə göstəriləcək elanınız yoxdur.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <PromoteAdModal
        isOpen={!!promoteAdId}
        onClose={() => setPromoteAdId(null)}
        adId={promoteAdId || ''}
      />

      <ConfirmDialog
        isOpen={!!deleteAdId}
        onClose={() => setDeleteAdId(null)}
        onConfirm={handleDelete}
        title="Elanı sil"
        description="Bu elanı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Sil"
        isDestructive
        isLoading={isDeleting}
      />
    </main>
  );
}
