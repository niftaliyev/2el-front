'use client';

import { useState, useEffect } from 'react';
import UserSidebar from '@/components/features/cabinet/UserSidebar';
import { notificationService, NotificationListItem, NotificationType } from '@/services/notification.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { az, ru, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const getLocale = () => {
    switch (language) {
      case 'az': return az;
      case 'ru': return ru;
      default: return enUS;
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications(1, 100);
      
      const filtered: NotificationListItem[] = [];
      const seenSources = new Set<string>();
      
      for (const notif of data) {
        if (!notif.sourceId) {
          filtered.push(notif);
        } else if (!seenSources.has(notif.sourceId)) {
          seenSources.add(notif.sourceId);
          filtered.push(notif);
        }
      }
      
      setNotifications(filtered);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success(t('notifications.markAllRead'));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(t('common.delete'));
    } catch (err) {
      console.error('Error deleting notification:', err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      toast.success(t('cabinet.notifications.deleteAll'));
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllConfirm(false);
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

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserSidebar />

          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {/* Page Heading */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">
                    {t('cabinet.notifications.title')}
                  </h1>
                  <p className="text-gray-500 text-sm font-medium">
                    {t('cabinet.notifications.subtitle')}
                  </p>
                </div>

                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs sm:text-sm font-bold text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      {t('cabinet.notifications.markAllRead')}
                    </button>
                    <button
                      onClick={() => setShowDeleteAllConfirm(true)}
                      className="text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      {t('cabinet.notifications.deleteAll')}
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="animate-spin h-8 w-8 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
                  <p className="text-gray-400 text-sm font-medium">{t('common.loading')}</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`group relative p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer ${
                        !notif.isRead 
                          ? 'bg-primary/5 border-primary/10 shadow-sm' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => {
                        if (!notif.isRead) handleMarkRead(notif.id);
                        
                        let targetLink = notif.link;
                        if (notif.type === NotificationType.Message && notif.sourceId) {
                          targetLink = `/cabinet/messages?chatId=${notif.sourceId}`;
                        }

                        if (targetLink) router.push(targetLink);
                      }}
                    >
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 size-12 rounded-full bg-white shadow-sm flex items-center justify-center ${getColor(notif.type)}`}>
                          <span className="material-symbols-outlined !text-[24px]">{getIcon(notif.type)}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-base font-bold leading-snug ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap mt-1 font-medium">
                              {formatDistanceToNow(new Date(notif.createdDate), { addSuffix: true, locale: getLocale() })}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 leading-relaxed ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                            {notif.text}
                          </p>
                        </div>

                        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(notif.id);
                            }}
                            className="size-9 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      {!notif.isRead && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:hidden">
                           <div className="size-2.5 bg-primary rounded-full ring-4 ring-primary/10"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                  <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-gray-300 text-5xl">notifications_off</span>
                  </div>
                  <h3 className="text-gray-900 text-xl font-bold">{t('cabinet.notifications.noNotifications')}</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">{t('cabinet.notifications.noNotificationsDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title={t('cabinet.notifications.title')}
        description={t('cabinet.notifications.deleteConfirm')}
        confirmText={t('common.delete')}
        isDestructive
      />

      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleDeleteAll}
        title={t('cabinet.notifications.deleteAll')}
        description={t('cabinet.notifications.deleteAllConfirm')}
        confirmText={t('common.delete')}
        isDestructive
        isLoading={isDeletingAll}
      />
    </main>
  );
}
