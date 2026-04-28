'use client';

import { useState, useEffect, useRef } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import Input from '@/components/ui/Input';
import { adService } from '@/services/ad.service';
import { storeService } from '@/services/store.service';
import { authService } from '@/services/auth.service';
import { getImageUrl } from '@/lib/utils';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store Settings State
  const [activeTab, setActiveTab] = useState<'profile' | 'store' | 'security'>('profile');
  const [hasStore, setHasStore] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [storeFormData, setStoreFormData] = useState({
    storeName: '',
    description: '',
    descriptionRu: '',
    contactNumber: '',
    contactNumber2: '',
    contactNumber3: '',
    address: '',
    website: '',
    headline: '',
    headlineRu: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    categoryIds: [] as string[],
    cityId: '',
    workSchedules: [] as any[],
  });
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null);
  const [storeCover, setStoreCover] = useState<string | null>(null);
  const [storeCoverFile, setStoreCoverFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const storeLogoInputRef = useRef<HTMLInputElement>(null);
  const storeCoverInputRef = useRef<HTMLInputElement>(null);

  const [showWorkHours, setShowWorkHours] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [storeGalleryPhotos, setStoreGalleryPhotos] = useState<{ id: string; filePath: string }[]>([]);
  const [newGalleryPhotos, setNewGalleryPhotos] = useState<File[]>([]);
  const [photosToRemove, setPhotosToRemove] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const movePhoto = (idx: number, direction: 'left' | 'right') => {
    const activePhotos = storeGalleryPhotos.filter(p => !photosToRemove.includes(p.id));
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= activePhotos.length) return;

    const newActivePhotos = [...activePhotos];
    [newActivePhotos[idx], newActivePhotos[targetIdx]] = [newActivePhotos[targetIdx], newActivePhotos[idx]];

    const removedPhotos = storeGalleryPhotos.filter(p => photosToRemove.includes(p.id));
    setStoreGalleryPhotos([...newActivePhotos, ...removedPhotos]);
  };

  // Fetch profile data on mount
  useEffect(() => {
    const initPage = async () => {
      try {
        const [profile, storeStatus, categoryTree, cityData] = await Promise.all([
          adService.getProfile(),
          storeService.getUserStoreStatus(),
          adService.getCategoryTree(),
          adService.getCities()
        ]);

        setFormData({
          name: profile.fullName || '',
          email: profile.email || '',
          phone: profile.phoneNumber || '',
        });
        if (profile.profilePhoto) {
          setProfilePhoto(getImageUrl(profile.profilePhoto));
        }

        setHasStore(storeStatus.hasStore);
        setCategories(categoryTree);
        setCities(cityData);

        if (storeStatus.hasStore) {
          const store = await storeService.getMyStore();

          // Initial work schedule for all 7 days if missing
          const defaultSchedules = Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            openTime: '09:00:00',
            closeTime: '18:00:00',
            isOpen24Hours: false,
            isClosed: false
          }));

          const rawSchedules = store.workSchedules || store.WorkSchedules || [];
          const mergedSchedules = defaultSchedules.map(ds => {
            const existing = rawSchedules.find((ws: any) => {
              const dow = ws.dayOfWeek !== undefined ? ws.dayOfWeek : ws.DayOfWeek;
              if (dow === undefined || dow === null) return false;

              // Handle both numeric (0-6) and string ('Sunday') formats
              if (typeof dow === 'number') return dow === ds.dayOfWeek;

              const dowStr = String(dow).trim();
              const dayMap: Record<string, number> = {
                'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6,
                'bazar': 0, 'bazar ertəsi': 1, 'çərşənbə axşamı': 2, 'çərşənbə': 3, 'cümə axşamı': 4, 'cümə': 5, 'şənbə': 6
              };

              if (dayMap[dowStr] !== undefined) return dayMap[dowStr] === ds.dayOfWeek;
              const parsedDow = parseInt(dowStr);
              return !isNaN(parsedDow) && parsedDow === ds.dayOfWeek;
            });

            if (existing) {
              const isOpen24 = existing.isOpen24Hours !== undefined ? existing.isOpen24Hours : (existing.IsOpen24Hours !== undefined ? existing.IsOpen24Hours : false);
              const openTime = existing.openTime || existing.OpenTime;
              const closeTime = existing.closeTime || existing.CloseTime;

              return {
                dayOfWeek: ds.dayOfWeek,
                openTime: openTime || '09:00:00',
                closeTime: closeTime || '18:00:00',
                isOpen24Hours: !!isOpen24,
                isClosed: !isOpen24 && (!openTime || openTime === "" || openTime === "null")
              };
            }
            return ds;
          });

          setStoreFormData({
            storeName: store.storeName || store.StoreName || '',
            description: store.description || store.Description || '',
            descriptionRu: store.descriptionRu || store.DescriptionRu || '',
            contactNumber: store.contactNumber || store.ContactNumber || '',
            contactNumber2: store.contactNumber2 || store.ContactNumber2 || '',
            contactNumber3: store.contactNumber3 || store.ContactNumber3 || '',
            address: store.address || store.Address || '',
            website: store.website || store.Website || '',
            headline: store.headline || store.Headline || '',
            headlineRu: store.headlineRu || store.HeadlineRu || '',
            instagram: store.instagram || store.Instagram || '',
            tiktok: store.tikTok || store.TikTok || store.tiktok || '',
            facebook: store.facebook || store.Facebook || '',
            cityId: store.cityId || store.CityId || '',
            categoryIds: store.categoryIds || store.CategoryIds || [],
            workSchedules: mergedSchedules,
          });
          if (store.logoUrl || store.LogoUrl) setStoreLogo(getImageUrl(store.logoUrl || store.LogoUrl));
          if (store.coverUrl || store.CoverUrl) setStoreCover(getImageUrl(store.coverUrl || store.CoverUrl));
          setStoreGalleryPhotos(store.galleryPhotos || store.GalleryPhotos || []);
        }
      } catch (err) {
        console.error('Error initializing settings:', err);
      } finally {
        setIsPageLoading(false);
      }
    };
    initPage();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('cabinet.payments.errorSize'));
        return;
      }
      setPhotoFile(file);
      setProfilePhoto(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await adService.updateProfile({
        fullName: formData.name,
        phoneNumber: formData.phone,
        profilePhoto: photoFile || undefined,
      });
      setSuccess(t('cabinet.settings.profileSaved'));
      setPhotoFile(null);
    } catch (err: any) {
      setError(err.message || t('cabinet.settings.profileSaveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError(t('cabinet.settings.passwordsNotMatch'));
      setIsLoading(false);
      return;
    }

    try {
      await authService.changePassword(passwordForm);
      setSuccess(t('cabinet.settings.passwordSaved'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || t('cabinet.settings.passwordSaveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (name: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('StoreName', storeFormData.storeName);
      formData.append('Description', storeFormData.description);
      formData.append('DescriptionRu', storeFormData.descriptionRu);
      formData.append('ContactNumber', storeFormData.contactNumber);
      if (storeFormData.contactNumber2) formData.append('ContactNumber2', storeFormData.contactNumber2);
      if (storeFormData.contactNumber3) formData.append('ContactNumber3', storeFormData.contactNumber3);
      formData.append('Address', storeFormData.address);
      if (storeFormData.website) formData.append('Website', storeFormData.website);
      if (storeFormData.headline) formData.append('Headline', storeFormData.headline);
      if (storeFormData.headlineRu) formData.append('HeadlineRu', storeFormData.headlineRu);
      if (storeFormData.instagram) formData.append('Instagram', storeFormData.instagram);
      if (storeFormData.tiktok) formData.append('TikTok', storeFormData.tiktok);
      if (storeFormData.facebook) formData.append('Facebook', storeFormData.facebook);
      if (storeFormData.cityId) formData.append('CityId', storeFormData.cityId);

      storeFormData.categoryIds.forEach(id => {
        formData.append('categoryIds', id);
      });

      // Prepare Work Schedules (filter out closed days if backend handles it or just send flags)
      const schedulesToSend = storeFormData.workSchedules.map(ws => ({
        dayOfWeek: ws.dayOfWeek,
        openTime: ws.isClosed ? null : ws.openTime,
        closeTime: ws.isClosed ? null : ws.closeTime,
        isOpen24Hours: ws.isOpen24Hours
      }));
      formData.append('WorkSchedulesJson', JSON.stringify(schedulesToSend));

      if (storeCoverFile) formData.append('cover', storeCoverFile);

      newGalleryPhotos.forEach(file => {
        formData.append('GalleryPhotos', file);
      });

      photosToRemove.forEach(id => {
        formData.append('PhotosToRemove', id);
      });

      const orderedIds = storeGalleryPhotos
        .filter(p => !photosToRemove.includes(p.id))
        .map(p => p.id);

      orderedIds.forEach(id => {
        formData.append('OrderedPhotoIds', id);
      });

      await storeService.updateStore(formData);
      setSuccess(t('cabinet.settings.storeSaved'));
      setStoreLogoFile(null);
      setStoreCoverFile(null);
      setNewGalleryPhotos([]);
      setPhotosToRemove([]);

      // Refresh data
      const updatedStore = await storeService.getMyStore();
      setStoreGalleryPhotos(updatedStore.galleryPhotos || updatedStore.GalleryPhotos || []);
    } catch (err: any) {
      setError(err.response?.data?.message || t('cabinet.settings.storeSaveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreInputChange = (name: string, value: any) => {
    setStoreFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkScheduleChange = (index: number, field: string, value: any) => {
    setStoreFormData(prev => {
      const newSchedules = [...prev.workSchedules];
      newSchedules[index] = { ...newSchedules[index], [field]: value };

      // Mutual exclusivity
      if (field === 'isOpen24Hours' && value === true) {
        newSchedules[index].isClosed = false;
      }
      if (field === 'isClosed' && value === true) {
        newSchedules[index].isOpen24Hours = false;
      }

      return { ...prev, workSchedules: newSchedules };
    });
  };

  // Remove hardcoded dayNames as we use t('common.days.X')


  const toggleCategory = (id: string) => {
    setStoreFormData(prev => {
      const exists = prev.categoryIds.includes(id);
      if (exists) {
        return { ...prev, categoryIds: prev.categoryIds.filter(c => c !== id) };
      } else {
        return { ...prev, categoryIds: [...prev.categoryIds, id] };
      }
    });
  };

  if (isPageLoading) {
    return (
      <main className="bg-gray-50 min-h-screen font-sans">
        <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <UserSidebar />
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="animate-spin h-8 w-8 text-primary border-4 border-primary/20 border-t-primary rounded-full shadow-lg shadow-primary/10" />
              <p className="text-gray-400 text-sm font-medium">{t('cabinet.settings.loading')}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading and Tabs */}
              <div className="mb-8 border-b border-gray-100 pb-0">
                <div className="mb-6">
                  <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-2">
                    {t('cabinet.settings.title')}
                  </h1>
                  <p className="text-gray-500 text-sm font-medium">
                    {t('cabinet.settings.subtitle')}
                  </p>
                </div>

                <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar -mx-1 px-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap cursor-pointer ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {t('cabinet.settings.profileTab')}
                    {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap cursor-pointer ${activeTab === 'security' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {t('cabinet.settings.securityTab')}
                    {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                  </button>
                  {hasStore && (
                    <button
                      onClick={() => setActiveTab('store')}
                      className={`pb-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap cursor-pointer ${activeTab === 'store' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {t('cabinet.settings.storeTab')}
                      {activeTab === 'store' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Success/Error messages */}
              {success && (
                <div className="mb-6 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top">
                  <div className="size-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined !text-base font-bold">check_circle</span>
                  </div>
                  <p className="text-green-700 text-sm font-bold">{success}</p>
                </div>
              )}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 animate-in shake">
                  <div className="size-8 bg-red-500 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined !text-base font-bold">warning</span>
                  </div>
                  <p className="text-red-700 text-sm font-bold">{error}</p>
                </div>
              )}
              {activeTab === 'profile' ? (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Profile Section */}
                  <div className="space-y-8">
                    {/* Photo Upload Area */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-cover bg-center bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg flex-shrink-0 group relative cursor-pointer"
                        style={profilePhoto ? { backgroundImage: `url("${profilePhoto}")` } : {}}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {!profilePhoto && (
                          <span className="material-symbols-outlined text-gray-400 !text-4xl">person</span>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white font-bold">photo_camera</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-gray-900 text-lg font-bold">{t('cabinet.settings.profilePhoto')}</h3>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-xs">
                          {t('cabinet.settings.profilePhotoDesc')}
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
                        >
                          {t('cabinet.settings.changePhoto')}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">{t('cabinet.settings.fullName')}</label>
                        <div className="relative group">
                          <input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-gray-900"
                            placeholder={t('cabinet.settings.fullNamePlaceholder')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">{t('cabinet.settings.email')}</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full h-14 px-5 rounded-xl border border-gray-100 bg-gray-100/50 text-gray-400 font-bold outline-none cursor-not-allowed"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">{t('cabinet.settings.phone')}</label>
                        <div className="relative group">
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-gray-900"
                            placeholder={t('cabinet.settings.phonePlaceholder')}
                            pattern="^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$"
                            title="Səhv format. Nümunə: 0501234567 və ya +994501234567"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-6 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto min-w-[200px] h-14 rounded-xl bg-primary text-white font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                    >
                      {isLoading ? t('cabinet.settings.saving') : t('cabinet.settings.save')}
                    </button>
                  </div>
                </form>
              ) : activeTab === 'security' ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-10">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label={t('cabinet.settings.currentPassword')}
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                      <div className="hidden md:block"></div>
                      <Input
                        label={t('cabinet.settings.newPassword')}
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                      <Input
                        label={t('cabinet.settings.confirmNewPassword')}
                        type="password"
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => handlePasswordChange('confirmNewPassword', e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto min-w-[200px] h-14 rounded-xl bg-primary text-white font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                    >
                      {isLoading ? t('cabinet.settings.waiting') : t('cabinet.settings.updatePassword')}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleStoreSubmit} className="space-y-10">
                  <div className="space-y-8">
                    {/* Media section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center sm:items-start">
                        <h3 className="text-gray-900 text-[10px] sm:text-sm font-black uppercase tracking-widest mb-4">{t('cabinet.settings.storeLogo')}</h3>
                        <div className="relative group cursor-pointer w-32 sm:w-full max-w-[200px]" onClick={() => storeLogoInputRef.current?.click()}>
                          <div className="aspect-square rounded-2xl bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                            {storeLogo ? (
                              <img src={storeLogo} className="size-full object-cover" />
                            ) : (
                              <div className="size-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-300 !text-4xl sm:!text-6xl">storefront</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-white !text-2xl sm:!text-3xl">photo_camera</span>
                            </div>
                          </div>
                        </div>
                        <input
                          type="file"
                          ref={storeLogoInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                setError(t('cabinet.payments.errorSize'));
                                return;
                              }
                              setStoreLogoFile(file);
                              setStoreLogo(URL.createObjectURL(file));
                              setError(null);
                            }
                          }}
                        />
                      </div>

                      <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-gray-900 text-[10px] sm:text-sm font-black uppercase tracking-widest mb-4">{t('cabinet.settings.storeCover')}</h3>
                        <div className="relative group cursor-pointer" onClick={() => storeCoverInputRef.current?.click()}>
                          <div className="aspect-video rounded-2xl bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                            {storeCover ? (
                              <img src={storeCover} className="size-full object-cover" />
                            ) : (
                              <div className="size-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-300 !text-4xl sm:!text-6xl">image</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-white !text-2xl sm:!text-3xl">photo_camera</span>
                            </div>
                          </div>
                        </div>
                        <input
                          type="file"
                          ref={storeCoverInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                setError(language === 'ru' ? 'Размер изображения не должен превышать 10MB' : 'Şəkil ölçüsü 10MB-dan çox olmamalıdır');
                                return;
                              }
                              setStoreCoverFile(file);
                              setStoreCover(URL.createObjectURL(file));
                              setError(null);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <Input
                        label={t('cabinet.settings.storeName')}
                        value={storeFormData.storeName}
                        onChange={(e) => handleStoreInputChange('storeName', e.target.value)}
                        required
                        className="font-bold text-lg"
                      />

                      <Textarea
                        label={t('cabinet.settings.storeAbout')}
                        value={storeFormData.description}
                        onChange={(e) => handleStoreInputChange('description', e.target.value)}
                        rows={4}
                        required
                      />

                      <Textarea
                        label={t('cabinet.settings.storeAbout') + " (RU)"}
                        value={storeFormData.descriptionRu}
                        onChange={(e) => handleStoreInputChange('descriptionRu', e.target.value)}
                        rows={4}
                        required
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label={t('cabinet.settings.phone2')}
                          type="tel"
                          value={storeFormData.contactNumber2}
                          onChange={(e) => handleStoreInputChange('contactNumber2', e.target.value)}
                          placeholder="Nümunə: 0501234567"
                          pattern="^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$"
                          title="Səhv format. Nümunə: 0501234567"
                        />
                        <Input
                          label={t('cabinet.settings.phone3')}
                          type="tel"
                          value={storeFormData.contactNumber3}
                          onChange={(e) => handleStoreInputChange('contactNumber3', e.target.value)}
                          placeholder="Nümunə: 0501234567"
                          pattern="^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$"
                          title="Səhv format. Nümunə: 0501234567"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label={t('cabinet.settings.mainPhone')}
                          type="tel"
                          value={storeFormData.contactNumber}
                          onChange={(e) => handleStoreInputChange('contactNumber', e.target.value)}
                          required
                          placeholder="Nümunə: 0501234567"
                          pattern="^(?:\+994|0)(?:10|50|51|55|70|77|99)\d{7}$"
                          title="Səhv format. Nümunə: 0501234567"
                        />
                        <Input
                          label={t('cabinet.settings.website')}
                          value={storeFormData.website}
                          onChange={(e) => handleStoreInputChange('website', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label={t('cabinet.settings.headline')}
                          value={storeFormData.headline}
                          onChange={(e) => handleStoreInputChange('headline', e.target.value)}
                          placeholder={t('cabinet.settings.headlinePlaceholder')}
                        />
                        <Input
                          label={t('cabinet.settings.headline') + " (RU)"}
                          value={storeFormData.headlineRu}
                          onChange={(e) => handleStoreInputChange('headlineRu', e.target.value)}
                          placeholder={t('cabinet.settings.headlinePlaceholder')}
                        />
                        <Input
                          label={t('cabinet.settings.instagram')}
                          value={storeFormData.instagram}
                          onChange={(e) => handleStoreInputChange('instagram', e.target.value)}
                          placeholder="@username"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label={t('cabinet.settings.tiktok')}
                          value={storeFormData.tiktok}
                          onChange={(e) => handleStoreInputChange('tiktok', e.target.value)}
                          placeholder="@username"
                        />
                        <Input
                          label={t('cabinet.settings.facebook')}
                          value={storeFormData.facebook}
                          onChange={(e) => handleStoreInputChange('facebook', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label={t('cabinet.settings.address')}
                          value={storeFormData.address}
                          onChange={(e) => handleStoreInputChange('address', e.target.value)}
                          required
                        />
                        <div className="space-y-2">
                          <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">{t('cabinet.settings.city')}</label>
                          <select
                            value={storeFormData.cityId}
                            onChange={(e) => handleStoreInputChange('cityId', e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-gray-900 cursor-pointer"
                          >
                            <option value="">{t('cabinet.settings.citySelect')}</option>
                            {cities.map(city => (
                              <option key={city.id} value={city.id}>{language === 'ru' && city.nameRu ? city.nameRu : city.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Working Hours - Collapsible */}
                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={() => setShowWorkHours(!showWorkHours)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">schedule</span>
                            <label className="text-gray-900 text-[11px] font-black uppercase tracking-widest cursor-pointer">{t('cabinet.settings.workHours')}</label>
                          </div>
                          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${showWorkHours ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {showWorkHours && (
                          <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="divide-y divide-gray-100">
                              {storeFormData.workSchedules.map((ws, idx) => (
                                <div key={idx} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-white transition-colors">
                                  <div className="sm:w-32 flex-shrink-0">
                                    <span className="text-gray-900 text-xs sm:text-sm font-black uppercase sm:normal-case tracking-wider sm:tracking-normal">{t(`common.days.${ws.dayOfWeek}`)}</span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 flex-1">
                                    <label className="flex items-center gap-2 cursor-pointer bg-white sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
                                      <input
                                        type="checkbox"
                                        checked={ws.isClosed}
                                        onChange={(e) => handleWorkScheduleChange(idx, 'isClosed', e.target.checked)}
                                        className="size-4 sm:size-5 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('cabinet.settings.closed')}</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer bg-white sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
                                      <input
                                        type="checkbox"
                                        checked={ws.isOpen24Hours}
                                        onChange={(e) => handleWorkScheduleChange(idx, 'isOpen24Hours', e.target.checked)}
                                        className="size-4 sm:size-5 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('cabinet.settings.open24h')}</span>
                                    </label>

                                    {!ws.isClosed && !ws.isOpen24Hours && (
                                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 ml-auto sm:ml-0">
                                        <input
                                          type="time"
                                          value={ws.openTime?.substring(0, 5) || '09:00'}
                                          onChange={(e) => handleWorkScheduleChange(idx, 'openTime', e.target.value + ':00')}
                                          className="px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-bold text-gray-900 bg-white outline-none focus:border-primary shadow-sm cursor-pointer"
                                        />
                                        <span className="text-gray-400 font-bold">-</span>
                                        <input
                                          type="time"
                                          value={ws.closeTime?.substring(0, 5) || '18:00'}
                                          onChange={(e) => handleWorkScheduleChange(idx, 'closeTime', e.target.value + ':00')}
                                          className="px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-bold text-gray-900 bg-white outline-none focus:border-primary shadow-sm cursor-pointer"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Categories section - Improved and Hierarchical - Collapsible */}
                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={() => setShowCategories(!showCategories)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">category</span>
                            <label className="text-gray-900 text-[11px] font-black uppercase tracking-widest cursor-pointer">{t('cabinet.settings.categories')}</label>
                          </div>
                          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {showCategories && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {categories.map(parent => (
                              <div key={parent.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                                  <h4 className="text-gray-900 text-sm font-black uppercase tracking-tight">{language === 'ru' && parent.nameRu ? parent.nameRu : parent.name}</h4>
                                  <button
                                    type="button"
                                    onClick={() => toggleCategory(parent.id)}
                                    className={`size-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${storeFormData.categoryIds.includes(parent.id) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}
                                  >
                                    <span className="material-symbols-outlined !text-xs font-bold">{storeFormData.categoryIds.includes(parent.id) ? 'done' : 'add'}</span>
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {parent.children?.map((child: any) => (
                                    <button
                                      key={child.id}
                                      type="button"
                                      onClick={() => toggleCategory(child.id)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${storeFormData.categoryIds.includes(child.id)
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                                        }`}
                                    >
                                      {language === 'ru' && child.nameRu ? child.nameRu : child.name}
                                    </button>
                                  ))}
                                  {parent.subCategories?.map((child: any) => (
                                    <button
                                      key={child.id}
                                      type="button"
                                      onClick={() => toggleCategory(child.id)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${storeFormData.categoryIds.includes(child.id)
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                                        }`}
                                    >
                                      {language === 'ru' && child.nameRu ? child.nameRu : child.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Store Gallery Section */}
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 !text-xl">collections</span>
                            <label className="block text-gray-900 text-[11px] font-black uppercase tracking-widest">{t('cabinet.settings.storeGallery')}</label>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('cabinet.settings.max10Photos')}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {/* Existing Photos */}
                          {storeGalleryPhotos.filter(p => !photosToRemove.includes(p.id)).map((photo, index, arr) => (
                            <div key={photo.id} className="relative aspect-square rounded-2xl bg-gray-100 overflow-hidden group border-2 border-transparent hover:border-primary/20 transition-all shadow-sm">
                              <img src={getImageUrl(photo.filePath)} className="size-full object-cover" alt="Gallery" />

                              {/* Overlay for controls */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setPhotosToRemove(prev => [...prev, photo.id])}
                                    className="size-8 rounded-xl bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg cursor-pointer"
                                    title={t('cabinet.settings.delete')}
                                  >
                                    <span className="material-symbols-outlined !text-lg">delete</span>
                                  </button>
                                </div>

                                <div className="flex justify-center gap-2">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => movePhoto(index, 'left')}
                                      className="size-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 transition-all shadow-sm cursor-pointer"
                                      title={t('cabinet.settings.moveLeft')}
                                    >
                                      <span className="material-symbols-outlined !text-lg">arrow_back</span>
                                    </button>
                                  )}
                                  {index < arr.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => movePhoto(index, 'right')}
                                      className="size-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 transition-all shadow-sm cursor-pointer"
                                      title={t('cabinet.settings.moveRight')}
                                    >
                                      <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="absolute bottom-2 left-2 size-5 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-bold flex items-center justify-center">
                                {index + 1}
                              </div>
                            </div>
                          ))}

                          {/* New Photos Previews */}
                          {newGalleryPhotos.map((file, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl bg-gray-100 overflow-hidden group border-2 border-primary/20 shadow-md transition-all">
                              <img src={URL.createObjectURL(file)} className="size-full object-cover" alt="New Gallery" />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-primary text-white text-[8px] font-black uppercase tracking-widest shadow-lg">{t('cabinet.settings.new')}</div>
                              <button
                                type="button"
                                onClick={() => setNewGalleryPhotos(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-2 right-2 size-8 rounded-xl bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg backdrop-blur-sm cursor-pointer"
                              >
                                <span className="material-symbols-outlined !text-lg">close</span>
                              </button>
                            </div>
                          ))}

                          {/* Upload Button */}
                          {(storeGalleryPhotos.length - photosToRemove.length + newGalleryPhotos.length) < 10 && (
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 hover:bg-gray-100 hover:border-primary/30 transition-all group cursor-pointer"
                            >
                              <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-primary shadow-sm transition-colors ring-1 ring-gray-100">
                                <span className="material-symbols-outlined !text-2xl">add_photo_alternate</span>
                              </div>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors text-center px-2">{t('cabinet.settings.addPhoto')}</span>
                            </button>
                          )}
                        </div>

                        <input
                          type="file"
                          ref={galleryInputRef}
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const currentCount = storeGalleryPhotos.length - photosToRemove.length + newGalleryPhotos.length;
                            const remaining = 10 - currentCount;
                            const slicedFiles = files.slice(0, remaining);
                            setNewGalleryPhotos(prev => [...prev, ...slicedFiles]);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto min-w-[220px] h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>{t('cabinet.settings.saving')}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined !text-[20px]">check_circle</span>
                          <span>{t('cabinet.settings.updateStore')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
