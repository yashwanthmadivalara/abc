'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Upload,
  Search,
  Filter,
  Play,
  Scissors,
  Calendar,
  AlertCircle,
  ExternalLink,
  Layers,
  CheckCircle2,
  Send,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatBytes, formatDuration } from '@/lib/utils';
import { LibraryCategory, VideoAsset } from '@/types';

export default function VideoLibraryPage() {
  const { videos, clips } = useApp();
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories: { key: LibraryCategory | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All Items', count: videos.length },
    { key: 'imported', label: 'Imported Videos', count: videos.filter((v) => v.category === 'imported').length },
    { key: 'processing', label: 'Processing', count: videos.filter((v) => v.category === 'processing').length },
    { key: 'extracted', label: 'Extracted Clips', count: videos.filter((v) => v.category === 'extracted').length },
    { key: 'pending_approval', label: 'Pending Approval', count: videos.filter((v) => v.category === 'pending_approval').length },
    { key: 'scheduled', label: 'Scheduled', count: videos.filter((v) => v.category === 'scheduled').length },
    { key: 'published', label: 'Published', count: videos.filter((v) => v.category === 'published').length },
    { key: 'failed', label: 'Failed', count: videos.filter((v) => v.category === 'failed').length },
  ];

  const filteredVideos = videos.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sourceChannelName && item.sourceChannelName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Video Asset Library</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track authorized long-form source recordings and inspect candidate short pipelines.
          </p>
        </div>

        <Link
          href="/library/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Source Videos
        </Link>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
          {categories.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === tab.key ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Layout toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, filename, or source channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Showing {filteredVideos.length} items</span>
          </div>
        </div>
      </div>

      {/* Content Display */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          icon={Film}
          title={`No ${activeCategory === 'all' ? '' : activeCategory} items found`}
          description={
            searchQuery
              ? 'Try modifying your search keywords to find matching media.'
              : 'Upload an authorized video file or wait for the source crawler to detect new content.'
          }
          actionLabel="Upload Media"
          onAction={() => window.location.assign('/library/upload')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <StatusBadge status={video.category} />
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-mono">
                    {formatDuration(video.durationSeconds)}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    {video.sourceChannelName && (
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {video.sourceChannelName}
                      </span>
                    )}
                    <span>{video.resolution}</span>
                    <span>•</span>
                    <span>{formatBytes(video.fileSizeBytes)}</span>
                  </div>

                  {video.processingStage && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800">
                      <span className="font-medium">{video.processingStage}</span>
                    </div>
                  )}

                  {video.errorMessage && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{video.errorMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{video.createdAt}</span>

                {video.extractedClipsCount ? (
                  <Link
                    href="/clips"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    {video.extractedClipsCount} Shorts Ready
                  </Link>
                ) : (
                  <span className="text-slate-400 text-[11px]">Source File</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
