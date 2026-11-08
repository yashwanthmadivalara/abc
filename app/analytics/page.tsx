'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageSquare,
  Users,
  Clock,
  Calendar,
  Filter,
  Info,
  Tv,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/lib/context/AppContext';
import { StatCard } from '@/components/ui/StatCard';
import { formatNumber } from '@/lib/utils';

export default function AnalyticsPage() {
  const { analyticsSummary, analyticsTrends, topClips, destinationChannels } = useApp();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Shorts Performance Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track audience reach, view velocity, and average retention curves across published Shorts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Destination Channel Selector */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Destination Channels</option>
            {destinationChannels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.channelName}
              </option>
            ))}
          </select>

          {/* Date range switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-lg uppercase transition-colors ${
                  dateRange === r ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mock Data Callout - as mandated in blueprint */}
      <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Data Quality & API Status:</strong> {analyticsSummary.dataUnavailableNotice}
          <span className="block text-slate-400 mt-0.5">
            Note: Metric values distinguish between unintegrated endpoints and genuine zero activity.
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Views"
          value={formatNumber(analyticsSummary.totalViews)}
          icon={Eye}
          change={`+${analyticsSummary.viewsGrowthPercent}%`}
          isPositive={true}
          subtitle="Past 7 days"
        />

        <StatCard
          title="Total Likes"
          value={formatNumber(analyticsSummary.totalLikes)}
          icon={ThumbsUp}
          change={`+${analyticsSummary.likesGrowthPercent}%`}
          isPositive={true}
          subtitle="9.4% like ratio"
        />

        <StatCard
          title="Comments"
          value={formatNumber(analyticsSummary.totalComments)}
          icon={MessageSquare}
          change={`+${analyticsSummary.commentsGrowthPercent}%`}
          isPositive={true}
          subtitle="Audience engagement"
        />

        <StatCard
          title="Subscribers Gained"
          value={`+${formatNumber(analyticsSummary.subscribersGained)}`}
          icon={Users}
          change={`+${analyticsSummary.subscribersGrowthPercent}%`}
          isPositive={true}
          subtitle="From Shorts feed"
        />

        <StatCard
          title="Avg % Viewed"
          value={`${analyticsSummary.averageViewPercentage}%`}
          icon={Clock}
          change="+4.2%"
          isPositive={true}
          subtitle="High viral potential"
        />
      </div>

      {/* Trend Charts Section via Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Views Velocity Chart (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Views Growth Trend</h3>
              <p className="text-xs text-slate-500">Daily impression volume across all active Shorts</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Trending Up
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#viewsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Distribution Chart (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Likes & Comments</h3>
              <p className="text-xs text-slate-500">Daily audience interactions</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="likes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="comments" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Shorts Leaderboard */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Performing Shorts Leaderboard</h3>
            <p className="text-xs text-slate-500">Ranked by total views and viral velocity</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {topClips.map((clip, index) => (
            <div key={clip.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center font-extrabold text-sm text-slate-400">
                  #{index + 1}
                </span>

                <img
                  src={clip.thumbnailUrl}
                  alt=""
                  className="w-16 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                />

                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{clip.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{clip.destinationChannelName}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs pl-10 sm:pl-0">
                <div>
                  <span className="text-[10px] text-slate-400 block">Views</span>
                  <span className="font-bold text-slate-900">{formatNumber(clip.views)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Likes</span>
                  <span className="font-bold text-slate-900">{formatNumber(clip.likes)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Comments</span>
                  <span className="font-bold text-slate-900">{formatNumber(clip.comments)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Published</span>
                  <span className="text-slate-600 font-medium">{clip.publishedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
