'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Select, Textarea, Button } from '@/components/ui';
import { reportService } from '@/services/report.service';
import { ReportReason, ReportReasonLookup } from '@/types/api';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  type: 'ad' | 'store';
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, type }) => {
  const { t } = useLanguage();
  const [reasons, setReasons] = useState<ReportReasonLookup[]>([]);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchReasons = async () => {
        try {
          const data = await reportService.getReportReasons();
          setReasons(data);
        } catch (error) {
          console.error('Failed to fetch report reasons:', error);
        }
      };
      fetchReasons();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error(t('report.selectReasonError'));
      return;
    }

    setIsLoading(true);
    try {
      if (type === 'ad') {
        await reportService.reportAd({
          adId: targetId,
          reason: selectedReason,
          note
        });
      } else {
        await reportService.reportStore({
          storeId: targetId,
          reason: selectedReason,
          note
        });
      }
      toast.success(t('report.successMessage'));
      onClose();
      // Reset form
      setSelectedReason(null);
      setNote('');
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.errorOccurred');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const options = reasons.map(r => ({
    value: r.value.toString(),
    label: t(`report.reasons.${r.name}`) || r.name
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'ad' ? t('report.adTitle') : t('report.storeTitle')}
    >
      <div className="space-y-4 pt-2 pb-4">
        <Select
          label={t('report.reasonLabel')}
          placeholder={t('report.reasonPlaceholder')}
          options={options}
          onChange={(opt: any) => setSelectedReason(Number(opt.value))}
          value={options.find(o => Number(o.value) === selectedReason)}
          required
        />
        <Textarea
          label={t('report.noteLabel')}
          placeholder={t('report.notePlaceholder')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('report.cancel')}
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {t('report.send')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;
