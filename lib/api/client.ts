// Typed Frontend API Client for ViralFlow AI
// Designed for seamless handoff: Reads NEXT_PUBLIC_API_URL if configured,
// otherwise transparently interfaces with the mock fixtures & reactive in-memory state.

import {
  DashboardSummary,
  ActivityEvent,
  JobSummary,
  SourceChannel,
  DestinationChannel,
  VideoAsset,
  Clip,
  ScheduledPost,
  AnalyticsSummary,
  AnalyticsPoint,
  TopClip,
  PipelineService,
  WorkerStatus,
  IntegrationHealth,
  UserPreferences,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ViralFlowApiClient {
  private isLiveMode: boolean = Boolean(API_BASE_URL);

  public getBaseUrl(): string {
    return API_BASE_URL;
  }

  public isUsingLiveBackend(): boolean {
    return this.isLiveMode;
  }

  // Safe wrapper for backend calls with fallback
  private async fetchEndpoint<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.isLiveMode) {
      throw new Error('No live backend configured. Use local AppContext state.');
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Request Failed (${response.status}): ${errorBody}`);
    }
    return response.json();
  }

  // Live endpoints (ready for backend handoff)
  public async fetchDashboardSummary(): Promise<DashboardSummary> {
    return this.fetchEndpoint<DashboardSummary>('/api/dashboard/summary');
  }

  public async fetchActivityEvents(): Promise<ActivityEvent[]> {
    return this.fetchEndpoint<ActivityEvent[]>('/api/dashboard/activity');
  }

  public async fetchActiveJobs(): Promise<JobSummary[]> {
    return this.fetchEndpoint<JobSummary[]>('/api/dashboard/jobs');
  }

  public async fetchSourceChannels(): Promise<SourceChannel[]> {
    return this.fetchEndpoint<SourceChannel[]>('/api/channels/sources');
  }

  public async fetchDestinationChannels(): Promise<DestinationChannel[]> {
    return this.fetchEndpoint<DestinationChannel[]>('/api/channels/destinations');
  }

  public async fetchVideoAssets(): Promise<VideoAsset[]> {
    return this.fetchEndpoint<VideoAsset[]>('/api/library/videos');
  }

  public async fetchClips(): Promise<Clip[]> {
    return this.fetchEndpoint<Clip[]>('/api/clips');
  }

  public async fetchClipById(clipId: string): Promise<Clip> {
    return this.fetchEndpoint<Clip>(`/api/clips/${clipId}`);
  }

  public async fetchScheduledPosts(): Promise<ScheduledPost[]> {
    return this.fetchEndpoint<ScheduledPost[]>('/api/scheduler/posts');
  }

  public async fetchAnalytics(): Promise<{ summary: AnalyticsSummary; trends: AnalyticsPoint[]; topClips: TopClip[] }> {
    return this.fetchEndpoint<{ summary: AnalyticsSummary; trends: AnalyticsPoint[]; topClips: TopClip[] }>('/api/analytics');
  }

  public async fetchPipelineServices(): Promise<PipelineService[]> {
    return this.fetchEndpoint<PipelineService[]>('/api/automation/services');
  }

  public async fetchWorkerStatus(): Promise<WorkerStatus> {
    return this.fetchEndpoint<WorkerStatus>('/api/automation/worker');
  }

  public async fetchIntegrationHealth(): Promise<IntegrationHealth[]> {
    return this.fetchEndpoint<IntegrationHealth[]>('/api/settings/health');
  }

  public async testIntegration(id: string): Promise<IntegrationHealth> {
    return this.fetchEndpoint<IntegrationHealth>(`/api/settings/health/${id}/test`, { method: 'POST' });
  }
}

export const apiClient = new ViralFlowApiClient();
