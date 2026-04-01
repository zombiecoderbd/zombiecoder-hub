'use client';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning' | 'info';
  label?: string;
}

const statusStyles = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-400',
  inactive: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  error: 'bg-red-500/10 text-red-700 dark:text-red-400',
  success: 'bg-green-500/10 text-green-700 dark:text-green-400',
  warning: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {label || statusLabels[status]}
    </span>
  );
}
