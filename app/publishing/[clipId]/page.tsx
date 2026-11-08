'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Tv,
  Film,
  Sparkles,
  Copy,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PublishStatus, VisibilityMode } from '@/types';

export default function PrePublishReviewPage() {
  const params = useParams();
  const clipId = params?.clipId as string;
  const { clips, destinationChannels } = useApp();

  const clip = clips.find((c) => c.id === clipId) || clips[0];

  const [visibility, setVisibility] = useState<VisibilityMode>('public');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(clip?.publishStatus || 'draft');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [returnedVideoId, setReturnedVideoId] = useState<string | null>(clip?.youtubeVideoId || null);
  const [copied, setCopied] = useState(false);

  if (!clip) {
    return (
      <div className="text-center py-16">
        <p className="text-xs text-slate-500">No clip specified for publishing review.</p>
        <Link href="/scheduler" className="text-xs text-blue-600 font-semibold mt-2 inline-block">
          Return to Scheduler
        </Link>
      </div>
    );
  }

  const handleSimulatedPublish = () => {
    setPublishStatus('uploading');
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(100);
            setPublishStatus('published');
            setReturnedVideoId('xV9_dK7P0qM');
          }, 800);
          return 90;
        }
        return prev + 25;
      });
    }, 400);
  };

  const copyUrl = () => {
    if (returnedVideoId) {
      navigator.clipboard.writeText(`https://youtube.com/shorts/${returnedVideoId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/scheduler"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Back to Scheduler"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pre-Publish Review & Dispatch</h2>
          <p className="text-xs text-slate-500">
            Verify video package rendering, metadata tags, and target YouTube credentials.
          </p>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pre-Flight Validation Checklist</h3>
            <p className="text-xs text-slate-500">All checks must pass before dispatch to YouTube Data API</p>
          </div>
          <StatusBadge status={publishStatus} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Vertical Video Rendered</p>
              <p className="text-[11px] text-emerald-700">1080×1920 @ 60fps NVENC H.264</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Subtitles Burned In</p>
              <p className="text-[11px] text-emerald-700">{clip.subtitleStyle.fontFamily} font with karaoke highlights</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Creator Manual Signoff</p>
              <p className="text-[11px] text-emerald-700">Approved by user (Human-in-the-loop)</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center gap-3">
            <Tv className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-blue-900">Destination Account Linked</p>
              <p className="text-[11px] text-blue-700">Primary YouTube channel authenticated</p>
            </div>
          </div>
        </div>

        {/* Video & Metadata Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row gap-5 items-start">
          <img
            src={clip.thumbnailUrl}
            alt=""
            className="w-36 h-48 object-cover rounded-xl border border-slate-200 flex-shrink-0 shadow-sm"
          />

          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Title to Publish</span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{clip.metadata.title}</h4>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Description</span>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{clip.metadata.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {clip.metadata.hashtags.map((tag) => (
                <span key={tag} className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Visibility Mode Selector */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Release Visibility</label>
              <div className="flex items-center gap-2">
                {(['public', 'unlisted', 'private'] as const).map((vis) => (
                  <button
                    key={vis}
                    type="button"
                    onClick={() => setVisibility(vis)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize border ${
                      visibility === vis
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {vis}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Publishing Progress or Result Card */}
        {publishStatus === 'uploading' && (
          <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Dispatching binary chunks to YouTube API...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <ProgressBar progress={uploadProgress} color="blue" />
          </div>
        )}

        {publishStatus === 'published' && returnedVideoId && (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Successfully Uploaded to YouTube Data API!</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-200 text-xs">
              <span className="font-mono text-slate-700 truncate">
                https://youtube.com/shorts/{returnedVideoId}
              </span>
              <button
                onClick={copyUrl}
                className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-medium flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            Timezone: <strong>Asia/Kolkata (IST)</strong>
          </span>

          {publishStatus !== 'published' ? (
            <button
              onClick={handleSimulatedPublish}
              disabled={publishStatus === 'uploading'}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Dispatch & Publish Now
            </button>
          ) : (
            <Link
              href="/analytics"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              View in Analytics →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
