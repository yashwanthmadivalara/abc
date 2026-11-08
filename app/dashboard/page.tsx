'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Tv,
  Film,
  Scissors,
  CheckCircle2,
  Calendar,
  Send,
  AlertTriangle,
  Upload,
  ArrowUpRight,
  Clock,
  Play,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityFeed } from '@/components/ui/ActivityFeed';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const {
    uiState,
    setUiState,
    dashboardSummary,
    activityEvents,
    activeJobs,
    clips,
    scheduledPosts,
    retryJob,
  } = useApp();

  if (uiState === 'empty') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Welcome to ViralFlow AI 👋</h2>
          <p className="text-xs text-slate-500 mt-1">
            Your end-to-end automation suite for discovering long-form highlights and publishing viral YouTube Shorts.
          </p>
        </div>
        <EmptyState
          icon={Radio}
          title="No Channels or Videos Configured Yet"
          description="Start by adding a monitored source channel or uploading your authorized video files."
          actionLabel="Add Your First Source Channel"
          onAction={() => window.location.assign('/channels/sources')}
        />
      </div>
    );
  }

  const primaryJob = activeJobs[0];

  return (
    <div className="space-y-6">
      {/* Header Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Shorts Pipeline Online</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Automate Highlight Discovery & Short Publishing
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            ViralFlow AI continuously monitors authorized YouTube sources, transcribes dialog via Faster-Whisper, scores viral hooks via Qwen 2.5, reframes vertical video, and schedules releases.
          </p>

          {/* Quick Action Shortcuts */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/library/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/30"
            >
              <Upload className="w-4 h-4" />
              Upload Source Video
            </Link>

            <Link
              href="/approvals"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors border border-white/10"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Review Pending Clips ({dashboardSummary.pendingApprovalsCount})
            </Link>

            <Link
              href="/scheduler"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors border border-white/10"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              Open Scheduler
            </Link>

            <Link
              href="/channels/sources"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors border border-white/10"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              Manage Channels
            </Link>
          </div>
        </div>
      </div>

      {/* 8 Primary Dashboard KPI Cards as requested in Blueprint */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            System & Pipeline Overview
          </h3>
          <span className="text-[11px] text-slate-400">
            Updated in real-time
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            title="Source Channels"
            value={`${dashboardSummary.activeChannelsCount} / ${dashboardSummary.sourceChannelsCount}`}
            icon={Radio}
            subtitle="Active / Total Monitored"
          />

          <StatCard
            title="Detected Videos"
            value={dashboardSummary.detectedVideosCount}
            icon={Film}
            subtitle="Cataloged in Library"
          />

          <StatCard
            title="Processing Jobs"
            value={dashboardSummary.processingJobsCount}
            icon={Layers}
            subtitle="Active workers"
          />

          <StatCard
            title="Generated Clips"
            value={dashboardSummary.generatedClipsCount}
            icon={Scissors}
            subtitle="Total candidate Shorts"
          />

          <StatCard
            title="Pending Approvals"
            value={dashboardSummary.pendingApprovalsCount}
            icon={CheckCircle2}
            subtitle="Ready for creator signoff"
            className={dashboardSummary.pendingApprovalsCount > 0 ? 'border-amber-300/80 bg-amber-50/20' : ''}
          />

          <StatCard
            title="Scheduled Posts"
            value={dashboardSummary.scheduledPostsCount}
            icon={Calendar}
            subtitle="In upcoming release queue"
          />

          <StatCard
            title="Published Shorts"
            value={dashboardSummary.publishedPostsCount}
            icon={Send}
            subtitle="Dispatched to YouTube"
          />

          <StatCard
            title="Job Failures"
            value={dashboardSummary.failedJobsCount}
            icon={AlertTriangle}
            subtitle="Requires user attention"
            className={dashboardSummary.failedJobsCount > 0 ? 'border-rose-200 bg-rose-50/20' : ''}
          />
        </div>
      </div>

      {/* Task Status & Live Processing Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Task / Pipeline Status Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  Active Execution Engine Status
                </h3>
              </div>
              <StatusBadge status="running" />
            </div>

            {primaryJob ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-1">
                  <span className="font-semibold text-slate-900">{primaryJob.taskName}</span>
                  <span className="text-slate-400">Task ID: {primaryJob.id}</span>
                </div>

                <ProgressBar
                  progress={primaryJob.progress}
                  stage={primaryJob.currentStage}
                  color="blue"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Started</span>
                    <span className="font-medium text-slate-700">{primaryJob.startedAt}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Last Run</span>
                    <span className="font-medium text-slate-700">{primaryJob.lastRun}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Next Cycle</span>
                    <span className="font-medium text-slate-700">{primaryJob.nextRun}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Worker</span>
                    <span className="font-medium text-slate-700 truncate block">Local GPU (CUDA)</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400 text-center py-4">
                No jobs currently executing. Workers idle.
              </p>
            )}
          </div>

          {/* Pending Approval Highlight List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending Creator Approvals</h3>
                <p className="text-xs text-slate-500">Clips awaiting manual review before scheduling</p>
              </div>
              <Link
                href="/approvals"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All ({dashboardSummary.pendingApprovalsCount})
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {clips
                .filter((c) => c.approvalStatus === 'needs_review')
                .slice(0, 2)
                .map((clip) => (
                  <div
                    key={clip.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={clip.thumbnailUrl}
                        alt=""
                        className="w-16 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {clip.metadata.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>{clip.duration}s</span>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">
                            Score: {clip.score.overallScore}/100 (Heuristic)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/clips/${clip.id}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
                      >
                        Review in Studio
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-6">
          <ActivityFeed events={activityEvents} maxItems={6} />
        </div>
      </div>
    </div>
  );
}
