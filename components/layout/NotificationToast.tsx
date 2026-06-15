'use client';

import { NotificationListItem, NotificationType } from '@/services/notification.service';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationToastProps {
  notification: NotificationListItem;
  toastId: string | number;
  onActionClick: () => void;
}

export default function NotificationToast({
  notification,
  toastId,
  onActionClick
}: NotificationToastProps) {
  const { t, language } = useLanguage();

  // Extract initials for message notifications
  const getInitials = (title: string) => {
    if (!title) return '?';
    const parts = title.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  const isMessage = notification.type === NotificationType.Message ||
    (notification.type as any) === 'Message' ||
    (notification.type as any) === NotificationType.Message.toString();

  // Category specific styles:
  // - borderColor (the left accent line)
  // - iconBg / iconTextColor
  // - buttonStyle (for the "Ətraflı" action button)
  const typeConfig = {
    message: {
      borderColor: 'bg-blue-500',
      iconColor: 'text-blue-600 bg-blue-50',
      icon: 'chat',
      buttonStyle: 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100/70 hover:border-blue-600'
    },
    confirm: {
      borderColor: 'bg-emerald-500',
      iconColor: 'text-emerald-600 bg-emerald-50',
      icon: 'check_circle',
      buttonStyle: 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-100/70 hover:border-emerald-600'
    },
    warning: {
      borderColor: 'bg-amber-500',
      iconColor: 'text-amber-600 bg-amber-50',
      icon: 'warning',
      buttonStyle: 'bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-100/70 hover:border-amber-500'
    },
    error: {
      borderColor: 'bg-rose-500',
      iconColor: 'text-rose-600 bg-rose-50',
      icon: 'error',
      buttonStyle: 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100/70 hover:border-rose-600'
    },
    system: {
      borderColor: 'bg-indigo-500',
      iconColor: 'text-indigo-600 bg-indigo-50',
      icon: 'info',
      buttonStyle: 'bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100/70 hover:border-indigo-600'
    }
  };

  const getConfig = () => {
    if (isMessage) return typeConfig.message;
    const typeStr = typeof notification.type === 'string'
      ? notification.type
      : NotificationType[notification.type];

    switch (typeStr) {
      case 'Confirm': return typeConfig.confirm;
      case 'Warning': return typeConfig.warning;
      case 'Error': return typeConfig.error;
      case 'Info':
      case 'System':
      default: return typeConfig.system;
    }
  };

  const config = getConfig();

  return (
    <div className="flex items-center gap-3 p-2.5 pl-3.5 pr-8 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full max-w-[340px] relative pointer-events-auto transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] group">
      {/* Type line indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.borderColor}`} />

      {/* Left Side: Avatar or Icon */}
      {isMessage ? (
        <div className="relative flex-shrink-0">
          <div className="size-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-wide shadow-sm border border-white">
            {getInitials(notification.title)}
          </div>
          <span className="absolute bottom-0 right-0 size-2 bg-blue-500 rounded-full border border-white" />
        </div>
      ) : (
        <div className={`size-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconColor}`}>
          <span className="material-symbols-outlined !text-[18px]">{config.icon}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-grow min-w-0 pr-1">
        <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">
          {notification.title || (isMessage
            ? (language === 'ru' ? 'Новое сообщение' : 'Yeni mesaj')
            : (t('notifications.newNotification') || 'Bildiriş'))}
        </h4>
        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-normal">
          {notification.text}
        </p>
      </div>

      {/* Action Button */}
      {notification.link && (
        <button
          onClick={onActionClick}
          className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 active:scale-95 cursor-pointer ${config.buttonStyle}`}
        >
          {t('common.details') || 'Ətraflı'}
        </button>
      )}

      {/* Close Button */}
      <button
        onClick={() => toast.dismiss(toastId)}
        className="absolute top-1 right-1 size-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
        aria-label="Close"
      >
        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

