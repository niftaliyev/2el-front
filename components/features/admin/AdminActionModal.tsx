'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

type ActionType = 'approve' | 'reject' | 'delete' | 'feature' | 'suspend' | 'activate';

interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: ActionType;
  itemType: 'ad' | 'user';
  itemTitle: string;
  onConfirm: (reason?: string) => Promise<void>;
}

export default function AdminActionModal({
  isOpen,
  onClose,
  action,
  itemType,
  itemTitle,
  onConfirm
}: AdminActionModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const actionConfig = {
    approve: { title: 'Təsdiq et', icon: 'check_circle', variant: 'primary' as const, color: 'text-green-500' },
    reject: { title: 'Rədd et', icon: 'cancel', variant: 'danger' as const, color: 'text-red-500' },
    delete: { title: 'Sil', icon: 'delete', variant: 'danger' as const, color: 'text-red-500' },
    feature: { title: 'Önə çıxart', icon: 'star', variant: 'primary' as const, color: 'text-primary' },
    suspend: { title: 'Dayandır', icon: 'block', variant: 'danger' as const, color: 'text-amber-500' },
    activate: { title: 'Aktivləşdir', icon: 'check_circle', variant: 'primary' as const, color: 'text-green-500' },
  };

  const config = actionConfig[action];

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(reason || undefined);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setReason('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={config.title}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Ləğv et
          </Button>
          <Button
            variant={config.variant}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {config.title}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <span className={`material-symbols-outlined text-3xl ${config.color}`}>
            {config.icon}
          </span>
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {itemType === 'ad' ? 'Elan' : 'İstifadəçi'}
            </p>
            <p className="font-medium text-gray-900">{itemTitle}</p>
          </div>
        </div>

        <p className="text-gray-700">
          {action === 'approve' && 'Bu elanı təsdiq etmək istədiyinizə əminsiniz?'}
          {action === 'reject' && 'Bu elanı rədd etmək istədiyinizə əminsiniz?'}
          {action === 'delete' && 'Bu məlumatı silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.'}
          {action === 'feature' && 'Bu elanı önə çıxartmaq istədiyinizə əminsiniz?'}
          {action === 'suspend' && 'Bu istifadəçini dayandırmaq istədiyinizə əminsiniz?'}
          {action === 'activate' && 'Bu istifadəçini aktivləşdirmək istədiyinizə əminsiniz?'}
        </p>

        {(action === 'reject' || action === 'delete' || action === 'suspend') && (
          <Textarea
            label={action === 'delete' ? 'Səbəb (istəyə bağlı)' : 'Səbəb'}
            placeholder="Səbəbi qeyd edin..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        )}
      </div>
    </Modal>
  );
}
