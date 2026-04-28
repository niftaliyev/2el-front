'use client';

import Modal from './Modal';
import Button from './Button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  const finalConfirmText = confirmText || t('common.confirm');
  const finalCancelText = cancelText || t('common.cancel');
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-11"
            disabled={isLoading}
          >
            {finalCancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1 rounded-xl h-11"
            isLoading={isLoading}
          >
            {finalConfirmText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className={`size-16 rounded-full flex items-center justify-center mb-6 ${
          isDestructive ? 'bg-red-50 text-red-500' : 'bg-primary/5 text-primary'
        }`}>
          {isDestructive ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </Modal>
  );
}
