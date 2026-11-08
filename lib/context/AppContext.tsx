'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DashboardSummary,
  ActivityEvent,
  JobSummary,
  SourceChannel,
  DestinationChannel,
  VideoAsset,
  Clip,
  ScheduledPost,
  ScheduleRule,
  AnalyticsSummary,
  AnalyticsPoint,
  TopClip,
  PipelineService,
  WorkerStatus,
  IntegrationHealth,
  UserPreferences,
  VisibilityMode,
  LibraryCategory,
} from '@/types';
import {
  initialDashboardSummary,
  initialActivityEvents,
  initialActiveJobs,
  initialSourceChannels,
  initialDestinationChannels,
  initialVideos,
  initialClips,
  initialScheduledPosts,
  initialScheduleRule,
  initialAnalyticsSummary,
  initialAnalyticsTrendPoints,
  initialTopClips,
  initialPipelineServices,
  initialWorkerStatus,
  initialIntegrationHealth,
  initialUserPreferences,
} from '@/lib/mock-data/fixtures';

export type UiDataState = 'populated' | 'empty' | 'loading' | 'error';

interface AppContextType {
  uiState: UiDataState;
  setUiState: (state: UiDataState) => void;
  dashboardSummary: DashboardSummary;
  activityEvents: ActivityEvent[];
  activeJobs: JobSummary[];
  sourceChannels: SourceChannel[];
  destinationChannels: DestinationChannel[];
  videos: VideoAsset[];
  clips: Clip[];
  scheduledPosts: ScheduledPost[];
  scheduleRule: ScheduleRule;
  analyticsSummary: AnalyticsSummary;
  analyticsTrends: AnalyticsPoint[];
  topClips: TopClip[];
  pipelineServices: PipelineService[];
  workerStatus: WorkerStatus;
  integrationHealth: IntegrationHealth[];
  userPreferences: UserPreferences;
  
  // Actions
  addSourceChannel: (channelData: {
    name: string;
    url: string;
    channelId?: string;
    handle?: string;
    thumbnailUrl?: string;
    subscriberCount?: number;
    frequency: '15m' | '30m' | '1h' | '6h' | '24h';
    uploadedVideos?: any[];
  }) => { success: boolean; error?: string };
  importVideoFromChannel: (channel: SourceChannel, video: any) => void;
  toggleSourceChannel: (id: string) => void;
  deleteSourceChannel: (id: string) => void;
  connectDestinationChannel: (name: string) => void;
  disconnectDestinationChannel: (id: string) => void;
  uploadSimulatedFiles: (files: { name: string; size: number }[]) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  approveClip: (id: string) => void;
  rejectClip: (id: string) => void;
  deleteClip: (id: string) => void;
  scheduleClip: (data: {
    clipId: string;
    scheduledAt: string;
    destinationChannelId: string;
    visibility: VisibilityMode;
  }) => void;
  deleteScheduledPost: (id: string) => void;
  togglePipelineService: (id: string) => void;
  testIntegration: (id: string) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  retryJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [uiState, setUiState] = useState<UiDataState>('populated');

  // Core state
  const [sourceChannels, setSourceChannels] = useState<SourceChannel[]>([]);
  const [destinationChannels, setDestinationChannels] = useState<DestinationChannel[]>(initialDestinationChannels);
  const [videos, setVideos] = useState<VideoAsset[]>(initialVideos);
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(initialScheduledPosts);
  const [scheduleRule, setScheduleRule] = useState<ScheduleRule>(initialScheduleRule);
  const [pipelineServices, setPipelineServices] = useState<PipelineService[]>(initialPipelineServices);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>(initialWorkerStatus);
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth[]>(initialIntegrationHealth);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialUserPreferences);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(initialActivityEvents);
  const [activeJobs, setActiveJobs] = useState<JobSummary[]>(initialActiveJobs);

  // Dynamic dashboard calculations derived from real state
  const dashboardSummary: DashboardSummary = {
    sourceChannelsCount: sourceChannels.length,
    activeChannelsCount: sourceChannels.filter((c) => c.isEnabled).length,
    detectedVideosCount: videos.length,
    processingJobsCount: activeJobs.filter((j) => j.status === 'running').length,
    generatedClipsCount: clips.length,
    pendingApprovalsCount: clips.filter((c) => c.approvalStatus === 'needs_review').length,
    scheduledPostsCount: scheduledPosts.length,
    publishedPostsCount: clips.filter((c) => c.publishStatus === 'published').length,
    failedJobsCount: videos.filter((v) => v.category === 'failed').length,
    isMockData: true,
  };

  // Actions
  const addSourceChannel = (data: {
    name: string;
    url: string;
    channelId?: string;
    handle?: string;
    thumbnailUrl?: string;
    subscriberCount?: number;
    frequency: '15m' | '30m' | '1h' | '6h' | '24h';
    uploadedVideos?: any[];
  }) => {
    // Duplicate detection check
    const existing = sourceChannels.find(
      (c) =>
        (data.channelId && c.channelId === data.channelId) ||
        c.channelUrl.toLowerCase() === data.url.toLowerCase() ||
        c.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existing) {
      return { success: false, error: `Channel "${existing.name}" is already being monitored.` };
    }

    const newChannel: SourceChannel = {
      id: `src-${Date.now()}`,
      name: data.name,
      handle: data.handle,
      channelUrl: data.url,
      channelId: data.channelId || `UC_${Math.random().toString(36).substring(2, 12)}`,
      thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      subscriberCount: data.subscriberCount || 100000,
      isEnabled: true,
      monitoringFrequency: data.frequency,
      lastCheckedAt: 'Just now',
      lastUploadedAt: data.uploadedVideos?.[0]?.publishedAt || 'Recently',
      detectedVideosCount: data.uploadedVideos?.length || 0,
      createdAt: new Date().toISOString().split('T')[0],
      uploadedVideos: data.uploadedVideos || [],
    };

    setSourceChannels((prev) => [newChannel, ...prev]);
    setActivityEvents((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'detection',
        title: 'Real-time Channel Connected',
        description: `Imported channel "${data.name}" (${data.uploadedVideos?.length || 0} recent videos detected).`,
        timestamp: 'Just now',
        status: 'success',
      },
      ...prev,
    ]);

    return { success: true };
  };

  const importVideoFromChannel = (channel: SourceChannel, video: any) => {
    const existing = videos.find((v) => v.sourceUrl === video.watchUrl || v.title === video.title);
    if (existing) return;

    const newVideo: VideoAsset = {
      id: `vid-${Date.now()}`,
      title: video.title,
      sourceChannelId: channel.id,
      sourceChannelName: channel.name,
      sourceUrl: video.watchUrl,
      filename: `${video.videoId || 'yt'}.mp4`,
      durationSeconds: 720,
      resolution: '1080x1920 (Auto-Scale)',
      fileSizeBytes: 314572800,
      category: 'imported',
      thumbnailUrl: video.thumbnailUrl,
      createdAt: 'Just now',
    };

    setVideos((prev) => [newVideo, ...prev]);
    setActivityEvents((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'import',
        title: 'Video Imported from YouTube Channel',
        description: `Added "${video.title}" from ${channel.name} into Video Library.`,
        timestamp: 'Just now',
        status: 'success',
      },
      ...prev,
    ]);
  };

  const toggleSourceChannel = (id: string) => {
    setSourceChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isEnabled: !c.isEnabled } : c))
    );
  };

  const deleteSourceChannel = (id: string) => {
    setSourceChannels((prev) => prev.filter((c) => c.id !== id));
  };

  const connectDestinationChannel = (name: string) => {
    const newDest: DestinationChannel = {
      id: `dest-${Date.now()}`,
      channelName: name,
      customUrl: `@${name.replace(/\s+/g, '')}`,
      profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      connectionStatus: 'connected',
      subscriberCount: 1000,
      isPrimary: destinationChannels.length === 0,
      quotaUsedPercent: 5,
      connectedAt: new Date().toISOString().split('T')[0],
    };
    setDestinationChannels((prev) => [...prev, newDest]);
  };

  const disconnectDestinationChannel = (id: string) => {
    setDestinationChannels((prev) => prev.filter((c) => c.id !== id));
  };

  const uploadSimulatedFiles = (files: { name: string; size: number }[]) => {
    const newVideos: VideoAsset[] = files.map((f, i) => ({
      id: `vid-${Date.now()}-${i}`,
      title: f.name.replace(/\.[^/.]+$/, ''),
      filename: f.name,
      durationSeconds: 180,
      resolution: '1920x1080',
      fileSizeBytes: f.size,
      category: 'imported',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',
      createdAt: 'Just now',
    }));

    setVideos((prev) => [...newVideos, ...prev]);
    setActivityEvents((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'import',
        title: 'Video Uploaded to Library',
        description: `Imported ${files.length} file(s) for authorized processing.`,
        timestamp: 'Just now',
        status: 'success',
      },
      ...prev,
    ]);
  };

  const updateClip = (id: string, updates: Partial<Clip>) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const approveClip = (id: string) => {
    const clip = clips.find((c) => c.id === id);
    if (!clip) return;

    setClips((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, approvalStatus: 'approved' } : c
      )
    );

    setActivityEvents((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'approval',
        title: 'Clip Approved',
        description: `Approved "${clip.metadata.title}". Ready for scheduling.`,
        timestamp: 'Just now',
        clipId: id,
        status: 'success',
      },
      ...prev,
    ]);
  };

  const rejectClip = (id: string) => {
    setClips((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, approvalStatus: 'rejected' } : c
      )
    );
  };

  const deleteClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  const scheduleClip = (data: {
    clipId: string;
    scheduledAt: string;
    destinationChannelId: string;
    visibility: VisibilityMode;
  }) => {
    const clip = clips.find((c) => c.id === data.clipId);
    const dest = destinationChannels.find((d) => d.id === data.destinationChannelId);
    if (!clip) return;

    const newPost: ScheduledPost = {
      id: `sch-${Date.now()}`,
      clipId: clip.id,
      clipTitle: clip.metadata.title,
      thumbnailUrl: clip.thumbnailUrl,
      duration: clip.duration,
      destinationChannelId: data.destinationChannelId,
      destinationChannelName: dest?.channelName || 'Primary Destination',
      scheduledAt: data.scheduledAt,
      timezone: 'Asia/Kolkata (IST)',
      visibility: data.visibility,
      status: 'scheduled',
    };

    setScheduledPosts((prev) => [newPost, ...prev]);
    setClips((prev) =>
      prev.map((c) =>
        c.id === clip.id
          ? {
              ...c,
              publishStatus: 'scheduled',
              scheduledTime: data.scheduledAt,
              destinationChannelId: data.destinationChannelId,
            }
          : c
      )
    );

    setActivityEvents((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'scheduling',
        title: 'Short Scheduled',
        description: `Scheduled "${clip.metadata.title}" for ${new Date(data.scheduledAt).toLocaleString()} (IST).`,
        timestamp: 'Just now',
        clipId: clip.id,
        status: 'info',
      },
      ...prev,
    ]);
  };

  const deleteScheduledPost = (id: string) => {
    setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePipelineService = (id: string) => {
    setPipelineServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'active' ? 'paused' : 'active';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const testIntegration = async (id: string) => {
    // Set checking state
    setIntegrationHealth((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Checking' } : item))
    );

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate realistic health check test result
    setIntegrationHealth((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Connected',
            lastCheckedAt: 'Just now (Verified)',
            details: 'Live socket response 200 OK. Ping latency 12ms.',
          };
        }
        return item;
      })
    );
  };

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const retryJob = (jobId: string) => {
    setActiveJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'running', progress: 10 } : j))
    );
  };

  const cancelJob = (jobId: string) => {
    setActiveJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'cancelled' } : j))
    );
  };

  const resetAllData = () => {
    setSourceChannels([]);
    setDestinationChannels(initialDestinationChannels);
    setVideos(initialVideos);
    setClips(initialClips);
    setScheduledPosts(initialScheduledPosts);
    setPipelineServices(initialPipelineServices);
    setWorkerStatus(initialWorkerStatus);
    setIntegrationHealth(initialIntegrationHealth);
    setUserPreferences(initialUserPreferences);
    setActivityEvents(initialActivityEvents);
    setActiveJobs(initialActiveJobs);
  };

  return (
    <AppContext.Provider
      value={{
        uiState,
        setUiState,
        dashboardSummary,
        activityEvents,
        activeJobs,
        sourceChannels,
        destinationChannels,
        videos,
        clips,
        scheduledPosts,
        scheduleRule,
        analyticsSummary: initialAnalyticsSummary,
        analyticsTrends: initialAnalyticsTrendPoints,
        topClips: initialTopClips,
        pipelineServices,
        workerStatus,
        integrationHealth,
        userPreferences,
        addSourceChannel,
        importVideoFromChannel,
        toggleSourceChannel,
        deleteSourceChannel,
        connectDestinationChannel,
        disconnectDestinationChannel,
        uploadSimulatedFiles,
        updateClip,
        approveClip,
        rejectClip,
        deleteClip,
        scheduleClip,
        deleteScheduledPost,
        togglePipelineService,
        testIntegration,
        updateUserPreferences,
        retryJob,
        cancelJob,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
