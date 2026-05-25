import axiosInstance from '@/lib/axios';

class TrafficService {
  async logTraffic(): Promise<void> {
    try {
      await axiosInstance.post('/traffic/log');
    } catch (error) {
      console.error('Failed to log traffic:', error);
    }
  }
}

export const trafficService = new TrafficService();
