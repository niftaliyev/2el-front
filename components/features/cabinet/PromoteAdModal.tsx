'use client';

import { useState, useEffect } from 'react';
import { PackageItem } from '@/types/api';
import { adService } from '@/services/ad.service';
import { useAuth } from '@/contexts/AuthContext';

interface PromoteAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
}

export default function PromoteAdModal({ isOpen, onClose, adId }: PromoteAdModalProps) {
  const [activeTab, setActiveTab] = useState<'vip' | 'premium' | 'boost'>('vip');
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!isOpen) return;

    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let items: PackageItem[] = [];
        if (activeTab === 'vip') items = await adService.getVipPackages();
        if (activeTab === 'premium') items = await adService.getPremiumPackages();
        if (activeTab === 'boost') items = await adService.getBoostPackages();
        setPackages(items);
        setSelectedPackage(items.length > 0 ? items[0].id : null);
      } catch (err: any) {
        console.error('Error fetching packages:', err);
        setError('Zəhmət olmasa biraz sonra yenidən cəhd edin.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [isOpen, activeTab]);

  const handleBuy = async () => {
    if (!selectedPackage) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await adService.buyPackage(adId, selectedPackage);
      await refreshUser(); // Update balance
      setSuccess('Paket uğurla alındı!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Xəta baş verdi. Balansınız kifayət etməyə bilər.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Elanı Önə Çıxar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('vip')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1.5 border-b-2 ${activeTab === 'vip' ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'
              }`}
          >
            <span className="material-symbols-outlined !text-[20px] font-bold">stars</span>
            <span>VIP</span>
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1.5 border-b-2 ${activeTab === 'premium' ? 'text-amber-500 border-amber-500 bg-amber-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'
              }`}
          >
            <span className="material-symbols-outlined !text-[20px] font-bold">workspace_premium</span>
            <span>Premium</span>
          </button>
          <button
            onClick={() => setActiveTab('boost')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1.5 border-b-2 ${activeTab === 'boost' ? 'text-green-600 border-green-600 bg-green-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'
              }`}
          >
            <span className="material-symbols-outlined !text-[20px] font-bold">rocket_launch</span>
            <span>İrəli Çək</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{success}</h3>
              <p className="text-gray-500">Pəncərə bağlanır...</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center p-8">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-2 font-medium">
                  {error}
                </div>
              )}

              {packages.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  Bu növ üçün paket tapılmadı
                </div>
              ) : (
                packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${selectedPackage === pkg.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center h-5 mr-3 mt-1">
                      <input
                        type="radio"
                        name="package"
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                        checked={selectedPackage === pkg.id}
                        onChange={() => setSelectedPackage(pkg.id)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">
                            {activeTab === 'vip' ? 'VIP' : activeTab === 'premium' ? 'Premium' : 'İrəli Çək'}
                            {pkg.intervalDay ? ` • ${pkg.intervalDay} Gün` : ''}
                            {activeTab === 'boost' && pkg.boostCount ? ` • ${pkg.boostCount} dəfə` : ''}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {pkg.packageType === 'Premium' 
                              ? "VIP + Gündəlik irəli çəkmə daxil" 
                              : pkg.packageType === 'Vip' 
                              ? "Gündəlik irəli çəkmə daxil" 
                              : pkg.description}
                          </p>
                        </div>
                        <span className="text-lg font-black text-gray-900 whitespace-nowrap ml-4">
                          {pkg.price} ₼
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              )}

              {/* Action */}
              <button
                onClick={handleBuy}
                disabled={!selectedPackage || isSubmitting || packages.length === 0}
                className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Gözləyin...' : 'İndi Ödə'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
