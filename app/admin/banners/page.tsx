'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { adService } from '@/services/ad.service';
import { toast } from 'sonner';
import { Button, Modal, Badge, Card, Input } from '@/components/ui';
import { AdPosition } from '@/services/banner.service';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewScript, setPreviewScript] = useState<string>('');

  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    fetchBanners();
    fetchLookups();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBanners();
      setBanners(data);
    } catch (error) {
      toast.error('Bannerləri yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [catTree, cityList] = await Promise.all([
        adService.getCategoryTree(),
        adService.getCities()
      ]);
      setCategories(catTree);
      setCities(cityList);
    } catch (error) {
      console.error('Error fetching lookups:', error);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const fileInput = form.querySelector('input[name="imageFile"]') as HTMLInputElement;
    const imageFile = fileInput?.files?.[0];

    const banner: any = {
      id: selectedBanner?.id || '00000000-0000-0000-0000-000000000000',
      title: formData.get('title'),
      targetUrl: formData.get('targetUrl'),
      position: parseInt(formData.get('position') as string),
      categoryId: formData.get('categoryId') || null,
      cityId: formData.get('cityId') || null,
      language: formData.get('language') || null,
      priority: parseInt(formData.get('priority') as string) || 0,
      startDate: new Date(formData.get('startDate') as string).toISOString(),
      endDate: new Date(formData.get('endDate') as string).toISOString(),
      isActive: formData.get('isActive') === 'on',
      scriptCode: formData.get('scriptCode') || null
    };

    if (imageFile) {
      banner.imageFile = imageFile;
    } else {
      banner.imageUrl = selectedBanner?.imageUrl || '';
    }

    try {
      setIsProcessing(true);
      await adminService.upsertBanner(banner);
      toast.success('Reklam uğurla yadda saxlanıldı');
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error('Xəta baş verdi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu reklamı silmək istədiyinizə əminsiniz? Şəkil də serverdən silinəcək.')) return;
    try {
      await adminService.deleteBanner(id);
      toast.success('Reklam silindi');
      fetchBanners();
    } catch (error) {
      toast.error('Silinmə zamanı xəta baş verdi');
    }
  };

  const getPositionName = (pos: number) => {
    switch (pos) {
      case 1: return 'Sol Sidebar';
      case 2: return 'Sağ Sidebar';
      default: return 'Naməlum';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Banner Reklamları</h1>
          <p className="text-gray-500 text-sm font-medium">Saytda görünən bütün kommersiya reklamları</p>
        </div>
        <Button onClick={() => { setSelectedBanner(null); setPreviewScript(''); setIsModalOpen(true); }} className="rounded-xl font-bold shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined mr-2">add</span> Yeni Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="animate-spin size-10 border-4 border-primary/20 border-t-primary rounded-full"></div>
          <p className="text-gray-400 font-bold text-sm">Yüklənir...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center">
           <span className="material-symbols-outlined !text-6xl text-gray-100 mb-4">view_carousel</span>
           <p className="text-gray-300 font-black text-xl italic uppercase tracking-widest">Heç bir banner tapılmadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className={`overflow-hidden border-gray-100 flex flex-col ${!banner.isActive ? 'opacity-60 grayscale' : ''}`}>
              <div className="aspect-[16/9] bg-gray-100 relative group overflow-hidden">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="material-symbols-outlined !text-4xl">image_not_supported</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                   <Badge variant="primary" className="font-black text-[10px] uppercase shadow-md">{getPositionName(banner.position)}</Badge>
                   {!banner.isActive && <Badge variant="danger" className="font-black text-[10px] uppercase">Deaktiv</Badge>}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-lg font-black text-gray-900 truncate" title={banner.title}>{banner.title}</h3>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Views</span>
                        <span className="text-sm font-black text-primary">{banner.viewCount || 0}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Clicks</span>
                        <span className="text-sm font-black text-orange-500">{banner.clickCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <span className="material-symbols-outlined !text-sm">calendar_today</span>
                    {new Date(banner.startDate).toLocaleDateString('az-AZ')} - {new Date(banner.endDate).toLocaleDateString('az-AZ')}
                  </div>
                  {banner.targetUrl && (
                    <div className="flex items-center gap-2 text-xs font-bold text-primary truncate">
                      <span className="material-symbols-outlined !text-sm">link</span>
                      <a href={banner.targetUrl} target="_blank" rel="noreferrer" className="hover:underline">{banner.targetUrl}</a>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl font-bold" onClick={() => { 
                    setSelectedBanner(banner); 
                    setPreviewScript(banner.scriptCode || '');
                    setIsModalOpen(true); 
                  }}>
                    Redaktə
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold text-red-500 hover:bg-red-50" onClick={() => handleDelete(banner.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upsert Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedBanner ? 'Banneri Redaktə Et' : 'Yeni Banner'}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-6 py-2">
          <div className={`grid grid-cols-1 ${previewScript ? 'xl:grid-cols-2' : ''} gap-8`}>
            {/* Form Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
                  <Input name="title" defaultValue={selectedBanner?.title} required placeholder="Məs: Yaz endirimləri" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pozisiya</label>
                  <select name="position" defaultValue={selectedBanner?.position || 1} className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white font-bold text-sm focus:outline-none focus:border-primary transition-all">
                    <option value={1}>Sol Sidebar</option>
                    <option value={2}>Sağ Sidebar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reklam Şəkli (Fayl)</label>
                <div className="flex flex-col gap-2">
                  {selectedBanner?.imageUrl && (
                    <div className="size-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-1 bg-gray-50">
                        <img src={selectedBanner.imageUrl} alt="" className="size-full object-cover" />
                    </div>
                  )}
                  <input type="file" name="imageFile" accept="image/*" className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                  <p className="text-[9px] text-gray-400 font-bold italic ml-1">Şəkli dəyişmək istəmirsinizsə boş buraxın.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yönləndiriləcək Link (URL)</label>
                <Input name="targetUrl" defaultValue={selectedBanner?.targetUrl} placeholder="https://..." />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xüsusi Kod (HTML/JS/CSS)</label>
                <textarea 
                  name="scriptCode" 
                  defaultValue={selectedBanner?.scriptCode} 
                  onChange={(e) => setPreviewScript(e.target.value)}
                  placeholder="Reklam kodunu bura daxil edin..."
                  className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 bg-[#1e1e1e] text-green-400 font-mono text-[11px] focus:outline-none focus:border-primary transition-all resize-y leading-relaxed"
                />
                <p className="text-[9px] text-gray-400 font-bold italic ml-1">Kod daxil edildikdə şəkil əvəzinə bu kod icra olunacaq.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Başlama Tarixi</label>
                  <Input type="date" name="startDate" defaultValue={selectedBanner?.startDate ? new Date(selectedBanner.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bitmə Tarixi</label>
                  <Input type="date" name="endDate" defaultValue={selectedBanner?.endDate ? new Date(selectedBanner.endDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kateqoriya (Opsional)</label>
                  <select name="categoryId" defaultValue={selectedBanner?.categoryId || ''} className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white font-bold text-sm">
                    <option value="">Hamısı</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Şəhər (Opsional)</label>
                  <select name="cityId" defaultValue={selectedBanner?.cityId || ''} className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white font-bold text-sm">
                    <option value="">Hamısı</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dil</label>
                  <select name="language" defaultValue={selectedBanner?.language || ''} className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white font-bold text-sm">
                    <option value="">Hamısı</option>
                    <option value="az">Azərbaycanca</option>
                    <option value="ru">Rusca</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isActive" defaultChecked={selectedBanner ? selectedBanner.isActive : true} className="size-5 accent-primary" />
                  <label className="font-bold text-sm text-gray-700">Aktivdir</label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prioritet:</label>
                  <input type="number" name="priority" defaultValue={selectedBanner?.priority || 0} className="w-16 h-8 px-2 rounded-lg border border-gray-200 font-bold text-xs" />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {previewScript && (
              <div className="xl:sticky xl:top-0 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Canlı Önizləmə (Live Preview)</label>
                  <Badge variant="primary" className="font-black text-[10px] px-3 py-1">REAL-TIME</Badge>
                </div>
                
                <div className="w-full aspect-[4/5] xl:aspect-auto xl:h-[calc(100vh-280px)] rounded-3xl border-4 border-gray-100 bg-white overflow-hidden shadow-2xl relative group">
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] -z-10 opacity-50" />
                  <iframe
                    key={previewScript.length} // Force re-render on script length change
                    title="Banner Preview"
                    srcDoc={`
                      <html>
                        <head>
                          <style>
                            body { 
                              margin: 0; 
                              display: flex; 
                              justify-content: center; 
                              align-items: center; 
                              min-height: 100vh; 
                              overflow-x: hidden;
                              background: transparent;
                              font-family: sans-serif; 
                            }
                            * { max-width: 100%; }
                          </style>
                        </head>
                        <body>${previewScript}</body>
                      </html>
                    `}
                    className="w-full h-full border-none"
                  />
                  
                  {/* Overlay for interaction info */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ölçü Rejimi</p>
                        <p className="text-xs font-bold">Avtomatik Uyğunlaşdırma</p>
                      </div>
                      <span className="material-symbols-outlined text-primary">aspect_ratio</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                   <span className="material-symbols-outlined text-blue-500">info</span>
                   <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                     Bu önizləmə kodun saytda necə görünəcəyini simulyasiya edir. Kodu dəyişdikcə önizləmə anında yenilənir.
                   </p>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20" isLoading={isProcessing}>
            Yadda Saxla
          </Button>
        </form>
      </Modal>
    </div>
  );
}
