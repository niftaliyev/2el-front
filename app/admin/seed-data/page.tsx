'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

type DataType = 'cars' | 'phones';

export default function SeedDataPage() {
  const [activeTab, setActiveTab] = useState<DataType>('cars');
  const [jsonContent, setJsonContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = activeTab === 'cars'
        ? await adminService.getSeedDataCars()
        : await adminService.getSeedDataPhones();

      setJsonContent(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching seed data:', error);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate JSON
      JSON.parse(jsonContent);

      setSaving(true);
      if (activeTab === 'cars') {
        await adminService.updateSeedDataCars(jsonContent);
      } else {
        await adminService.updateSeedDataPhones(jsonContent);
      }
      toast.success('Məlumatlar uğurla yeniləndi');
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        toast.error('JSON formatı düzgün deyil');
      } else {
        console.error('Error saving seed data:', error);
        toast.error('Yadda saxlayarkən xəta baş verdi');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await adminService.syncSeedData();
      toast.success('Məlumatlar baza ilə uğurla sinxronizasiya edildi');
    } catch (error) {
      console.error('Error syncing seed data:', error);
      toast.error('Sinxronizasiya zamanı xəta baş verdi');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white shadow-xl shadow-gray-200/50">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Marka / Model İdarəetməsi</h1>
          <p className="text-gray-600">Sistemdəki avtomobil və telefon modellərini birbaşa JSON olaraq tənzimləyin</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab('cars')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'cars'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Avtomobillər
          </button>
          <button
            onClick={() => setActiveTab('phones')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'phones'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Telefonlar
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">code</span>
            <span>{activeTab === 'cars' ? 'car-models.json' : 'phone-models.json'}</span>
          </div>
          <div className="flex gap-4">
            <span>JSON formatı</span>
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
          </div>
        </div>

        <div className="flex-1 relative">
          <textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            disabled={loading || saving}
            className="absolute inset-0 w-full h-full p-6 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none resize-none selection:bg-primary/30"
            spellCheck={false}
          />
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500 max-w-md">
            <span className="font-bold text-amber-600">Diqqət:</span> Model siyahısını dəyişərkən JSON strukturunu qoruyun.
            Xətalı JSON sistemi xarab edə bilər. Hər zaman yedək (backup) saxlamağınız tövsiyə olunur.
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading || saving || syncing}
              className={`flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 hover:shadow-primary/20'}`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Yadda saxlanılır...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Yadda Saxla
                </>
              )}
            </button>
            
            <button
              onClick={handleSync}
              disabled={loading || saving || syncing}
              className={`flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${syncing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-amber-600 hover:shadow-amber-500/20'}`}
              title="Fayldakı modelləri bazaya köçür"
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sinxronlaşdırılır...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">sync</span>
                  Bazaya Köçür (Sync)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

