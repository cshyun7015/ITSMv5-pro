import React from 'react';
import { Send, Clock, User } from 'lucide-react';
import type { RequestCommentDTO } from '../api/requestApi';

interface RequestCommentsProps {
  comments?: RequestCommentDTO[];
  newCommentValue: string;
  onNewCommentChange: (value: string) => void;
  onAddComment: () => void;
  loading?: boolean;
}

const RequestComments: React.FC<RequestCommentsProps> = ({
  comments = [],
  newCommentValue,
  onNewCommentChange,
  onAddComment,
  loading = false
}) => {
  return (
    <section className="tw-card tw-p-0 tw-flex tw-flex-col tw-overflow-hidden">
      <div className="tw-p-4 tw-bg-slate-800/30 tw-border-b tw-border-slate-800 tw-flex tw-items-center tw-justify-between">
        <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest tw-text-slate-200">Activity & Comments</h3>
        <span className="tw-text-xs tw-text-slate-500">{comments.length} Comments</span>
      </div>

      <div className="tw-p-4 tw-flex-1 tw-overflow-y-auto tw-max-h-[300px] tw-custom-scrollbar tw-flex tw-flex-col tw-gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="tw-flex tw-gap-3">
            <div className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-brand-600/20 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
              <User size={14} className="tw-text-brand-500" />
            </div>
            <div className="tw-flex-1 tw-flex tw-flex-col tw-gap-1">
              <div className="tw-flex tw-items-center tw-justify-between">
                <span className="tw-text-xs tw-font-bold tw-text-slate-200">{comment.authorId}</span>
                <div className="tw-flex tw-items-center tw-gap-1 tw-text-[10px] tw-text-slate-500">
                  <Clock size={10} />
                  {comment.createdAt?.split('T')[0]} {comment.createdAt?.split('T')[1].slice(0, 5)}
                </div>
              </div>
              <div className="tw-p-3 tw-bg-obsidian-light tw-border tw-border-slate-800 tw-rounded-lg tw-text-sm tw-text-slate-300 tw-leading-relaxed">
                {comment.content}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="tw-text-center tw-py-8 tw-text-slate-600 tw-text-xs italic">
            No activity history yet.
          </div>
        )}
      </div>

      <div className="tw-p-4 tw-bg-slate-800/20 tw-border-t tw-border-slate-800">
        <div className="tw-relative">
          <textarea 
            placeholder="Write a comment..."
            className="tw-input tw-w-full tw-min-h-[80px] tw-pr-12 tw-resize-none tw-text-sm"
            value={newCommentValue}
            onChange={(e) => onNewCommentChange(e.target.value)}
            data-testid="req-detail-comment-input"
          />
          <button 
            type="button"
            onClick={onAddComment}
            disabled={!newCommentValue.trim() || loading}
            className="tw-absolute tw-bottom-3 tw-right-3 tw-p-2 tw-bg-brand-600 hover:tw-bg-brand-700 tw-text-white tw-rounded-lg tw-transition-all disabled:tw-opacity-50 disabled:tw-hover:tw-bg-brand-600"
            data-testid="req-detail-comment-submit"
          >
            {loading ? (
              <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default RequestComments;
