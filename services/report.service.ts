import axiosInstance from '@/lib/axios';
import { CreateAdReportRequest, CreateStoreReportRequest, ReportReasonLookup } from '@/types/api';

class ReportService {
  /** Submit a report for an advertisement */
  async reportAd(data: CreateAdReportRequest): Promise<void> {
    await axiosInstance.post('/reports/ad', data);
  }

  /** Submit a report for a store */
  async reportStore(data: CreateStoreReportRequest): Promise<void> {
    await axiosInstance.post('/reports/store', data);
  }

  /** Get available report reasons */
  async getReportReasons(): Promise<ReportReasonLookup[]> {
    const response = await axiosInstance.get<ReportReasonLookup[]>('/lookup/report-reasons');
    return response.data;
  }
}

export const reportService = new ReportService();
