'use client';

import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { toast } from 'sonner';
import { Button, Modal, Badge, Card } from '@/components/ui';

export default function AdminStoreRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await storeService.getStoreRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Sorğuları yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Bu mağaza sorğusunu təsdiqləmək və mağaza yaratmaq istədiyinizə əminsiniz?')) return;
    
    setIsProcessing(true);
    try {
      await storeService.approveStoreRequest(id);
      toast.success('Mağaza uğurla yaradıldı');
      fetchRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rədd etmə səbəbi:');
    if (reason === null) return;
    
    setIsProcessing(true);
    try {
      await storeService.rejectStoreRequest(id, reason);
      toast.success('Sorğu rədd edildi');
      fetchRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu müraciəti tamamilə silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz və əlaqəli şəkillər serverdən silinəcək.')) return;
    
    setIsProcessing(true);
    try {
      await storeService.deleteStoreRequest(id);
      toast.success('Müraciət və şəkillər silindi');
      fetchRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mağaza Sorğuları</h1>
          <p className="text-gray-500 text-sm font-medium">Yeni mağaza açmaq istəyən istifadəçilərin müraciətləri</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm" className="rounded-xl font-bold">
            <span className="material-symbols-outlined mr-2 !text-[18px]">refresh</span> Yenilə
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="animate-spin size-10 border-4 border-primary/20 border-t-primary rounded-full"></div>
          <p className="text-gray-400 font-bold text-sm">Sorğular yüklənir...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center">
           <span className="material-symbols-outlined !text-6xl text-gray-100 mb-4">move_to_inbox</span>
           <p className="text-gray-300 font-black text-xl italic uppercase tracking-widest">Heç bir sorğu tapılmadı</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="overflow-hidden border-gray-100 hover:border-primary/20 transition-all cursor-pointer shadow-sm hover:shadow-xl" onClick={() => setSelectedRequest(req)}>
              <div className="p-5 flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {req.logoUrl ? (
                    <img src={req.logoUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-300 text-3xl">storefront</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-black text-gray-900 truncate tracking-tight">{req.storeName}</h3>
                    <Badge variant={req.status === 0 ? 'warning' : req.status === 1 ? 'success' : 'danger'} className="font-black uppercase text-[10px]">
                      {req.status === 0 ? 'Gözləmədə' : req.status === 1 ? 'Təsdiqlənib' : 'Rədd edilib'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-bold text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-[16px]">person</span> {req.fullName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-[16px]">call</span> {req.phoneNumber}
                    </span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined !text-[16px]">category</span>
                      {req.categoryNames.slice(0, 2).join(', ')}{req.categoryNames.length > 2 ? '...' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold" onClick={(e: any) => { e.stopPropagation(); setSelectedRequest(req); }}>
                        Bax
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-red-500" onClick={(e: any) => { e.stopPropagation(); handleDelete(req.id); }}>
                        Sil
                    </Button>
                    {req.status === 0 && (
                        <>
                            <Button variant="outline" size="sm" className="rounded-xl font-bold text-red-500 border-red-100 hover:bg-red-50 hover:border-red-500" onClick={(e: any) => { e.stopPropagation(); handleReject(req.id); }}>
                                Rədd et
                            </Button>
                            <Button size="sm" className="rounded-xl font-bold px-6 shadow-md shadow-primary/20" onClick={(e: any) => { e.stopPropagation(); handleApprove(req.id); }}>
                                Təsdiqlə
                            </Button>
                        </>
                    )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)}
        title="Sorğu Detalları"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-8 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div>
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 bg-primary/5 px-3 py-1.5 rounded-lg w-fit">Mağaza Məlumatları</h4>
                        <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Mağaza adı</span>
                                    <span className="text-xl font-black text-gray-900 tracking-tight">{selectedRequest.storeName}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Kateqoriyalar</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {selectedRequest.categoryNames.map((name: string) => (
                                            <Badge key={name} variant="default" className="text-primary bg-primary/5 border border-primary/10 font-bold">{name}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Mağaza haqqında təsvir</span>
                                    <p className="text-sm text-gray-600 font-medium italic bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed shadow-inner">
                                        {selectedRequest.description || 'Qeyd yoxdur'}
                                    </p>
                                </div>
                        </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">Əlaqə Məlumatları</h4>
                        <div className="space-y-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined !text-xl">person</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-black uppercase">Sahib / Username</span>
                                        <span className="font-bold text-gray-900">{selectedRequest.fullName} <span className="text-primary">(@{selectedRequest.userName})</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined !text-xl">call</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-black uppercase">Telefon nömrəsi</span>
                                        <a href={`tel:${selectedRequest.phoneNumber}`} className="font-black text-gray-900 hover:text-primary transition-all underline decoration-gray-200 decoration-2 underline-offset-4">{selectedRequest.phoneNumber}</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined !text-xl">mail</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-black uppercase">E-mail ünvanı</span>
                                        <a href={`mailto:${selectedRequest.email}`} className="font-black text-gray-900 hover:text-primary transition-all lowercase tracking-tight">{selectedRequest.email}</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined !text-xl">calendar_today</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-black uppercase">Göndərilmə tarixi</span>
                                        <span className="font-black text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString('az-AZ')}</span>
                                    </div>
                                </div>
                        </div>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {selectedRequest.logoUrl && (
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loqo</span>
                        <div className="aspect-square rounded-3xl overflow-hidden border-2 border-gray-50 shadow-sm">
                            <img src={selectedRequest.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}
                {selectedRequest.coverUrl && (
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Foto</span>
                        <div className="aspect-video rounded-3xl overflow-hidden border-2 border-gray-50 shadow-sm">
                            <img src={selectedRequest.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-8 border-t border-gray-100">
                <Button variant="danger" className="flex-1 h-14 rounded-2xl font-black text-sm shadow-lg shadow-error/10 uppercase tracking-widest" onClick={() => handleDelete(selectedRequest.id)} isLoading={isProcessing}>SİL</Button>
                {selectedRequest.status === 0 && (
                    <>
                        <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black text-sm shadow-lg shadow-error/10 uppercase tracking-widest" onClick={() => handleReject(selectedRequest.id)} isLoading={isProcessing}>RƏDD ET</Button>
                        <Button className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-sm shadow-lg shadow-green-600/10 uppercase tracking-widest border-none" onClick={() => handleApprove(selectedRequest.id)} isLoading={isProcessing}>TƏSDİQLƏ</Button>
                    </>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
