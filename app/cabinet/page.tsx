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
import { useLanguage } from '@/contexts/LanguageContext';

interface Listing {
  id: string;
  title: string;
  slug?: string;
  parentCategorySlug?: string;
  childCategorySlug?: string;
  location: string;
  price: number;
  imageUrl: string;
  postedDate: string;
  categoryName?: string;
  categoryNameRu?: string;
  cityNameRu?: string;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
  isBoosted: boolean;
  boostedAt?: string;
  totalBoostsRemaining: number;
  vipExpiresAt?: string;
  premiumExpiresAt?: string;
}

export default function CabinetPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'inactive' | 'rejected'>('active');
  const { t, language } = useLanguage();
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
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      switch (activeTab) {
        case 'active':
          response = await adService.getActiveAds(page, pageSize);
          break;
        case 'pending':
          response = await adService.getPendingAds(page, pageSize);
          break;
        case 'inactive':
          response = await adService.getInactiveAds(page, pageSize);
          break;
        case 'rejected':
          response = await adService.getRejectedAds(page, pageSize);
          break;
      }

      const ads = response?.data || [];
      setTotalPages(response?.totalPages || 0);
      setTotalCount(response?.totalCount || 0);

      const transformedListings: Listing[] = ads.map(ad => {
        const formattedDate = ad.createdDate
          ? new Date(ad.createdDate).toLocaleDateString(language === 'az' ? 'az-AZ' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : '';
        const imageUrl = ad.image ? getImageUrl(ad.image) : '';
        const normalizedStatus = ad.status.toLowerCase() as 'active' | 'pending' | 'inactive' | 'rejected';
        return {
          id: ad.id.toString(),
          title: ad.title,
          slug: ad.slug,
          parentCategorySlug: ad.parentCategorySlug,
          childCategorySlug: ad.childCategorySlug,
          location: ad.city || t('cabinet.cityNotShown'),
          cityNameRu: ad.cityRu,
          price: ad.price,
          imageUrl,
          postedDate: formattedDate,
          categoryName: ad.category,
          categoryNameRu: ad.categoryRu,
          status: normalizedStatus,
          isBoosted: ad.isBoosted,
          boostedAt: ad.boostedAt,
          totalBoostsRemaining: ad.totalBoostsRemaining,
          vipExpiresAt: ad.vipExpiresAt,
          premiumExpiresAt: ad.premiumExpiresAt,
        };
      });

      setListings(transformedListings);
    } catch (err: any) {
      setError(t('cabinet.loadError'));
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
        active: active.totalCount,
        pending: pending.totalCount,
        inactive: inactive.totalCount,
        rejected: rejected.totalCount,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [activeTab, page]);

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
      toast.success(t('cabinet.deleteSuccess'));
    } catch (err: any) {
      console.error('Error deleting ad:', err);
      toast.error(err.message || t('cabinet.deleteError'));
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
        toast.success(t('cabinet.reactivateSuccess'));
        setActiveTab('pending');
        fetchCounts();
      } else {
        toast.error(result.message || t('common.error'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || t('common.error'));
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
                  {t('cabinet.myListings')}
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  {t('cabinet.manageListings')}
                </p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100 mb-8">
                <div className="grid grid-cols-2 sm:flex items-center sm:gap-8">
                  {(['active', 'pending', 'inactive', 'rejected'] as const).map((tab) => {
                    const iconMap = {
                      active: 'check_circle',
                      pending: 'schedule',
                      inactive: 'visibility_off',
                      rejected: 'cancel'
                    };
                    const labelMap = {
                      active: t('cabinet.active'),
                      pending: t('cabinet.pending'),
                      inactive: t('cabinet.inactive'),
                      rejected: t('cabinet.rejected')
                    };

                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setPage(1);
                        }}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 pb-4 pt-2 border-b-2 transition-all group cursor-pointer sm:px-2 w-full sm:w-auto ${activeTab === tab ? 'border-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                          }`}
                      >
                        <span className={`material-symbols-outlined !text-[18px] sm:!text-[20px] ${activeTab === tab ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {iconMap[tab]}
                        </span>
                        <div className="flex items-center gap-1">
                          <p className={`text-[10px] sm:text-sm font-bold transition-colors ${activeTab === tab ? 'text-primary' : ''
                            }`}>
                            {labelMap[tab]}
                          </p>
                          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-500'
                            }`}>
                            {getTabCount(tab)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
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
                  <p className="text-gray-400 text-sm font-medium">{t('cabinet.loadingListings')}</p>
                </div>
              ) : (
                <>
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
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
                      <h3 className="text-gray-900 text-lg font-bold">{t('cabinet.noListings')}</h3>
                      <p className="text-gray-500 text-sm mt-1">{t('cabinet.noListingsDesc')}</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all cursor-pointer ${page === i + 1
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  )}
                </>
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
        title={t('cabinet.deleteAd')}
        description={t('cabinet.deleteAdConfirm')}
        confirmText={t('common.delete')}
        isDestructive
        isLoading={isDeleting}
      />
    </main>
  );
}
