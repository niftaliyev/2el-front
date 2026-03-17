interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatCard({ title, value, icon, change, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-accent/10 text-accent',
    danger: 'bg-error/10 text-error',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-gray-900 text-3xl font-black mb-3">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          {change && (
            <div className="flex items-center gap-1 text-xs">
              <span className={`material-symbols-outlined text-sm ${
                change.value >= 0 ? 'text-success' : 'text-error'
              }`}>
                {change.value >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span className={change.value >= 0 ? 'text-success font-medium' : 'text-error font-medium'}>
                {Math.abs(change.value)}%
              </span>
              <span className="text-gray-500">{change.label}</span>
            </div>
          )}
        </div>
        <div className={`flex items-center justify-center size-12 rounded-lg ${variantStyles[variant]}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
