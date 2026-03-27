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
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-5 sm:py-10 px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <UserSidebar />
            <div className="flex-1 flex items-center justify-center p-12">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <UserSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Page Heading */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                  Profil Parametrləri
                </h1>
                <p className="text-gray-500 text-base font-normal leading-normal">
                  Hesab məlumatlarınızı idarə edin
                </p>
              </div>

              {/* Success/Error messages */}
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              )}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Section */}
                <div>
                  <h3 className="text-gray-900 text-xl font-bold mb-4">
                    Profil Məlumatları
                  </h3>

                  <div className="space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-20 h-20 rounded-full bg-cover bg-center bg-gray-200 flex items-center justify-center overflow-hidden"
                        style={profilePhoto ? { backgroundImage: `url("${profilePhoto}")` } : {}}
                      >
                        {!profilePhoto && (
                          <span className="material-symbols-outlined text-gray-400 !text-4xl">person</span>
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Şəkil yüklə
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <p className="text-gray-500 text-xs mt-2">
                          JPG, PNG və ya GIF (maks. 5MB)
                        </p>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-gray-900 text-sm font-semibold mb-2">Ad Soyad</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Adınızı daxil edin"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block text-gray-900 text-sm font-semibold mb-2">E-poçt</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={() => { }}
                        placeholder="email@example.com"
                        disabled
                      />
                      <p className="text-gray-400 text-xs mt-1">E-poçt dəyişdirilə bilməz</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-900 text-sm font-semibold mb-2">Telefon</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+994 XX XXX XX XX"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200 flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
