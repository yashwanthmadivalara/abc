'use client';

import React, { useState } from 'react';
import {
  Tv,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DestinationChannel } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function DestinationChannelsPage() {
  const { destinationChannels, connectDestinationChannel, disconnectDestinationChannel } = useApp();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [channelNameInput, setChannelNameInput] = useState('');
  const [channelToDisconnect, setChannelToDisconnect] = useState<DestinationChannel | null>(null);

  const handleSimulatedConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelNameInput.trim()) return;

    connectDestinationChannel(channelNameInput.trim());
    setChannelNameInput('');
    setIsConnectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My YouTube Channels (Destination)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage target YouTube accounts where generated Shorts and schedules are uploaded.
          </p>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Connect YouTube Channel
        </button>
      </div>

      {/* Security & OAuth Transparency Callout */}
      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">OAuth 2.0 Security Architecture</h4>
            <p className="text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Google OAuth tokens, client secrets, and refresh credentials are stored server-side only in encrypted vaults. The frontend never accesses or caches raw tokens.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 font-semibold border border-slate-700 flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          Zero Token Exposure
        </span>
      </div>

      {/* Connected Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {destinationChannels.map((channel) => (
          <div
            key={channel.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={channel.profileImageUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{channel.channelName}</h4>
                      {channel.isPrimary && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{channel.customUrl || '@ShortsChannel'}</span>
                  </div>
                </div>

                <StatusBadge status={channel.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Subscribers</span>
                  <span className="font-semibold text-slate-800">{formatNumber(channel.subscriberCount)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Daily API Quota</span>
                  <span className="font-semibold text-slate-800">{channel.quotaUsedPercent}% used</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Connected {channel.connectedAt || 'Recently'}
              </span>

              <button
                onClick={() => setChannelToDisconnect(channel)}
                className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connect Channel Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Connect YouTube Shorts Channel"
        description="Requires YouTube Data API v3 scope 'https://www.googleapis.com/auth/youtube.upload'"
      >
        <form onSubmit={handleSimulatedConnect} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <strong>OAuth 2.0 Notice:</strong> In a production environment, clicking &quot;Authenticate with Google&quot; initiates the secure Google consent screen. For this frontend validation build, entering a channel handle creates an API-ready destination profile.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              YouTube Channel Name or Brand *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI Fast Forward Shorts"
              value={channelNameInput}
              onChange={(e) => setChannelNameInput(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              Authenticate & Connect
            </button>
          </div>
        </form>
      </Modal>

      {/* Disconnect confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(channelToDisconnect)}
        onClose={() => setChannelToDisconnect(null)}
        onConfirm={() => {
          if (channelToDisconnect) {
            disconnectDestinationChannel(channelToDisconnect.id);
          }
        }}
        title="Disconnect YouTube Channel"
        message={`Are you sure you want to disconnect "${channelToDisconnect?.channelName}"? Pending scheduled uploads assigned to this channel will be paused.`}
        confirmText="Disconnect Account"
        isDestructive={true}
      />
    </div>
  );
}
