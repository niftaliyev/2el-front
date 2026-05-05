'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { Button, Badge, Card, Modal, Input } from '@/components/ui';

export default function AdminAdApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<boolean | undefined>(undefined);
  
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdApplications(pagination.page, 10, filter);
      setApplications(data.data);
      setPagination({ ...pagination, totalPages: data.totalPages });
    } catch (error) {
      toast.error('Müraciətləri yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProcessModal = (app: any) => {
    setSelectedApp(app);
    setAdminNote(app.adminNote || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, isProcessed: boolean, note?: string) => {
    try {
      setIsProcessing(id);
      await adminService.updateAdApplicationStatus(id, isProcessed, note);
      toast.success('Müraciət statusu yeniləndi');
      setIsModalOpen(false);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reklam Müraciətləri</h1>
          <p className="text-gray-500 text-sm font-medium">Saytda reklam yerləşdirmək istəyən şəxslərin müraciətləri</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
          <button 
            onClick={() => { setFilter(undefined); setPagination({ ...pagination, page: 1 }); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === undefined ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Hamısı
          </button>
          <button 
            onClick={() => { setFilter(false); setPagination({ ...pagination, page: 1 }); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === false ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Gözləyən
          </button>
          <button 
            onClick={() => { setFilter(true); setPagination({ ...pagination, page: 1 }); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === true ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            İşlənmiş
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="animate-spin size-10 border-4 border-primary/20 border-t-primary rounded-full"></div>
          <p className="text-gray-400 font-bold text-sm">Müraciətlər yüklənir...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center">
           <span className="material-symbols-outlined !text-6xl text-gray-100 mb-4">mail</span>
           <p className="text-gray-300 font-black text-xl italic uppercase tracking-widest">Heç bir müraciət tapılmadı</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className={`overflow-hidden border-gray-100 transition-all shadow-sm ${app.isProcessed ? 'opacity-80 grayscale-[0.3]' : 'hover:border-primary/20 hover:shadow-xl'}`}>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-gray-900 truncate tracking-tight">{app.fullName}</h3>
                      {app.companyName && (
                        <Badge variant="default" className="bg-primary/5 text-primary border-primary/10 font-bold">
                          {app.companyName}
                        </Badge>
                      )}
                      <Badge variant={app.isProcessed ? 'success' : 'warning'} className="font-black uppercase text-[10px] ml-auto lg:ml-0">
                        {app.isProcessed ? 'İşlənib' : 'Gözləyir'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-8 text-sm font-bold text-gray-500">
                      <a href={`tel:${app.phoneNumber}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined !text-[18px] text-gray-300">call</span>
                        {app.phoneNumber}
                      </a>
                      <a href={`mailto:${app.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined !text-[18px] text-gray-300">mail</span>
                        {app.email}
                      </a>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[18px] text-gray-300">calendar_today</span>
                        {new Date(app.createdDate).toLocaleString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {app.message && (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 font-medium italic relative">
                          <span className="text-[10px] font-black text-gray-300 uppercase absolute -top-2 left-3 bg-gray-50 px-2">Mesaj</span>
                          {app.message}
                        </div>
                      )}
                      {app.adminNote && (
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-sm text-primary font-bold relative">
                          <span className="text-[10px] font-black text-primary/40 uppercase absolute -top-2 left-3 bg-white px-2">Admin Qeydi</span>
                          {app.adminNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 lg:self-center">
                    <Button 
                      variant={app.isProcessed ? 'outline' : 'primary'}
                      size="sm" 
                      className={`rounded-xl font-bold px-6 h-11 ${!app.isProcessed ? 'shadow-lg shadow-primary/20' : ''}`}
                      onClick={() => handleOpenProcessModal(app)}
                      isLoading={isProcessing === app.id}
                    >
                      {app.isProcessed ? 'Redaktə et' : 'İşlə'}
                    </Button>
                    {app.isProcessed && (
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl font-bold h-11 text-orange-500 hover:bg-orange-50"
                        onClick={() => handleUpdateStatus(app.id, false, app.adminNote)}
                        isLoading={isProcessing === app.id}
                      >
                        Gözləyənə qaytar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Process Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Müraciəti İşlə"
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Müraciətçi</h4>
             <p className="font-bold text-gray-900">{selectedApp?.fullName}</p>
             <p className="text-sm text-gray-500">{selectedApp?.phoneNumber}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Qeydi</label>
            <textarea 
              className="w-full min-h-32 p-4 rounded-2xl border border-gray-200 focus:border-primary outline-none text-sm font-medium transition-all"
              placeholder="Müraciət haqqında qeydlərinizi bura yazın (məs: müştəri ilə danışıldı...)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="primary" 
              className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              onClick={() => handleUpdateStatus(selectedApp.id, true, adminNote)}
              isLoading={isProcessing === selectedApp?.id}
            >
              Yadda Saxla
            </Button>
            <Button 
              variant="outline" 
              className="px-6 h-12 rounded-2xl font-black uppercase tracking-widest"
              onClick={() => setIsModalOpen(false)}
            >
              Ləğv et
            </Button>
          </div>
        </div>
      </Modal>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPagination({ ...pagination, page: i + 1 })}
              className={`size-10 rounded-xl font-black transition-all ${pagination.page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
