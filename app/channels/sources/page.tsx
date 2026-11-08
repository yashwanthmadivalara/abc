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
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNumber } from '@/lib/utils';
import { SourceChannel } from '@/types';

export default function SourceChannelsPage() {
  const {
    sourceChannels,
    addSourceChannel,
    toggleSourceChannel,
    deleteSourceChannel,
    uiState,
  } = useApp();

  const [channelUrl, setChannelUrl] = useState('');
  const [channelName, setChannelName] = useState('');
  const [frequency, setFrequency] = useState<'15m' | '30m' | '1h' | '6h' | '24h'>('1h');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal / Confirm state
  const [channelToDelete, setChannelToDelete] = useState<SourceChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!channelUrl.trim()) {
      setErrorMessage('Please enter a valid YouTube channel URL or channel ID.');
      return;
    }

    const derivedName = channelName.trim() || channelUrl.replace(/https?:\/\/(www\.)?youtube\.com\/@?/, '').split('/')[0] || 'Monitored Channel';

    setIsSubmitting(true);
    setTimeout(() => {
      const result = addSourceChannel({
        name: derivedName,
        url: channelUrl,
        frequency,
      });

      setIsSubmitting(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to add channel.');
      } else {
        setSuccessMessage(`Successfully added "${derivedName}" to monitored sources.`);
        setChannelUrl('');
        setChannelName('');
      }
    }, 400);
  };

  const filteredChannels = sourceChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.channelUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Monitored Source Channels</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated polling intervals for long-form podcasts, lectures, and authorized content feeds.
          </p>
        </div>
      </div>

      {/* Add Channel Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Add Monitored YouTube Channel
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Enter a YouTube handle (e.g. <code>@hubermanlab</code>), channel URL, or unique Channel ID.
        </p>

        <form onSubmit={handleAddChannel} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Channel URL or Channel ID *
              </label>
              <input
                type="text"
                placeholder="https://youtube.com/@channelname or UC_x5XG1OV2P6uZZ5FSM9Ttw"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Custom Nickname"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Check Frequency:</span>
              <div className="flex items-center gap-1">
                {(['15m', '30m', '1h', '6h', '24h'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      frequency === freq
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Validating Channel...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add Channel
                </>
              )}
            </button>
          </div>

          {/* Feedback alerts */}
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

      {/* Channel List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Active Monitored Feeds ({sourceChannels.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search channel name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>

        {filteredChannels.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No Matching Channels Found"
            description="Try adjusting your search query or add a new channel using the form above."
            className="mt-4"
          />
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={channel.thumbnailUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {channel.name}
                      </h4>
                      <a
                        href={channel.channelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600"
                        title="View on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span>{formatNumber(channel.subscriberCount)} subscribers</span>
                      <span>•</span>
                      <span>Frequency: <strong>{channel.monitoringFrequency}</strong></span>
                      <span>•</span>
                      <span>Detected: <strong>{channel.detectedVideosCount} videos</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-slate-400 block">Last checked</span>
                    <span className="font-medium text-slate-700">{channel.lastCheckedAt}</span>
                  </div>

                  {/* Enable / Disable Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      {channel.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSourceChannel(channel.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        channel.isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={channel.isEnabled}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          channel.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setChannelToDelete(channel)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove channel from monitoring"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
          }
        }}
        title="Remove Monitored Channel"
        message={`Are you sure you want to remove "${channelToDelete?.name}"? Future video uploads will no longer be tracked or detected automatically.`}
        confirmText="Remove Channel"
        isDestructive={true}
      />
    </div>
  );
}
