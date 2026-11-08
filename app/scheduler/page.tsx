'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { VisibilityMode, ScheduledPost } from '@/types';

export default function SchedulerPage() {
  const {
    scheduledPosts,
    clips,
    destinationChannels,
    scheduleRule,
    scheduleClip,
    deleteScheduledPost,
  } = useApp();

  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('week');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isQueuePaused, setIsQueuePaused] = useState(scheduleRule.isPaused);

  // New schedule form state
  const approvedClips = clips.filter((c) => c.approvalStatus === 'approved');
  const [selectedClipId, setSelectedClipId] = useState(approvedClips[0]?.id || '');
  const [targetDate, setTargetDate] = useState('2026-11-08');
  const [targetTime, setTargetTime] = useState('18:00');
  const [selectedDestinationId, setSelectedDestinationId] = useState(destinationChannels[0]?.id || '');
  const [visibility, setVisibility] = useState<VisibilityMode>('public');

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClipId || !targetDate || !targetTime) return;

    const scheduledIso = `${targetDate}T${targetTime}:00+05:30`;
    scheduleClip({
      clipId: selectedClipId,
      scheduledAt: scheduledIso,
      destinationChannelId: selectedDestinationId,
      visibility,
    });

    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Publishing Scheduler & Calendar</h2>
          <p className="text-xs text-slate-500 mt-1">
            Orchestrate automated YouTube release times aligned with peak audience engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQueuePaused(!isQueuePaused)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isQueuePaused
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            {isQueuePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isQueuePaused ? 'Resume Master Queue' : 'Pause All Publishing'}</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule a Short
          </button>
        </div>
      </div>

      {/* Rules & Timezone Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Target Timezone</span>
          <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Asia/Kolkata (IST / UTC+5:30)
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Daily Upload Cap</span>
          <span className="font-bold text-slate-800 mt-0.5 block">
            Max {scheduleRule.dailyUploadCap} Shorts / Day
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Min Spacing Interval</span>
          <span className="font-bold text-slate-800 mt-0.5 block">
            {scheduleRule.minimumIntervalHours} Hours Between Posts
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Queue Status</span>
          <span className={`font-bold mt-0.5 flex items-center gap-1 ${isQueuePaused ? 'text-amber-600' : 'text-emerald-600'}`}>
            <span className={`w-2 h-2 rounded-full ${isQueuePaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {isQueuePaused ? 'Master Queue Paused' : 'Automation Active'}
          </span>
        </div>
      </div>

      {/* Calendar & Upcoming Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Calendar View (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">November 2026</h3>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setCalendarView(v)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    calendarView === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid Representation */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="font-bold text-[11px] text-slate-400 pb-1">
                {d}
              </span>
            ))}

            {/* Simulated days for current active week */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((day) => {
              const hasPost = scheduledPosts.some(
                (p) => new Date(p.scheduledAt).getDate() === day
              );
              const isToday = day === 5;

              return (
                <div
                  key={day}
                  className={`min-h-16 p-2 rounded-2xl border text-left transition-all ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/30'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <span
                    className={`inline-block text-[11px] font-bold ${
                      isToday ? 'text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>

                  {hasPost && (
                    <div className="mt-1 p-1 bg-blue-600 text-white rounded-lg text-[9px] font-medium truncate shadow-sm">
                      🎬 Short Planned
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Upcoming Post Queue (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Upcoming Post Queue ({scheduledPosts.length})
            </h3>
            <span className="text-[11px] text-slate-400">Chronological</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {scheduledPosts.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No upcoming posts scheduled.</p>
            ) : (
              scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={post.thumbnailUrl}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{post.clipTitle}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Tv className="w-3 h-3 text-slate-400" />
                        {post.destinationChannelName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                        <span className="font-mono text-blue-600 font-semibold">
                          {new Date(post.scheduledAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span className="capitalize font-medium text-slate-600">{post.visibility}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <Link
                      href={`/publishing/${post.clipId}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Pre-Publish Checklist →
                    </Link>

                    <button
                      onClick={() => deleteScheduledPost(post.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Remove from schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule YouTube Short Release"
        description="Select an approved clip, release timestamp in IST, and target visibility"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Approved Clip *
            </label>
            <select
              value={selectedClipId}
              onChange={(e) => setSelectedClipId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              {approvedClips.length === 0 ? (
                <option value="">No approved clips available (Approve a clip first)</option>
              ) : (
                approvedClips.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.metadata.title} ({c.duration}s)
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time (IST) *</label>
              <input
                type="time"
                required
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination YouTube Channel *
            </label>
            <select
              value={selectedDestinationId}
              onChange={(e) => setSelectedDestinationId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              {destinationChannels.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.channelName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility Mode *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['public', 'unlisted', 'private'] as const).map((vis) => (
                <button
                  key={vis}
                  type="button"
                  onClick={() => setVisibility(vis)}
                  className={`py-2 text-xs font-semibold rounded-xl capitalize border ${
                    visibility === vis
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {vis}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedClipId}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-slate-300"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
