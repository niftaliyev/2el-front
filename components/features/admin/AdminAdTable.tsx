'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AdminAd } from '@/types/admin';
import Checkbox from '@/components/ui/Checkbox';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/ui/Dropdown';
import { formatRelativeTime } from '@/lib/utils';

interface AdminAdTableProps {
  ads: AdminAd[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onAction: (action: string, ad: AdminAd) => void;
}

export default function AdminAdTable({ ads, selectedIds, onSelectionChange, onAction }: AdminAdTableProps) {
  const isAllSelected = ads.length > 0 && selectedIds.length === ads.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < ads.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(ads.map(ad => ad.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getStatusBadgeVariant = (status: AdminAd['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: AdminAd['status']) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'pending': return 'Gözləmədə';
      case 'rejected': return 'Rədd edilmiş';
      case 'expired': return 'Vaxtı keçmiş';
      default: return status;
    }
  };

  if (ads.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <span className="material-symbols-outlined text-gray-300 !text-6xl mb-4">inbox</span>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Heç nə tapılmadı</h3>
        <p className="text-gray-500">Bu filtrə uyğun elan yoxdur</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className={isSomeSelected && !isAllSelected ? 'opacity-50' : ''}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Elan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Satıcı
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Qiymət
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
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.includes(ad.id)}
                    onChange={() => handleSelect(ad.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={ad.images[0] || '/placeholder-product.jpg'}
                        alt={ad.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ad.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {ad.category}
                      </p>
                      {(ad.isPremium || ad.isFeatured) && (
                        <div className="flex gap-1 mt-1">
                          {ad.isPremium && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Premium
                            </span>
                          )}
                          {ad.isFeatured && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Önə çıxarılmış
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900">{ad.seller.name}</p>
                  <p className="text-xs text-gray-500 truncate">{ad.seller.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {ad.price.toLocaleString()} {ad.currency}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusBadgeVariant(ad.status)}>
                    {getStatusLabel(ad.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600">{formatRelativeTime(ad.createdAt)}</p>
                  <p className="text-xs text-gray-500">{ad.viewCount} baxış</p>
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
                      ...(ad.status === 'pending' ? [{
                        label: 'Təsdiq et',
                        icon: 'check_circle',
                        onClick: () => onAction('approve', ad),
                      }] : []),
                      ...(ad.status !== 'rejected' ? [{
                        label: 'Rədd et',
                        icon: 'cancel',
                        onClick: () => onAction('reject', ad),
                      }] : []),
                      {
                        label: ad.isFeatured ? 'Önə çıxarmağı ləğv et' : 'Önə çıxart',
                        icon: 'star',
                        onClick: () => onAction('feature', ad),
                      },
                      {
                        label: 'Sil',
                        icon: 'delete',
                        onClick: () => onAction('delete', ad),
                        variant: 'danger' as const,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {ads.map((ad) => (
          <div key={ad.id} className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedIds.includes(ad.id)}
                onChange={() => handleSelect(ad.id)}
                className="mt-1"
              />
              <div className="relative size-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={ad.images[0] || '/placeholder-product.jpg'}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                      {ad.title}
                    </h4>
                    <p className="text-xs text-gray-500">{ad.category}</p>
                  </div>
                  <Dropdown
                    align="right"
                    trigger={
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-gray-600 !text-lg">more_vert</span>
                      </button>
                    }
                    items={[
                      ...(ad.status === 'pending' ? [{
                        label: 'Təsdiq et',
                        icon: 'check_circle',
                        onClick: () => onAction('approve', ad),
                      }] : []),
                      ...(ad.status !== 'rejected' ? [{
                        label: 'Rədd et',
                        icon: 'cancel',
                        onClick: () => onAction('reject', ad),
                      }] : []),
                      {
                        label: ad.isFeatured ? 'Önə çıxarmağı ləğv et' : 'Önə çıxart',
                        icon: 'star',
                        onClick: () => onAction('feature', ad),
                      },
                      {
                        label: 'Sil',
                        icon: 'delete',
                        onClick: () => onAction('delete', ad),
                        variant: 'danger' as const,
                      },
                    ]}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant={getStatusBadgeVariant(ad.status)}>
                    {getStatusLabel(ad.status)}
                  </Badge>
                  {ad.isPremium && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Premium
                    </span>
                  )}
                  {ad.isFeatured && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Önə çıxarılmış
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium">{ad.price.toLocaleString()} {ad.currency}</span>
                  <span>{formatRelativeTime(ad.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{ad.seller.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
