'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adService } from '@/services/ad.service';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROUTES } from '@/constants';

interface SpecialPromoteAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
}

export default function SpecialPromoteAdModal({ isOpen, onClose, adId }: SpecialPromoteAdModalProps) {
  const [activeTab, setActiveTab] = useState<'social' | 'video'>('social');
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { refreshUser, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    // Reset modal state when opened
    setSuccess(null);
    setError(null);
    setIsSubmitting(false);
    setPhoneNumber('');

    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const promoPkgs = await adService.getPromotionPackages();
        let items = [];
        if (activeTab === 'social') {
          items = promoPkgs.filter((p) => p.type === 'SocialMedia');
        } else {
          items = promoPkgs.filter((p) => p.type === 'VideoProduction');
        }
        setPackages(items);
        setSelectedPackage(items.length > 0 ? items[0].id : null);
      } catch (err: any) {
        console.error('Error fetching packages:', err);
        setError(t ? t('promoteModal.errorGeneric') : 'Xəta baş verdi, zəhmət olmasa yenidən yoxlayın.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [isOpen, activeTab]);

  const handleBuy = async () => {
    if (!selectedPackage) return;

    if (phoneNumber.trim()) {
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const phoneRegex = /^(994|0)?(10|50|51|55|60|70|77|99|12|20|21|22|23|24|25|26)\d{7}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError(language === 'ru' 
          ? 'Неверный формат номера телефона. (Пример: +994 50 123 45 67)' 
          : 'Əlaqə nömrəsi düzgün formatda deyil. (Nümunə: +994 50 123 45 67)');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adService.buyPromotion({
        adId,
        promotionPackageId: selectedPackage,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      setSuccess(res.message || (language === 'ru' ? 'Запрос успешно отправлен' : 'Müraciətiniz uğurla qəbul edildi'));
      await refreshUser(); // Update balance
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Balansınızda kifayət qədər vəsait yoxdur.');
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
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'ru' ? 'Специальная Реклама' : 'Sosial və Video Reklam'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 whitespace-nowrap">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'social' ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined !text-[20px] font-bold">share</span>
            <span>{language === 'ru' ? 'Соц. Сети' : 'Sosial Şəbəkələr'}</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'video' ? 'text-red-650 border-red-600 bg-red-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined !text-[20px] font-bold">videocam</span>
            <span>{language === 'ru' ? 'Видео/YouTube' : 'Video/YouTube'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{success}</h3>
              <p className="text-gray-500">
                {language === 'ru' ? 'Окно закрывается...' : 'Pəncərə bağlanır...'}
              </p>
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
                  {language === 'ru' ? 'Нет доступных пакетов' : 'Heç bir paket tapılmadı'}
                </div>
              ) : (
                packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedPackage === pkg.id
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
                            {language === 'ru' && pkg.nameRu ? pkg.nameRu : pkg.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === 'ru' && pkg.descriptionRu ? pkg.descriptionRu : pkg.description}
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

              {/* Optional Phone Number Input */}
              {packages.length > 0 && (
                <div className="mt-2 mb-2">
                  <label htmlFor="promo-phone" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {language === 'ru' ? 'Контактный номер (необязательно)' : 'Əlaqə nömrəsi (İstəyə bağlı)'}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-gray-400 !text-[20px]">phone</span>
                    </div>
                    <input
                      type="text"
                      id="promo-phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={language === 'ru' ? 'Например: +994 50 123 45 67' : 'Məsələn: +994 50 123 45 67'}
                      className="block w-full pl-10 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400 text-gray-950 font-medium transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                    {language === 'ru'
                      ? 'Если оставить пустым, будет использован номер вашего аккаунта или объявления.'
                      : 'Boş buraxılsa, hesab nömrəniz və ya elan nömrəniz istifadə olunacaq.'}
                  </p>
                </div>
              )}

              {/* Action */}
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    onClose();
                    router.push(`${ROUTES.LOGIN || '/signin'}?redirect=${encodeURIComponent(window.location.pathname)}`);
                  }}
                  className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-[20px]">login</span>
                  {language === 'ru' ? 'Войдите, чтобы оплатить' : 'Ödəmək üçün daxil olun'}
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={!selectedPackage || isSubmitting || packages.length === 0}
                  className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting
                    ? language === 'ru'
                      ? 'Пожалуйста, подождите...'
                      : 'Zəhmət olmasa gözləyin...'
                    : language === 'ru'
                    ? 'Оплатить сейчас'
                    : 'İndi ödə'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
