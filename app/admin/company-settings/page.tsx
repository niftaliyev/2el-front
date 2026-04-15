'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState({
    companyName: '',
    address: '',
    voen: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminService.getCompanySettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching company settings:', err);
        toast.error('Məlumatları yükləmək mümkün olmadı');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateCompanySettings(settings);
      toast.success('Məlumatlar uğurla yeniləndi');
    } catch (err) {
      console.error('Error updating company settings:', err);
      toast.error('Xəta baş verdi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Yüklənir...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8 border-b pb-4">İnvoys Şirkət Məlumatları</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Şirkət Adı</label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#607afb] outline-none transition-all font-bold"
            placeholder="ElanAz MMC"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ünvan</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#607afb] outline-none transition-all font-bold"
            placeholder="Bakı şəhəri, Azərbaycan"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">VÖEN</label>
            <input
              type="text"
              value={settings.voen}
              onChange={(e) => setSettings({ ...settings, voen: e.target.value })}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#607afb] outline-none transition-all font-bold"
              placeholder="1234567890"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#607afb] outline-none transition-all font-bold"
              placeholder="support@elan.az"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-5 bg-[#607afb] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#4d62c9] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#607afb22] disabled:opacity-50"
        >
          {isSaving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
        </button>
      </form>
    </div>
  );
}
