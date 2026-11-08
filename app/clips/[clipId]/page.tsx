'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
  Save,
  HelpCircle,
  Maximize2,
  Type,
  Layers,
  Settings2,
  Share2,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  AspectRatioMode,
  FramingMode,
  SubtitleStyle,
  ClipMetadata,
} from '@/types';

export default function ClipStudioPage() {
  const params = useParams();
  const router = useRouter();
  const clipId = params?.clipId as string;
  const { clips, updateClip, approveClip, rejectClip, deleteClip } = useApp();

  const clip = clips.find((c) => c.id === clipId);

  // Local editable state for form
  const [title, setTitle] = useState(clip?.metadata.title || '');
  const [description, setDescription] = useState(clip?.metadata.description || '');
  const [hashtags, setHashtags] = useState(clip?.metadata.hashtags.join(' ') || '');
  const [category, setCategory] = useState(clip?.metadata.category || 'Science & Technology');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>(clip?.aspectRatio || '9:16');
  const [framing, setFraming] = useState<FramingMode>(clip?.framing || 'background_blur');
  const [durationPreset, setDurationPreset] = useState<number>(clip?.duration || 45);
  const [startTime, setStartTime] = useState<number>(clip?.startTime || 0);
  const [endTime, setEndTime] = useState<number>(clip?.endTime || 45);
  
  // Subtitle styling state
  const [fontFamily, setFontFamily] = useState(clip?.subtitleStyle.fontFamily || 'Montserrat');
  const [fontSize, setFontSize] = useState(clip?.subtitleStyle.fontSize || 32);
  const [highlightColor, setHighlightColor] = useState(clip?.subtitleStyle.highlightColor || '#FACC15');
  const [position, setPosition] = useState<'top' | 'middle' | 'bottom'>(clip?.subtitleStyle.position || 'bottom');
  const [uppercase, setUppercase] = useState(clip?.subtitleStyle.uppercase ?? true);

  // Player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // UI tabs and modals
  const [activeTab, setActiveTab] = useState<'timing' | 'subtitles' | 'metadata' | 'framing'>('subtitles');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  // Sync initial data if clip loads
  useEffect(() => {
    if (clip) {
      setTitle(clip.metadata.title);
      setDescription(clip.metadata.description);
      setHashtags(clip.metadata.hashtags.join(' '));
      setCategory(clip.metadata.category);
      setAspectRatio(clip.aspectRatio);
      setFraming(clip.framing);
      setDurationPreset(clip.duration);
      setStartTime(clip.startTime);
      setEndTime(clip.endTime);
      setFontFamily(clip.subtitleStyle.fontFamily);
      setFontSize(clip.subtitleStyle.fontSize);
      setHighlightColor(clip.subtitleStyle.highlightColor);
      setPosition(clip.subtitleStyle.position);
      setUppercase(clip.subtitleStyle.uppercase);
    }
  }, [clip]);

  if (!clip) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Clip not found</h3>
        <p className="text-xs text-slate-500">The requested clip ID does not exist in the active session.</p>
        <Link
          href="/clips"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidate Clips
        </Link>
      </div>
    );
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSaveChanges = () => {
    const updatedSubtitleStyle: SubtitleStyle = {
      fontFamily: fontFamily as any,
      fontSize,
      primaryColor: '#FFFFFF',
      outlineColor: '#000000',
      outlineWidth: 4,
      position,
      highlightCurrentWord: true,
      highlightColor,
      uppercase,
    };

    const updatedMetadata: ClipMetadata = {
      title,
      description,
      hashtags: hashtags.split(' ').filter((t) => t.trim().length > 0),
      keywords: clip.metadata.keywords,
      category,
    };

    updateClip(clip.id, {
      aspectRatio,
      framing,
      duration: endTime - startTime,
      startTime,
      endTime,
      subtitleStyle: updatedSubtitleStyle,
      metadata: updatedMetadata,
    });

    setHasUnsavedChanges(false);
    setIsSaveSuccess(true);
    setTimeout(() => setIsSaveSuccess(false), 2500);
  };

  const handleApprove = () => {
    approveClip(clip.id);
    router.push('/approvals');
  };

  const handleReject = () => {
    rejectClip(clip.id);
    router.push('/clips');
  };

  const handleDelete = () => {
    deleteClip(clip.id);
    router.push('/clips');
  };

  // Find active subtitle text for current playback timestamp
  const activeSubtitle = clip.subtitles.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  ) || clip.subtitles[0];

  return (
    <div className="space-y-6">
      {/* Top action breadcrumb & status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/clips"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to Clips List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 truncate max-w-lg">
                {title || clip.metadata.title}
              </h2>
              <StatusBadge status={clip.approvalStatus} />
            </div>
            <p className="text-[11px] text-slate-500">
              Source: <span className="font-semibold text-slate-700">{clip.sourceVideoTitle}</span> ({clip.sourceChannelName})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasUnsavedChanges && (
            <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-medium">
              Unsaved changes
            </span>
          )}

          <button
            onClick={handleSaveChanges}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>

          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Clip
          </button>

          <button
            onClick={handleReject}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>

          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Delete candidate clip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSaveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Clip settings and subtitle typography successfully updated.</span>
        </div>
      )}

      {/* Two-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Video Preview Player & Heuristic Score (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 9:16 Vertical Phone Simulator Player */}
          <div className="bg-slate-950 rounded-3xl p-3 border-4 border-slate-800 shadow-2xl relative max-w-sm mx-auto">
            {/* Phone Notch/Speaker Indicator */}
            <div className="w-20 h-1.5 bg-slate-800 rounded-full mx-auto mb-3" />

            <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={clip.videoPreviewUrl}
                onTimeUpdate={handleTimeUpdate}
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Subtitle Overlay Live Preview */}
              <div
                className={`absolute left-4 right-4 text-center pointer-events-none transition-all ${
                  position === 'top'
                    ? 'top-8'
                    : position === 'middle'
                    ? 'top-1/2 -translate-y-1/2'
                    : 'bottom-12'
                }`}
              >
                <div
                  className="font-extrabold tracking-wide leading-tight px-3 py-1.5 rounded-lg inline-block shadow-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: '#FFFFFF',
                    WebkitTextStroke: '2px black',
                    textTransform: uppercase ? 'uppercase' : 'none',
                  }}
                >
                  {activeSubtitle?.text || 'SAMPLE SUBTITLE PREVIEW'}
                </div>
              </div>

              {/* Video Play/Pause Touch Overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                )}
              </button>
            </div>

            {/* Compact Video Controls Bar */}
            <div className="mt-3 px-2 py-1 space-y-2 text-white text-xs">
              <input
                type="range"
                min="0"
                max={clip.duration}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay} className="text-white hover:text-blue-400">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="font-mono">
                    {currentTime.toFixed(1)}s / {clip.duration}s
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 font-medium">Vertical 1080×1920 (9:16)</span>
              </div>
            </div>
          </div>

          {/* Heuristic Virality Score Breakdown Card (Specified in Blueprint) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Initial Heuristic Score: {clip.score.overallScore}/100
                </h4>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                AI Heuristic
              </span>
            </div>

            {/* Score Factors Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Opening Hook (25%):</span>
                <span className="font-bold text-slate-900">{clip.score.openingHook}/100</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Interesting Content (25%):</span>
                <span className="font-bold text-slate-900">{clip.score.interestingContent}/100</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Context & Completeness (20%):</span>
                <span className="font-bold text-slate-900">{clip.score.contextAndCompleteness}/100</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Emotional Engagement (15%):</span>
                <span className="font-bold text-slate-900">{clip.score.emotionalEngagement}/100</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Pacing & Energy (15%):</span>
                <span className="font-bold text-slate-900">{clip.score.pacing}/100</span>
              </div>
            </div>

            {/* Explicit Virality Guarantee Disclaimer (Mandated in Blueprint) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Heuristic Disclaimer:</strong> This score represents an automated linguistic and pacing evaluation. It is an algorithmic heuristic and does not guarantee distribution, impression velocity, or virality on YouTube.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Tab Editing Suite (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            {[
              { id: 'subtitles', label: 'Subtitles & Style', icon: Type },
              { id: 'metadata', label: 'Title & SEO Metadata', icon: Layers },
              { id: 'timing', label: 'Timing & Duration', icon: Settings2 },
              { id: 'framing', label: 'Framing & Aspect', icon: Maximize2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subtitles & Styling Panel */}
          {activeTab === 'subtitles' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value as any);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Montserrat">Montserrat (Modern Clean)</option>
                    <option value="Impact">Impact (Bold Meme Style)</option>
                    <option value="Inter">Inter (Minimalist)</option>
                    <option value="Roboto">Roboto (Classic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Font Size ({fontSize}px)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(parseInt(e.target.value));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position On-Screen
                  </label>
                  <div className="flex items-center gap-1">
                    {(['top', 'middle', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => {
                          setPosition(pos);
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize border ${
                          position === pos
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Word Highlight Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => {
                        setHighlightColor(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600">{highlightColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Text Transform
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUppercase(!uppercase);
                      setHasUnsavedChanges(true);
                    }}
                    className={`w-full py-1.5 text-xs font-medium rounded-lg border ${
                      uppercase
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {uppercase ? 'ALL CAPS' : 'Sentence case'}
                  </button>
                </div>
              </div>

              {/* Subtitle Dialogue Transcript Table */}
              <div>
                <h5 className="text-xs font-semibold text-slate-700 mb-2">
                  Recognized Dialogue Segments (Faster-Whisper)
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {clip.subtitles.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between gap-3"
                    >
                      <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">
                        {sub.start.toFixed(1)}s - {sub.end.toFixed(1)}s
                      </span>
                      <p className="font-medium text-slate-800 truncate flex-1">{sub.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metadata & SEO Form Panel */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Short Title *</label>
                  <span className="text-[11px] text-slate-400">{title.length} / 100 characters</span>
                </div>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hashtags (Space separated)</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => {
                    setHashtags(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Science & Technology">Science & Technology</option>
                  <option value="Education">Education</option>
                  <option value="People & Blogs">People & Blogs</option>
                  <option value="News & Politics">News & Politics</option>
                </select>
              </div>
            </div>
          )}

          {/* Timing & Duration Preset Panel */}
          {activeTab === 'timing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Duration Preset Length
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        setDurationPreset(sec);
                        setEndTime(startTime + sec);
                        setHasUnsavedChanges(true);
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                        durationPreset === sec
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sec} Seconds
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Offset (Seconds)
                  </label>
                  <input
                    type="number"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(parseFloat(e.target.value));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Offset (Seconds)
                  </label>
                  <input
                    type="number"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(parseFloat(e.target.value));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Framing & Crop Panel */}
          {activeTab === 'framing' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                Vertical Crop Strategy
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'background_blur',
                    name: 'Background Blur',
                    desc: 'Preserves horizontal aspect with blurred ambient letterboxing above and below.',
                  },
                  {
                    id: 'face_focus',
                    name: 'Face-Focused Crop',
                    desc: 'AI detects active speaker face bounds and pans horizontally.',
                  },
                  {
                    id: 'center_crop',
                    name: 'Center Crop',
                    desc: 'Crops direct 9:16 center slice from source horizontal frame.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setFraming(item.id as any);
                      setHasUnsavedChanges(true);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      framing === item.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <h5 className="font-bold text-xs text-slate-900">{item.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Candidate Short"
        message="Are you sure you want to delete this clip? The rendered video file and subtitle timing cache will be removed."
        confirmText="Delete Clip"
        isDestructive={true}
      />
    </div>
  );
}
