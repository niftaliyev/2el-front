'use client';

import Button from '@/components/ui/Button';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: {
    label: string;
    icon: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

export default function BulkActionBar({ selectedCount, onClearSelection, actions }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4">
        <p className="text-sm font-medium">
          {selectedCount} seçildi
        </p>
        <div className="h-6 w-px bg-gray-700" />
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                action.variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : action.variant === 'secondary'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
          <button
            onClick={onClearSelection}
            className="ml-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Seçimi ləğv et"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
