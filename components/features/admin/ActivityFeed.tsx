'use client';

import { RecentActivity } from '@/types/admin';
import { formatRelativeTime } from '@/lib/utils';

interface ActivityFeedProps {
  activities: RecentActivity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const activityIcons: Record<RecentActivity['type'], { icon: string; color: string }> = {
    user_registered: { icon: 'person_add', color: 'text-green-500 bg-green-50' },
    ad_created: { icon: 'add_circle', color: 'text-blue-500 bg-blue-50' },
    ad_approved: { icon: 'check_circle', color: 'text-green-500 bg-green-50' },
    ad_rejected: { icon: 'cancel', color: 'text-red-500 bg-red-50' },
    ad_deleted: { icon: 'delete', color: 'text-gray-500 bg-gray-50' },
    user_suspended: { icon: 'block', color: 'text-amber-500 bg-amber-50' },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Son Fəaliyyətlər
        </h3>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="material-symbols-outlined text-gray-300 !text-6xl mb-4">inbox</span>
            <p>Heç bir fəaliyyət yoxdur</p>
          </div>
        ) : (
          activities.map((activity) => {
            const config = activityIcons[activity.type];
            return (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center size-10 rounded-full ${config.color}`}>
                    <span className="material-symbols-outlined text-lg">{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-1 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {activity.user && (
                        <>
                          <span className="material-symbols-outlined !text-xs">person</span>
                          <span>{activity.user.name}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
