import React from 'react';
import { Check, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './Badge';

interface StatusStepperProps {
  currentStatus: string;
  className?: string;
}

const statuses = [
  { key: 'OPEN', label: '접수됨', icon: AlertCircle },
  { key: 'IN_PROGRESS', label: '처리중', icon: Clock },
  { key: 'RESOLVED', label: '해결됨', icon: CheckCircle2 },
  { key: 'CLOSED', label: '완료됨', icon: Check },
];

const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, className }) => {
  const currentIndex = statuses.findIndex(s => s.key === currentStatus);

  return (
    <div className={cn("tw-flex tw-items-center tw-justify-between tw-w-full tw-max-w-3xl tw-mx-auto tw-mb-8", className)}>
      {statuses.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const Icon = status.icon;

        return (
          <React.Fragment key={status.key}>
            <div className="tw-flex tw-flex-col tw-items-center tw-relative">
              <div 
                className={cn(
                  "tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-300",
                  isCompleted ? "tw-bg-emerald-500 tw-text-white" : 
                  isActive ? "tw-bg-brand-600 tw-text-white tw-ring-4 tw-ring-brand-500/20" : 
                  "tw-bg-slate-800 tw-text-slate-500 tw-border tw-border-slate-700"
                )}
              >
                <Icon size={20} />
              </div>
              <span className={cn(
                "tw-absolute -tw-bottom-6 tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-wider tw-whitespace-nowrap",
                isActive ? "tw-text-white" : "tw-text-slate-500"
              )}>
                {status.label}
              </span>
            </div>
            {index < statuses.length - 1 && (
              <div className="tw-flex-1 tw-mx-4 tw-h-[2px] tw-bg-slate-800 tw-relative">
                <div 
                  className={cn(
                    "tw-absolute tw-left-0 tw-top-0 tw-h-full tw-bg-emerald-500 tw-transition-all tw-duration-500",
                    isCompleted ? "tw-w-full" : "tw-w-0"
                  )} 
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StatusStepper;
