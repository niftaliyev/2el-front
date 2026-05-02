import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import axiosInstance from '@/lib/axios';

export enum NotificationType {
  System = 0,
  Info = 1,
  Confirm = 2,
  Warning = 3,
  Error = 4,
  Message = 5
}

export interface NotificationListItem {
  id: string;
  ownerId: string;
  title: string;
  text: string;
  link?: string;
  isRead: boolean;
  type: NotificationType;
  sourceId: string;
  createdDate: string;
}

class NotificationService {
  private hubConnection: HubConnection | null = null;
  private baseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
    : 'http://localhost:5156';
  private hubUrl = `${this.baseUrl}/api/notificationHub`;

  // Real-time
  public async startConnection() {
    if (this.hubConnection?.state === 'Connected') return;
    if (this.hubConnection?.state === 'Connecting') return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    if (!this.hubConnection) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();
    }

    try {
      if (this.hubConnection.state === 'Disconnected') {
        await this.hubConnection.start();
        console.log('Notification SignalR Connected');
      }
    } catch (err) {
      console.error('Error while starting Notification SignalR connection:', err);
      // Try again after 5 seconds
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  public onNotificationReceived(callback: (notification: NotificationListItem) => void) {
    if (!this.hubConnection) {
      console.warn('NotificationHub connection not initialized yet');
    }
    this.hubConnection?.on('ReceiveNotification', (notification) => {
      console.log('Notification received via SignalR:', notification);
      callback(notification);
    });
  }

  public off(methodName: string) {
    this.hubConnection?.off(methodName);
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  // REST API
  public async getNotifications(page: number = 1, size: number = 10): Promise<NotificationListItem[]> {
    const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  }

  public async getUnreadCount(): Promise<number> {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data.count; // Backend returns { count: X }
  }

  public async markAsRead(id: string): Promise<void> {
    await axiosInstance.patch(`/notifications/${id}/read`);
  }

  public async markAllAsRead(): Promise<void> {
    await axiosInstance.patch('/notifications/read-all');
  }

  public async deleteNotification(id: string): Promise<void> {
    await axiosInstance.delete(`/notifications/${id}`);
  }

  public async deleteAllNotifications(): Promise<void> {
    await axiosInstance.delete('/notifications/all');
  }
}

export const notificationService = new NotificationService();
