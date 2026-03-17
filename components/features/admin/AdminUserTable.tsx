'use client';

import Image from 'next/image';
import { AdminUser } from '@/types/admin';
import Checkbox from '@/components/ui/Checkbox';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/ui/Dropdown';
import { formatRelativeTime } from '@/lib/utils';

interface AdminUserTableProps {
  users: AdminUser[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onAction: (action: string, user: AdminUser) => void;
}

export default function AdminUserTable({ users, selectedIds, onSelectionChange, onAction }: AdminUserTableProps) {
  const isAllSelected = users.length > 0 && selectedIds.length === users.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map(user => user.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getStatusBadgeVariant = (status: AdminUser['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'banned': return 'danger';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: AdminUser['status']) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'suspended': return 'Dayandırılıb';
      case 'banned': return 'Blok edilib';
      default: return status;
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <span className="material-symbols-outlined text-gray-300 !text-6xl mb-4">inbox</span>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Heç nə tapılmadı</h3>
        <p className="text-gray-500">Bu filtrə uyğun istifadəçi yoxdur</p>
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
                İstifadəçi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Elanlar
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Qeydiyyat
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Son Giriş
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onChange={() => handleSelect(user.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="material-symbols-outlined text-primary">person</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        {user.isVerified && (
                          <span className="material-symbols-outlined text-blue-500 !text-sm" title="Təsdiqlənmiş">
                            verified
                          </span>
                        )}
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900">{user.adsCount} elan</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600">{formatRelativeTime(user.registeredAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600">{formatRelativeTime(user.lastLogin)}</p>
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
                      ...(user.status === 'suspended' || user.status === 'banned' ? [{
                        label: 'Aktivləşdir',
                        icon: 'check_circle',
                        onClick: () => onAction('activate', user),
                      }] : []),
                      ...(user.status === 'active' ? [{
                        label: 'Dayandır',
                        icon: 'block',
                        onClick: () => onAction('suspend', user),
                      }] : []),
                      {
                        label: 'Sil',
                        icon: 'delete',
                        onClick: () => onAction('delete', user),
                        variant: 'danger' as const,
                        disabled: user.isAdmin,
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
        {users.map((user) => (
          <div key={user.id} className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedIds.includes(user.id)}
                onChange={() => handleSelect(user.id)}
                className="mt-1"
              />
              <div className="relative size-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </h4>
                      {user.isVerified && (
                        <span className="material-symbols-outlined text-blue-500 !text-sm">
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Dropdown
                    align="right"
                    trigger={
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-gray-600 !text-lg">more_vert</span>
                      </button>
                    }
                    items={[
                      ...(user.status === 'suspended' || user.status === 'banned' ? [{
                        label: 'Aktivləşdir',
                        icon: 'check_circle',
                        onClick: () => onAction('activate', user),
                      }] : []),
                      ...(user.status === 'active' ? [{
                        label: 'Dayandır',
                        icon: 'block',
                        onClick: () => onAction('suspend', user),
                      }] : []),
                      {
                        label: 'Sil',
                        icon: 'delete',
                        onClick: () => onAction('delete', user),
                        variant: 'danger' as const,
                        disabled: user.isAdmin,
                      },
                    ]}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                  {user.isAdmin && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{user.adsCount} elan</span>
                  <span>{formatRelativeTime(user.lastLogin)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
