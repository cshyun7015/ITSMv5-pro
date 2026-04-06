import React, { useState, useEffect } from 'react';
import { History, User, Clock, ArrowRight } from 'lucide-react';
import requestApi from '../api/requestApi';

interface HistoryItem {
  id: number;
  action: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  createdAt: string;
}

interface RequestHistoryListProps {
  requestId: number;
  refreshTrigger?: number;
}

const RequestHistoryList: React.FC<RequestHistoryListProps> = ({ requestId, refreshTrigger }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await requestApi.getHistory(requestId);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [requestId, refreshTrigger]);

  const formatAction = (action: string, field: string) => {
    switch (action) {
      case 'STATUS_CHANGE': return '상태 변경';
      case 'FIELD_UPDATE': 
        if (field === 'assigneeId') return '담당자 변경';
        if (field === 'srImpactCode') return '영향도 변경';
        if (field === 'srUrgencyCode') return '긴급도 변경';
        return `${field} 수정`;
      case 'CREATED': return '요청 생성';
      default: return action;
    }
  };

  if (loading) return <div className="tw-text-center tw-p-4 tw-opacity-50">Loading history...</div>;

  return (
    <section className="tw-card tw-p-8 tw-bg-obsidian-light/30">
      <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6 tw-text-indigo-400">
        <History size={20} />
        <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">변경 이력 (Audit Trail)</h3>
      </div>

      <div className="tw-space-y-4">
        {history.length === 0 ? (
          <div className="tw-text-center tw-py-8 tw-text-slate-500 tw-text-sm tw-italic">
            기록된 변경 이력이 없습니다.
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={item.id} className="tw-relative tw-pl-8 tw-pb-6 last:tw-pb-0">
               {/* Timeline Line */}
               {idx !== history.length - 1 && (
                 <div className="tw-absolute tw-left-[11px] tw-top-6 tw-bottom-0 tw-w-0.5 tw-bg-slate-800"></div>
               )}
               {/* Timeline Dot */}
               <div className="tw-absolute tw-left-0 tw-top-1.5 tw-w-6 tw-h-6 tw-rounded-full tw-bg-slate-900 tw-border-2 tw-border-indigo-500/50 tw-flex tw-items-center tw-justify-center">
                 <div className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-indigo-500"></div>
               </div>

               <div className="tw-flex tw-flex-col tw-gap-2">
                 <div className="tw-flex tw-items-center tw-justify-between">
                    <span className="tw-text-[13px] tw-font-bold tw-text-slate-200">
                        {formatAction(item.action, item.fieldName)}
                    </span>
                    <div className="tw-flex tw-items-center tw-gap-3 tw-text-[11px] tw-text-slate-500">
                        <div className="tw-flex tw-items-center tw-gap-1">
                            <User size={12} />
                            {item.changedBy}
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-1">
                            <Clock size={12} />
                            {item.createdAt.replace('T', ' ').substring(0, 16)}
                        </div>
                    </div>
                 </div>
                 
                 {item.action !== 'CREATED' && (
                    <div className="tw-flex tw-items-center tw-gap-3 tw-bg-obsidian tw-p-2 tw-rounded-lg tw-border tw-border-slate-800/50">
                        <span className="tw-text-xs tw-text-slate-500 tw-line-through">{item.oldValue || 'None'}</span>
                        <ArrowRight size={12} className="tw-text-brand-400" />
                        <span className="tw-text-xs tw-text-brand-400 tw-font-bold">{item.newValue || 'None'}</span>
                    </div>
                 )}
               </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default RequestHistoryList;
