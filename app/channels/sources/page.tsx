'use client';

import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Search,
  Sparkles,
  Download,
  Film,
  X,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNumber } from '@/lib/utils';
import { SourceChannel, YouTubeVideoItem } from '@/types';

export default function SourceChannelsPage() {
  const {
    sourceChannels,
    addSourceChannel,
    toggleSourceChannel,
    deleteSourceChannel,
    importVideoFromChannel,
  } = useApp();

  const [channelInput, setChannelInput] = useState('');
  const [frequency, setFrequency] = useState<'15m' | '30m' | '1h' | '6h' | '24h'>('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected channel to view uploaded videos
  const [selectedChannel, setSelectedChannel] = useState<SourceChannel | null>(null);
  const [channelToDelete, setChannelToDelete] = useState<SourceChannel | null>(null);
  const [importedVideoIds, setImportedVideoIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleFetchAndAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const input = channelInput.trim();
    if (!input) {
      setErrorMessage('Please enter a YouTube channel URL, handle (e.g. @veritasium), or Channel ID.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/youtube/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resolve YouTube channel.');
      }

      const ytChannel = data.channel;

      const result = addSourceChannel({
        name: ytChannel.name,
        url: ytChannel.channelUrl,
        channelId: ytChannel.channelId,
        handle: ytChannel.handle,
        thumbnailUrl: ytChannel.thumbnailUrl,
        subscriberCount: ytChannel.subscriberCount,
        frequency,
        uploadedVideos: ytChannel.uploadedVideos || [],
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Channel is already added.');
      } else {
        setSuccessMessage(`Successfully connected "${ytChannel.name}" with ${ytChannel.uploadedVideos?.length || 0} recent videos!`);
        setChannelInput('');
        // Automatically select newly added channel to show its videos immediately
        const newChanObj: SourceChannel = {
          id: `src-${Date.now()}`,
          name: ytChannel.name,
          handle: ytChannel.handle,
          channelUrl: ytChannel.channelUrl,
          channelId: ytChannel.channelId,
          thumbnailUrl: ytChannel.thumbnailUrl,
          subscriberCount: ytChannel.subscriberCount,
          isEnabled: true,
          monitoringFrequency: frequency,
          lastCheckedAt: 'Just now',
          lastUploadedAt: ytChannel.uploadedVideos?.[0]?.publishedAt || 'Recently',
          detectedVideosCount: ytChannel.uploadedVideos?.length || 0,
          createdAt: new Date().toISOString().split('T')[0],
          uploadedVideos: ytChannel.uploadedVideos || [],
        };
        setSelectedChannel(newChanObj);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while fetching the YouTube channel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportVideo = (video: YouTubeVideoItem) => {
    if (!selectedChannel) return;
    importVideoFromChannel(selectedChannel, video);
    setImportedVideoIds((prev) => new Set(prev).add(video.videoId));
  };

  const filteredChannels = sourceChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.handle && c.handle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.channelUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Source Channels</h2>
        <p className="text-xs text-slate-500 mt-1">
          Connect real-time YouTube channels to inspect uploads, monitor releases, and import videos for Shorts extraction.
        </p>
      </div>

      {/* Add Real-time Channel Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Connect Live YouTube Channel
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Enter any YouTube URL (e.g. <code>https://youtube.com/@veritasium</code>), handle (e.g. <code>@mkbhd</code>), or Channel ID to fetch live uploads in real-time.
        </p>

        <form onSubmit={handleFetchAndAddChannel} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. https://youtube.com/@veritasium or @hubermanlab"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                disabled={isLoading}
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 disabled:bg-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                disabled={isLoading}
                className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
                title="Polling frequency"
              >
                <option value="15m">Check every 15m</option>
                <option value="30m">Check every 30m</option>
                <option value="1h">Check every 1h</option>
                <option value="6h">Check every 6h</option>
                <option value="24h">Check every 24h</option>
              </select>

              <button
                type="submit"
                disabled={isLoading || !channelInput.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Fetching Live Channel...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Fetch & Connect
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </form>
      </div>

      {/* Main Channels & Uploaded Videos Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Monitored Channels List */}
        <div className={`space-y-4 ${selectedChannel ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Monitored Channels ({sourceChannels.length})
              </h3>

              {sourceChannels.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 w-36 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {sourceChannels.length === 0 ? (
              <EmptyState
                icon={Radio}
                title="No YouTube Channels Added Yet"
                description="Enter a YouTube channel URL or handle above to connect a channel in real-time."
              />
            ) : filteredChannels.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No matching channels found.</p>
            ) : (
              <div className="space-y-3">
                {filteredChannels.map((channel) => {
                  const isSelected = selectedChannel?.channelId === channel.channelId;
                  const videoCount = channel.uploadedVideos?.length || channel.detectedVideosCount || 0;

                  return (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={channel.thumbnailUrl}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {channel.name}
                              </h4>
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              <span>{channel.handle || '@channel'}</span>
                              <span>•</span>
                              <span>{formatNumber(channel.subscriberCount)} subs</span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleSourceChannel(channel.id)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              channel.isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                            title={channel.isEnabled ? 'Monitoring Active' : 'Monitoring Paused'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                channel.isEnabled ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => setChannelToDelete(channel)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove channel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium text-blue-600">
                          <Film className="w-3.5 h-3.5" />
                          {videoCount} uploaded videos
                        </span>
                        <span className="text-slate-400">Click to view videos →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-Time Uploaded Videos Viewer */}
        {selectedChannel && (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedChannel.thumbnailUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{selectedChannel.name}</h3>
                    <a
                      href={selectedChannel.channelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-600"
                      title="Open channel on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-500">
                    Latest Uploaded Videos ({selectedChannel.uploadedVideos?.length || 0})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedChannel(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                title="Close video list"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video List */}
            {!selectedChannel.uploadedVideos || selectedChannel.uploadedVideos.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Film className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No uploaded videos retrieved yet</p>
                <p className="text-[11px] text-slate-400">YouTube RSS feed may be updating or channel has no public uploads.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                {selectedChannel.uploadedVideos.map((video) => {
                  const isImported = importedVideoIds.has(video.videoId);

                  return (
                    <div
                      key={video.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="relative w-28 h-18 aspect-video bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                          <img
                            src={video.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={video.watchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors group"
                            title="Watch video on YouTube"
                          >
                            <Play className="w-6 h-6 text-white/90 fill-white/80 group-hover:scale-110 transition-transform" />
                          </a>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {video.publishedAt}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <a
                          href={video.watchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          YouTube
                        </a>

                        <button
                          onClick={() => handleImportVideo(video)}
                          disabled={isImported}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                            isImported
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isImported ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Imported
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              Import to Library
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Removal */}
      <ConfirmDialog
        isOpen={Boolean(channelToDelete)}
        onClose={() => setChannelToDelete(null)}
        onConfirm={() => {
          if (channelToDelete) {
            deleteSourceChannel(channelToDelete.id);
            if (selectedChannel?.id === channelToDelete.id) {
              setSelectedChannel(null);
            }
          }
        }}
        title="Remove Monitored Channel"
        message={`Are you sure you want to remove "${channelToDelete?.name}"? Future video uploads will no longer be tracked.`}
        confirmText="Remove Channel"
        isDestructive={true}
      />
    </div>
  );
}
