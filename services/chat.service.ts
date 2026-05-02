import axiosInstance from '@/lib/axios';
import * as signalR from '@microsoft/signalr';

export interface ChatMessage {
  id: string;
  text?: string;
  imageUrls?: string[];
  messageType: number; // 0=Text, 1=Image, 2=System
  isSelf: boolean;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  createdDate: string;
  isRead: boolean;
}

export interface ChatListItem {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto?: string;
  isOtherUserOnline: boolean;
  adId?: string;
  adTitle?: string;
  adPrice?: number;
  adImageUrl?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
  isOwner: boolean;
  isStore?: boolean;
  storeName?: string;
  storeLogo?: string;
}

export interface ChatDetail extends ChatListItem {
  messages: ChatMessage[];
  adSlug?: string;
  isBlockedByMe: boolean;
  hasBlockedMe: boolean;
}

class ChatService {
  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;
  private baseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
    : 'http://84.247.184.186:5000';
  
  // Store handlers to re-attach on reconnect/new connection - only one handler per method
  private handlers: Map<string, (...args: any[]) => void> = new Map();

  /** REST API: Mesaj siyahısını gətir */
  async getChats(): Promise<ChatListItem[]> {
    const response = await axiosInstance.get<ChatListItem[]>('/chat');
    return response.data;
  }

  /** REST API: Konkret söhbəti gətir */
  async getChat(chatId: string, page: number = 1, pageSize: number = 50): Promise<ChatDetail> {
    const response = await axiosInstance.get<ChatDetail>(`/chat/${chatId}`, {
      params: { page, pageSize }
    });
    return response.data;
  }

  /** REST API: Yeni söhbət başlat */
  async startChat(recipientId: string, adId?: string): Promise<ChatListItem> {
    const response = await axiosInstance.post<ChatListItem>('/chat/start', { recipientId, adId });
    return response.data;
  }

  /** REST API: Söhbəti sil */
  async deleteChat(chatId: string): Promise<void> {
    await axiosInstance.delete(`/chat/${chatId}`);
  }

  /** REST API: İstifadəçini blokla */
  async blockUser(userId: string): Promise<void> {
    await axiosInstance.post(`/chat/block/${userId}`);
  }

  /** REST API: İstifadəçini blokdan çıxar */
  async unblockUser(userId: string): Promise<void> {
    await axiosInstance.post(`/chat/unblock/${userId}`);
  }

  /** SignalR: Hub-a qoşul */
  async startConnection(): Promise<void> {
    // If already connected/connecting, just return the existing promise or success
    if (this.connection && (
      this.connection.state === signalR.HubConnectionState.Connected || 
      this.connection.state === signalR.HubConnectionState.Connecting ||
      this.connection.state === signalR.HubConnectionState.Reconnecting
    )) {
      return;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/api/chatHub`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    // Re-attach all stored handlers to the new connection instance
    this.handlers.forEach((callback, methodName) => {
      this.connection?.on(methodName, callback);
    });

    this.startPromise = this.connection.start()
      .then(() => {
        console.log('SignalR Chat Connected');
        this.startPromise = null;
      })
      .catch((err) => {
        this.startPromise = null;
        
        if (err instanceof Error && (
          err.name === 'AbortError' || 
          err.message.includes('stopped during negotiation') || 
          err.message.includes('The connection was stopped before the start operation completed')
        )) {
          // This is expected during Fast Refresh/HMR, don't log as error
          return;
        }

        console.error('SignalR Connection Error: ', err);
        setTimeout(() => this.startConnection(), 5000);
      });

    return this.startPromise;
  }

  /** SignalR: Bağlantını kəs */
  async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR Chat Disconnected');
      } catch (err) {
        console.error('Error stopping SignalR connection:', err);
      } finally {
        this.connection = null;
        this.startPromise = null;
      }
    }
  }

  /** Registers a handler and attaches it to current connection if exists */
  private registerHandler(methodName: string, callback: (...args: any[]) => void) {
    this.handlers.set(methodName, callback);
    if (this.connection) {
      this.connection.off(methodName);
      this.connection.on(methodName, callback);
    }
  }

  /** SignalR: Mesaj göndər */
  async sendMessage(chatId: string, text?: string, imageUrls?: string[], messageType: number = 0): Promise<void> {
    await this.startConnection();
    
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendMessage', { chatId, text, imageUrls, messageType });
      } catch (err) {
        console.error('SignalR SendMessage Error:', err);
        throw new Error('Mesaj göndərilərkən xəta baş verdi');
      }
    } else {
      throw new Error('Serverlə əlaqə qurulmayıb. Zəhmət olmasa bir az gözləyin.');
    }
  }

  /** SignalR: Oxundu olaraq işarələ */
  async markAsRead(chatId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('MarkRead', chatId);
    } else {
      this.startConnection();
    }
  }

  /** SignalR: Yazır... bildirişi göndər */
  async sendTypingNotification(chatId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('Typing', chatId);
    } else {
      this.startConnection();
    }
  }

  /** SignalR: Hadisələri dinlə */
  onMessageReceived(callback: (chatId: string, message: ChatMessage) => void) {
    this.registerHandler('ReceiveMessage', callback);
  }

  onMessagesRead(callback: (chatId: string, userId: string) => void) {
    this.registerHandler('MessagesRead', callback);
  }

  onMessageSent(callback: (chatId: string, message: ChatMessage) => void) {
    this.registerHandler('MessageSent', callback);
  }

  onUserTyping(callback: (chatId: string, userId: string) => void) {
    this.registerHandler('UserTyping', callback);
  }

  onUserOnline(callback: (userId: string) => void) {
    this.registerHandler('UserOnline', callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    this.registerHandler('UserOffline', callback);
  }

  onUnreadCountUpdate(callback: (count: number) => void) {
    this.registerHandler('UpdateUnreadCount', callback);
  }

  off(methodName: string) {
    this.handlers.delete(methodName);
    this.connection?.off(methodName);
  }
}

export const chatService = new ChatService();
