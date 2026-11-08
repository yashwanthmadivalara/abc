'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Send,
  Loader2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApprovalStatus, JobStatus, LibraryCategory, PublishStatus } from '@/types';

type BadgeStatus = ApprovalStatus | JobStatus | LibraryCategory | PublishStatus | 'Connected' | 'Disconnected' | 'Checking' | 'Error' | 'active' | 'paused';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  let label = status;
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = FileText;

  switch (status) {
    case 'approved':
    case 'completed':
    case 'published':
    case 'Connected':
    case 'active':
      label = status === 'approved' ? 'Approved' : status === 'published' ? 'Published' : status === 'Connected' ? 'Connected' : status === 'active' ? 'Active' : 'Completed';
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      break;

    case 'needs_review':
    case 'pending_approval':
      label = 'Needs Review';
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      Icon = AlertCircle;
      break;

    case 'processing':
    case 'running':
    case 'uploading':
    case 'Checking':
      label = status === 'uploading' ? 'Uploading' : status === 'Checking' ? 'Checking' : 'Processing';
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Loader2;
      break;

    case 'scheduled':
      label = 'Scheduled';
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = Calendar;
      break;

    case 'failed':
    case 'rejected':
    case 'error':
    case 'Disconnected':
    case 'Error':
      label = status === 'rejected' ? 'Rejected' : status === 'Disconnected' ? 'Disconnected' : 'Failed';
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;

    case 'queued':
      label = 'Queued';
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Clock;
      break;

    case 'draft':
    case 'imported':
    case 'extracted':
    case 'paused':
      label = status === 'imported' ? 'Imported' : status === 'extracted' ? 'Extracted' : status === 'paused' ? 'Paused' : 'Draft';
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = Clock;
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        bg,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            'w-3.5 h-3.5',
            (status === 'running' || status === 'processing' || status === 'Checking' || status === 'uploading') &&
              'animate-spin'
          )}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}
