import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  label: string;
  type: 'status' | 'priority';
  className?: string;
}

const statusStyles: Record<string, string> = {
  'OPEN': 'tw-bg-blue-500/10 tw-text-blue-500 tw-border tw-border-blue-500/20',
  'IN_PROGRESS': 'tw-bg-yellow-500/10 tw-text-yellow-500 tw-border tw-border-yellow-500/20',
  'RESOLVED': 'tw-bg-emerald-500/10 tw-text-emerald-500 tw-border tw-border-emerald-500/20',
  'CLOSED': 'tw-bg-slate-500/10 tw-text-slate-500 tw-border tw-border-slate-500/20',
};

const priorityStyles: Record<string, string> = {
  'P1': 'tw-bg-red-500/10 tw-text-red-500 tw-border tw-border-red-500/20',
  'P2': 'tw-bg-orange-500/10 tw-text-orange-500 tw-border tw-border-orange-500/20',
  'P3': 'tw-bg-yellow-500/10 tw-text-yellow-500 tw-border tw-border-yellow-500/20',
  'P4': 'tw-bg-slate-500/10 tw-text-slate-500 tw-border tw-border-slate-500/20',
};

const Badge: React.FC<BadgeProps> = ({ label, type, className }) => {
  const styles = type === 'status' ? statusStyles : priorityStyles;
  const currentStyle = styles[label.toUpperCase()] || styles['P4'];

  return (
    <span className={cn('tw-badge', currentStyle, className)}>
      {label}
    </span>
  );
};

export default Badge;
export { cn };
