'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Film,
  Scissors,
  Calendar,
  CheckCircle2,
  Upload,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityFeed } from '@/components/ui/ActivityFeed';

export default function DashboardPage() {
  const {
    dashboardSummary,
    activityEvents,
    activeJobs,
    clips,
  } = useApp();

  const primaryJob = activeJobs[0];

  return (
    <div className="space-y-6">
      {/* Streamlined Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ViralFlow AI Automation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              YouTube Shorts Automation Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitor channels, detect long-form highlights, transcribe dialog, and schedule vertical Shorts.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/channels/sources"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Radio className="w-4 h-4" />
              Connect Channel
            </Link>

            <Link
              href="/library/upload"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-sm transition-colors border border-white/10"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </Link>

            <Link
              href="/approvals"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-sm transition-colors border border-white/10"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Review Clips ({dashboardSummary.pendingApprovalsCount})
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Essential KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Source Channels"
          value={dashboardSummary.sourceChannelsCount}
          icon={Radio}
          subtitle="Monitored YouTube Feeds"
        />

        <StatCard
          title="Video Library"
          value={dashboardSummary.detectedVideosCount}
          icon={Film}
          subtitle="Cataloged Source Videos"
        />

        <StatCard
          title="Candidate Clips"
          value={dashboardSummary.generatedClipsCount}
          icon={Scissors}
          subtitle="Extracted Vertical Shorts"
        />

        <StatCard
          title="Scheduled Releases"
          value={dashboardSummary.scheduledPostsCount}
          icon={Calendar}
          subtitle="Upcoming Release Queue"
        />
      </div>

      {/* Grid: Active Engine & Approvals on Left, Activity on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* Active Pipeline Status */}
          {primaryJob && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900">{primaryJob.taskName}</h3>
                </div>
                <StatusBadge status="running" />
              </div>

              <ProgressBar
                progress={primaryJob.progress}
                stage={primaryJob.currentStage}
                color="blue"
              />

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Started: {primaryJob.startedAt}</span>
                <span className="font-mono text-slate-700 font-semibold">{primaryJob.progress}% complete</span>
              </div>
            </div>
          )}

          {/* Pending Approval Highlight */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending Approvals</h3>
                <p className="text-xs text-slate-500">Clips awaiting your signoff before scheduling</p>
              </div>
              <Link
                href="/approvals"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All ({dashboardSummary.pendingApprovalsCount})
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {clips
                .filter((c) => c.approvalStatus === 'needs_review')
                .slice(0, 3)
                .map((clip) => (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={clip.thumbnailUrl}
                        alt=""
                        className="w-14 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {clip.metadata.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {clip.duration}s • Score: {clip.score.overallScore}/100
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/clips/${clip.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors flex-shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-5">
          <ActivityFeed events={activityEvents} maxItems={5} />
        </div>
      </div>
    </div>
  );
}
