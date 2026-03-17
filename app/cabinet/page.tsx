'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import UserListingCard from '@/components/features/cabinet/UserListingCard';
import { adService, AccountAd } from '@/services/ad.service';
import { getImageUrl } from '@/lib/utils';

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
  const [counts, setCounts] = useState({
    active: 0,
    pending: 0,
    inactive: 0,
    rejected: 0,
  });

  // Fetch ads based on active tab
  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let ads: AccountAd[] = [];
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

        // Transform API response to Listing format
        const transformedListings: Listing[] = ads.map(ad => {
          // Format date
          let formattedDate = '';
          if (ad.createdAt) {
            try {
              const date = new Date(ad.createdAt);
              formattedDate = date.toLocaleDateString('az-AZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
            } catch (e) {
              formattedDate = ad.createdAt;
            }
          }

          // Get first image and prepend base URL if it's a relative path
          const imageUrl = ad.images && ad.images.length > 0
            ? getImageUrl(ad.images[0])
            : '';

          // Normalize status to lowercase
          const normalizedStatus = ad.status.toLowerCase() as 'active' | 'pending' | 'inactive' | 'rejected';

          return {
            id: ad.id.toString(),
            title: ad.title,
            location: ad.city || 'Şəhər göstərilməyib',
            price: ad.price,
            imageUrl: imageUrl,
            postedDate: formattedDate,
            status: normalizedStatus,
          };
        });

        setListings(transformedListings);
      } catch (err: any) {
        setError(err.message || 'Elanları yükləmək mümkün olmadı');
        console.error('Error fetching ads:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, [activeTab]);

  // Fetch counts for all tabs
  useEffect(() => {
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

    fetchCounts();
  }, []);

  const getTabCount = (status: 'active' | 'pending' | 'inactive' | 'rejected') => {
    return counts[status];
  };

  const handlePromote = async (id: string) => {
    try {
      await adService.promoteAd(parseInt(id));
      // Refresh current tab
      const fetchAds = async () => {
        let ads: AccountAd[] = [];
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
          // Format date
          let formattedDate = '';
          if (ad.createdAt) {
            try {
              const date = new Date(ad.createdAt);
              formattedDate = date.toLocaleDateString('az-AZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
            } catch (e) {
              formattedDate = ad.createdAt;
            }
          }

          // Get first image and prepend base URL if it's a relative path
          const imageUrl = ad.images && ad.images.length > 0
            ? getImageUrl(ad.images[0])
            : '';

          // Normalize status to lowercase
          const normalizedStatus = ad.status.toLowerCase() as 'active' | 'pending' | 'inactive' | 'rejected';

          return {
            id: ad.id.toString(),
            title: ad.title,
            location: ad.city || 'Şəhər göstərilməyib',
            price: ad.price,
            imageUrl: imageUrl,
            postedDate: formattedDate,
            status: normalizedStatus,
          };
        });
        setListings(transformedListings);
      };
      await fetchAds();
    } catch (err: any) {
      console.error('Error promoting ad:', err);
      alert(err.message || 'Elanı önə çıxarmaq mümkün olmadı');
    }
  };

  const router = useRouter();

  const handleEdit = (id: string) => {
    // Navigate to edit page
    router.push(`/listings/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu elanı silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      await adService.deleteAd(parseInt(id));
      // Remove from current list
      setListings(prev => prev.filter(listing => listing.id !== id));
      // Update counts
      setCounts(prev => ({
        ...prev,
        [activeTab]: prev[activeTab as keyof typeof prev] - 1,
      }));
    } catch (err: any) {
      console.error('Error deleting ad:', err);
      alert(err.message || 'Elanı silmək mümkün olmadı');
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <UserSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Page Heading */}
              <div className="mb-6">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                  Elanlarım
                </h1>
                <p className="text-gray-500 text-base font-normal leading-normal">
                  Elanlarınızı idarə edin və yenilərini əlavə edin.
                </p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-8 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 justify-center border-b-[3px] pb-3 pt-2 whitespace-nowrap ${activeTab === 'active'
                      ? 'border-b-primary'
                      : 'border-b-transparent'
                      }`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'active' ? 'text-primary' : 'text-gray-500'
                      }`}>
                      Aktiv
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === 'active'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      {getTabCount('active')}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 justify-center border-b-[3px] pb-3 pt-2 whitespace-nowrap ${activeTab === 'pending'
                      ? 'border-b-primary'
                      : 'border-b-transparent'
                      }`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'pending' ? 'text-primary' : 'text-gray-500'
                      }`}>
                      Gözləmədə
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === 'pending'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      {getTabCount('pending')}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('inactive')}
                    className={`flex items-center gap-2 justify-center border-b-[3px] pb-3 pt-2 whitespace-nowrap ${activeTab === 'inactive'
                      ? 'border-b-primary'
                      : 'border-b-transparent'
                      }`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'inactive' ? 'text-primary' : 'text-gray-500'
                      }`}>
                      Passiv
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === 'inactive'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      {getTabCount('inactive')}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('rejected')}
                    className={`flex items-center gap-2 justify-center border-b-[3px] pb-3 pt-2 whitespace-nowrap ${activeTab === 'rejected'
                      ? 'border-b-primary'
                      : 'border-b-transparent'
                      }`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'rejected' ? 'text-primary' : 'text-gray-500'
                      }`}>
                      Rədd edilmiş
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === 'rejected'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      {getTabCount('rejected')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="flex flex-col items-center gap-4">
                    <svg
                      className="animate-spin h-8 w-8 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">Yüklənir...</p>
                  </div>
                </div>
              ) : (
                /* Cards Grid */
                listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listings.map(listing => (
                      <UserListingCard
                        key={listing.id}
                        listing={listing}
                        onPromote={handlePromote}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Bu statusda elan yoxdur
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
