'use client';

import { useState, useEffect, useRef } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import Input from '@/components/ui/Input';
import { adService } from '@/services/ad.service';
import { getImageUrl } from '@/lib/utils';

export default function SettingsPage() {
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

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await adService.getProfile();
        setFormData({
          name: profile.fullName || '',
          email: profile.email || '',
          phone: profile.phoneNumber || '',
        });
        if (profile.profilePhoto) {
          setProfilePhoto(getImageUrl(profile.profilePhoto));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setProfilePhoto(URL.createObjectURL(file));
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
      setSuccess('Profil uğurla yeniləndi!');
      setPhotoFile(null);
    } catch (err: any) {
      setError(err.message || 'Profili yeniləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <main className="bg-gray-50 min-h-screen font-sans">
        <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <UserSidebar />
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl shadow-sm border border-gray-100">
               <div className="animate-spin h-8 w-8 text-primary border-4 border-primary/20 border-t-primary rounded-full shadow-lg shadow-primary/10" />
               <p className="text-gray-400 text-sm font-medium">Yüklenir...</p>
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
              {/* Page Heading */}
              <div className="mb-8 border-b border-gray-50 pb-6">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">
                  Profil Parametrləri
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Hesab məlumatlarınızı və fərdi ayarlarınızı idarə edin
                </p>
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
                      <h3 className="text-gray-900 text-lg font-bold">Profil Şəkli</h3>
                      <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-xs">
                        Şəkil seçərək profilinizi fərdiləşdirin. JPG, PNG və ya GIF (maks. 5MB) yükləyə bilərsiniz.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary text-xs font-bold uppercase tracking-wider hover:underline"
                      >
                        Şəkli Dəyiş
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
                      <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">Ad Soyad</label>
                      <div className="relative group">
                         <input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-gray-900"
                            placeholder="Adınızı daxil edin"
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">E-poçt (Dəyişdirilə bilməz)</label>
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
                      <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider px-1">Telefon Nömrəsi</label>
                      <div className="relative group">
                         <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-gray-900"
                            placeholder="+994 XX XXX XX XX"
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
                    className="w-full sm:w-auto min-w-[200px] h-14 rounded-xl bg-primary text-white font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {isLoading ? 'Yadda saxlanılır...' : 'Dəyişiklikləri yadda saxla'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
