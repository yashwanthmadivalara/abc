'use client';

import React, { useState } from 'react';
import {
  Eye,
  Download,
  Mic,
  Sparkles,
  Scissors,
  CheckCircle,
  Calendar,
  Send,
  AlertOctagon,
  Filter,
} from 'lucide-react';
import { ActivityEvent, ActivityEventType } from '@/types';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  events: ActivityEvent[];
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({ events, className, maxItems }: ActivityFeedProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  const displayList = maxItems ? filteredEvents.slice(0, maxItems) : filteredEvents;

  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'detection':
        return { icon: Eye, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      case 'import':
        return { icon: Download, color: 'text-sky-600 bg-sky-50 border-sky-200' };
      case 'transcription':
        return { icon: Mic, color: 'text-teal-600 bg-teal-50 border-teal-200' };
      case 'ai_analysis':
        return { icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'extraction':
        return { icon: Scissors, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'approval':
        return { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'scheduling':
        return { icon: Calendar, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'publishing':
        return { icon: Send, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'error':
        return { icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 border-rose-200' };
      default:
        return { icon: Sparkles, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm', className)}>
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Live Pipeline Activity</h3>
        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="detection">Detection</option>
            <option value="import">Import</option>
            <option value="transcription">Transcription</option>
            <option value="ai_analysis">AI Analysis</option>
            <option value="extraction">Extraction</option>
            <option value="approval">Approval</option>
            <option value="scheduling">Scheduling</option>
            <option value="publishing">Publishing</option>
            <option value="error">Errors</option>
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {displayList.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">No activity events recorded yet.</p>
        ) : (
          displayList.map((item) => {
            const { icon: Icon, color } = getEventIcon(item.type);
            return (
              <div key={item.id} className="flex items-start gap-3 text-xs group">
                <div className={cn('p-2 rounded-lg border flex-shrink-0 mt-0.5', color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  {item.channelName && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.channelName}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
