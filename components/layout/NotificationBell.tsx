'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notificationService, NotificationListItem, NotificationType } from '@/services/notification.service';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { az, ru, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationListItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getLocale = () => {
    switch (language) {
      case 'az': return az;
      case 'ru': return ru;
      default: return enUS;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      if (!isAuthenticated) return;

      // Initial fetch
      fetchNotifications();
      fetchUnreadCount();

      // Start SignalR
      await notificationService.startConnection();
      
      if (!isMounted) return;

      // Listen for new notifications
      notificationService.onNotificationReceived((newNotif) => {
        console.log('NotificationBell: processing new notification', newNotif);
        setNotifications(prev => {
          // Avoid duplicates
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev.slice(0, 19)];
        });
        setUnreadCount(prev => prev + 1);
        
        // Show toast
        toast(newNotif.title || t('notifications.newNotification') || 'Yeni bildiriş', {
          description: newNotif.text,
          action: newNotif.link ? {
            label: t('common.details') || 'Bax',
            onClick: () => {
              if (newNotif.id) markRead(newNotif.id);
              router.push(newNotif.link!);
            }
          } : undefined
        });
      });
    };

    setupNotifications();

    return () => {
      isMounted = false;
      notificationService.off('ReceiveNotification');
    };
  }, [isAuthenticated, t, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(1, 10);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Message: return 'chat';
      case NotificationType.Info: return 'info';
      case NotificationType.Warning: return 'warning';
      case NotificationType.Error: return 'error';
      case NotificationType.Confirm: return 'check_circle';
      default: return 'notifications';
    }
  };

  const getColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Message: return 'text-blue-500';
      case NotificationType.Info: return 'text-primary';
      case NotificationType.Warning: return 'text-yellow-500';
      case NotificationType.Error: return 'text-red-500';
      case NotificationType.Confirm: return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="flex cursor-pointer items-center justify-center rounded-xl h-9 w-9 sm:h-10 sm:w-10 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-90 shadow-sm border border-gray-100 sm:border-transparent relative"
      >
        <span className="material-symbols-outlined !text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[110] overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">{t('notifications.title') || 'Bildirişlər'}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                {t('notifications.markAllRead') || 'Hamısını oxundu et'}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined !text-4xl opacity-20">notifications_off</span>
                <p className="text-sm">{t('notifications.noNotifications') || 'Yeni bildiriş yoxdur'}</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition-colors relative cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => {
                    if (!notif.isRead) markRead(notif.id);
                    if (notif.link) {
                      setIsOpen(false);
                      router.push(notif.link);
                    }
                  }}
                >
                  <div className={`flex-shrink-0 size-10 rounded-full bg-white shadow-sm flex items-center justify-center ${getColor(notif.type)}`}>
                    <span className="material-symbols-outlined !text-[20px]">{getIcon(notif.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className={`text-sm font-bold truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title || (notif.type === NotificationType.Message ? 'Yeni mesaj' : 'Bildiriş')}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                        {formatDistanceToNow(new Date(notif.createdDate), { addSuffix: true, locale: getLocale() })}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                      {notif.text}
                    </p>
                  </div>
                  
                  {!notif.isRead && (
                    <div className="size-2 bg-primary rounded-full absolute right-4 bottom-4"></div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50/30 text-center">
            <Link 
              href="/cabinet/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-gray-600 hover:text-primary transition-colors"
            >
              {t('notifications.seeAll') || 'Bütün bildirişlər'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
