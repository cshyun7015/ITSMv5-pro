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
  'ASSIGNED': 'tw-bg-indigo-500/10 tw-text-indigo-500 tw-border tw-border-indigo-500/20',
  'IN_PROGRESS': 'tw-bg-yellow-500/10 tw-text-yellow-500 tw-border tw-border-yellow-500/20',
  'RESOLVED': 'tw-bg-emerald-500/10 tw-text-emerald-500 tw-border tw-border-emerald-500/20',
  'CLOSED': 'tw-bg-slate-500/10 tw-text-slate-500 tw-border tw-border-slate-500/20',
};

const statusLabels: Record<string, string> = {
  'OPEN': '접수됨',
  'ASSIGNED': '배정됨',
  'IN_PROGRESS': '처리중',
  'RESOLVED': '해결됨',
  'CLOSED': '완료됨',
};

const priorityStyles: Record<string, string> = {
  'P1': 'tw-bg-red-500/10 tw-text-red-500 tw-border tw-border-red-500/20',
  'P2': 'tw-bg-orange-500/10 tw-text-orange-500 tw-border tw-border-orange-500/20',
  'P3': 'tw-bg-yellow-500/10 tw-text-yellow-500 tw-border tw-border-yellow-500/20',
  'P4': 'tw-bg-slate-500/10 tw-text-slate-500 tw-border tw-border-slate-500/20',
};

const priorityLabels: Record<string, string> = {
  'P1': '긴급 (P1)',
  'P2': '높음 (P2)',
  'P3': '보통 (P3)',
  'P4': '낮음 (P4)',
};

const Badge: React.FC<BadgeProps> = ({ label, type, className }) => {
  const styles = type === 'status' ? statusStyles : priorityStyles;
  const labels = type === 'status' ? statusLabels : priorityLabels;
  
  const upperLabel = label.toUpperCase();
  const currentStyle = styles[upperLabel] || styles['P4'];
  const displayLabel = labels[upperLabel] || label;

  return (
    <span className={cn('tw-badge', currentStyle, className)}>
      {displayLabel}
    </span>
  );
};

export default Badge;
export { cn };
