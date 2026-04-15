'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { AdminReport } from '@/types/admin';
import AdminReportTable from '@/components/features/admin/AdminReportTable';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [activeType, setActiveType] = useState<'ad' | 'store'>('ad');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [activeType, page, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let data;
      if (activeType === 'ad') {
        data = await adminService.getAdReports(page, 10, statusFilter);
      } else {
        data = await adminService.getStoreReports(page, 10, statusFilter);
      }
      setReports(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Şikayətləri yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, report: AdminReport) => {
    try {
      if (action === 'delete') {
        if (!confirm('Bu şikayəti silmək istədiyinizə əminsiniz?')) return;
        if (activeType === 'ad') {
          await adminService.deleteAdReport(report.id);
        } else {
          await adminService.deleteStoreReport(report.id);
        }
        toast.success('Şikayət silindi');
      } else if (action.startsWith('status-')) {
        const newStatus = parseInt(action.split('-')[1]);
        if (activeType === 'ad') {
          await adminService.updateAdReportStatus(report.id, newStatus);
        } else {
          await adminService.updateStoreReportStatus(report.id, newStatus);
        }
        toast.success('Status yeniləndi');
      }
      fetchReports();
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Əməliyyat zamanı xəta baş verdi');
    }
  };

  const statuses = [
    { value: null, label: 'Hamısı' },
    { value: '0', label: 'Gözləmədə' },
    { value: '1', label: 'Baxılır' },
    { value: '2', label: 'Həll edilib' },
    { value: '3', label: 'Rədd edilib' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Şikayətlər</h1>
          <p className="text-gray-600">İstifadəçilər tərəfindən göndərilən şikayətləri idarə edin</p>
        </div>
      </div>

      {/* Tabs / Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full md:w-auto">
            <button
              onClick={() => { setActiveType('ad'); setPage(1); }}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition-all ${
                activeType === 'ad' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Elanlar
            </button>
            <button
              onClick={() => { setActiveType('store'); setPage(1); }}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition-all ${
                activeType === 'store' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mağazalar
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {statuses.map((s) => (
              <button
                key={s.value === null ? 'null' : s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  statusFilter === s.value
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AdminReportTable
          reports={reports}
          type={activeType}
          onAction={handleAction}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`size-10 rounded-lg font-bold transition-all ${
                page === p ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
