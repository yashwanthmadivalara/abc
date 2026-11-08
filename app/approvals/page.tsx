'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Scissors,
  Sparkles,
  Calendar,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ApprovalsQueuePage() {
  const { clips, approveClip, rejectClip } = useApp();
  const pendingClips = clips.filter((c) => c.approvalStatus === 'needs_review');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pending Approvals Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manual creator approval checkpoint before any video is scheduled or published.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {pendingClips.length} Awaiting Signoff
          </span>
        </div>
      </div>

      {/* Blueprint mandate reminder */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Human-in-the-Loop Workflow:</strong> Clips will never be automatically published without your explicit manual approval.
          </span>
        </div>
      </div>

      {pendingClips.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up!"
          description="There are currently no clips awaiting your review. Once new source videos are processed, extracted clips will queue up here."
          actionLabel="View All Clips"
          onAction={() => window.location.assign('/clips')}
        />
      ) : (
        <div className="space-y-4">
          {pendingClips.map((clip) => (
            <div
              key={clip.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="relative w-28 h-20 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={clip.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                    {clip.duration}s
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{clip.metadata.title}</h3>
                    <StatusBadge status={clip.approvalStatus} />
                  </div>

                  <p className="text-xs text-slate-500">
                    Source: <span className="font-medium text-slate-700">{clip.sourceVideoTitle}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1">
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                      <Sparkles className="w-3.5 h-3.5" />
                      Heuristic Score: {clip.score.overallScore}/100
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{clip.startTime}s - {clip.endTime}s</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-center">
                <Link
                  href={`/clips/${clip.id}`}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  Edit in Studio
                </Link>

                <button
                  onClick={() => rejectClip(clip.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                >
                  Reject
                </button>

                <button
                  onClick={() => approveClip(clip.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Clip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
