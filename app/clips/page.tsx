'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scissors,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Sparkles,
  Play,
  Filter,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ApprovalStatus, Clip } from '@/types';

export default function ClipsListPage() {
  const { clips } = useApp();
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClips = clips.filter((clip) => {
    const matchesStatus = filterStatus === 'all' || clip.approvalStatus === filterStatus;
    const matchesSearch =
      clip.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.sourceVideoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.sourceChannelName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Candidate Shorts Studio</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review AI-extracted candidate clips, inspect heuristic virality scores, and customize subtitles.
          </p>
        </div>

        <Link
          href="/approvals"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          Pending Approvals ({clips.filter((c) => c.approvalStatus === 'needs_review').length})
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'needs_review', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {status === 'all' ? 'All Clips' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search clips by title or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Clips Grid */}
      {filteredClips.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No candidate clips found"
          description="Try broadening your filter criteria or import new video files to trigger AI highlight extraction."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClips.map((clip) => (
            <div
              key={clip.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* 9:16 Aspect Thumbnail Container */}
                <div className="relative aspect-[9/12] w-full bg-slate-900 overflow-hidden">
                  <img
                    src={clip.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />

                  {/* Badges on overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <StatusBadge status={clip.approvalStatus} />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-300/30">
                      <Sparkles className="w-3 h-3" />
                      Score {clip.score.overallScore}/100
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-mono">
                    {clip.duration}s
                  </div>

                  {/* Center Play Button Overlay */}
                  <Link
                    href={`/clips/${clip.id}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </Link>
                </div>

                {/* Clip Content Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {clip.metadata.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Source: <span className="font-medium text-slate-700">{clip.sourceVideoTitle}</span>
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                    💡 <strong className="text-slate-800">Hook:</strong> &quot;{clip.score.suggestedHookText}&quot;
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  {clip.startTime}s - {clip.endTime}s
                </span>

                <Link
                  href={`/clips/${clip.id}`}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Open Studio
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
