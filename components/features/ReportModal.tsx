'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Select, Textarea, Button } from '@/components/ui';
import { reportService } from '@/services/report.service';
import { ReportReason, ReportReasonLookup } from '@/types/api';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  type: 'ad' | 'store';
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

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, type }) => {
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
      toast.error('Zəhmət olmasa şikayət səbəbini seçin');
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
      toast.success('Şikayətiniz uğurla göndərildi');
      onClose();
      // Reset form
      setSelectedReason(null);
      setNote('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xəta baş verdi';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const options = reasons.map(r => ({
    value: r.value.toString(),
    label: reasonTranslations[r.name] || r.name
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'ad' ? 'Elan üçün şikayət' : 'Mağaza üçün şikayət'}
    >
      <div className="space-y-4 pt-2 pb-4">
        <Select
          label="Şikayət səbəbi"
          placeholder="Səbəb seçin"
          options={options}
          onChange={(opt: any) => setSelectedReason(Number(opt.value))}
          value={options.find(o => Number(o.value) === selectedReason)}
          required
        />
        <Textarea
          label="Əlavə qeyd (istəyə bağlı)"
          placeholder="Şikayətiniz barədə ətraflı məlumat yazın..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Ləğv et
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Göndər
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;
