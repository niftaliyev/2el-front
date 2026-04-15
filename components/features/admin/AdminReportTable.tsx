'use client';

import { AdminReport } from '@/types/admin';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/ui/Dropdown';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface AdminReportTableProps {
  reports: AdminReport[];
  type: 'ad' | 'store';
  onAction: (action: string, report: AdminReport) => void;
}

const reasonTranslations: Record<string, string> = {
  FalseInformation: 'Yanlış məlumat',
  Fraud: 'Dələduzluq',
  OffensiveContent: 'Təhqiredici məzmun',
  Duplicate: 'Təkrar elan',
  WrongCategory: 'Yanlış kateqoriya',
  IllegalItem: 'Qadağan olunmuş məhsul',
  Other: 'Digər'
};

const statusTranslations: Record<string, string> = {
  Pending: 'Gözləmədə',
  InReview: 'Baxılır',
  Resolved: 'Həll edilib',
  Rejected: 'Rədd edilib'
};

const statusVariants: Record<string, any> = {
  Pending: 'warning',
  InReview: 'primary',
  Resolved: 'success',
  Rejected: 'danger'
};

export default function AdminReportTable({ reports, type, onAction }: AdminReportTableProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <span className="material-symbols-outlined text-gray-300 !text-6xl mb-4">report</span>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Şikayət tapılmadı</h3>
        <p className="text-gray-500">Hazırda heç bir şikayət yoxdur</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {type === 'ad' ? 'Elan' : 'Mağaza'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Şikayətçi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Səbəb
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Qeyd
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tarix
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="px-4 py-3">
                  {type === 'ad' ? (
                    <Link 
                      href={`/elanlar/${report.adSlug}-${report.adId}`}
                      target="_blank"
                      className="text-primary font-medium hover:underline block truncate max-w-[200px]"
                    >
                      {report.adTitle}
                    </Link>
                  ) : (
                    <Link 
                      href={`/shops/${report.storeSlug}`}
                      target="_blank"
                      className="text-primary font-medium hover:underline block truncate max-w-[200px]"
                    >
                      {report.storeName}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-900 font-medium">{report.reporterName}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {reasonTranslations[report.reason] || report.reason}
                </td>
                <td className="px-4 py-3 max-w-[250px]">
                  <p className="text-gray-500 truncate" title={report.note}>
                    {report.note || <span className="italic text-gray-400">Yoxdur</span>}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[report.status]}>
                    {statusTranslations[report.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(new Date(report.createdDate))}
                </td>
                <td className="px-4 py-3 text-right">
                  <Dropdown
                    align="right"
                    trigger={
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-gray-600">more_vert</span>
                      </button>
                    }
                    items={[
                      {
                        label: 'Gözləmədə',
                        icon: 'schedule',
                        onClick: () => onAction('status-0', report),
                        disabled: report.status === 'Pending'
                      },
                      {
                        label: 'Baxılır',
                        icon: 'visibility',
                        onClick: () => onAction('status-1', report),
                        disabled: report.status === 'InReview'
                      },
                      {
                        label: 'Həll edilib',
                        icon: 'check_circle',
                        onClick: () => onAction('status-2', report),
                        disabled: report.status === 'Resolved'
                      },
                      {
                        label: 'Rədd edilib',
                        icon: 'cancel',
                        onClick: () => onAction('status-3', report),
                        disabled: report.status === 'Rejected'
                      },
                      {
                        label: 'Sil',
                        icon: 'delete',
                        onClick: () => onAction('delete', report),
                        variant: 'danger'
                      }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
