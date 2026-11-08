// ViralFlow AI TypeScript Type Definitions
// Based on ViralFlow AI Complete Project Blueprint

export type ApprovalStatus = 'draft' | 'needs_review' | 'approved' | 'rejected';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';

export type LibraryCategory = 
  | 'imported' 
  | 'processing' 
  | 'extracted' 
  | 'pending_approval' 
  | 'scheduled' 
  | 'published' 
  | 'failed';

export type PublishStatus = 'draft' | 'queued' | 'scheduled' | 'uploading' | 'published' | 'failed';

export type VisibilityMode = 'private' | 'unlisted' | 'public';

export type AspectRatioMode = '9:16' | '1:1' | '16:9';

export type FramingMode = 'center_crop' | 'background_blur' | 'face_focus';

export type ServiceStatus = 'active' | 'paused' | 'error' | 'idle';

export type IntegrationHealthStatus = 'Connected' | 'Disconnected' | 'Checking' | 'Error' | 'Unknown';

// Dashboard Models
export interface DashboardSummary {
  sourceChannelsCount: number;
  activeChannelsCount: number;
  detectedVideosCount: number;
  processingJobsCount: number;
  generatedClipsCount: number;
  pendingApprovalsCount: number;
  scheduledPostsCount: number;
  publishedPostsCount: number;
  failedJobsCount: number;
  isMockData: boolean;
}

export type ActivityEventType =
  | 'detection'
  | 'import'
  | 'transcription'
  | 'ai_analysis'
  | 'extraction'
  | 'approval'
  | 'scheduling'
  | 'publishing'
  | 'error';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  channelName?: string;
  videoId?: string;
  clipId?: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface JobSummary {
  id: string;
  taskName: string;
  progress: number; // 0 to 100
  status: JobStatus;
  startedAt: string;
  lastRun: string;
  nextRun: string;
  recentErrors?: string[];
  errorMessage?: string;
  currentStage: string;
}

// Channels Models
export type ChannelConnectionStatus = 'connected' | 'disconnected' | 'pending_oauth' | 'error';

export interface YouTubeVideoItem {
  id: string;
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
  description: string;
}

export interface SourceChannel {
  id: string;
  name: string;
  handle?: string;
  channelUrl: string;
  channelId: string;
  thumbnailUrl: string;
  subscriberCount: number;
  isEnabled: boolean;
  monitoringFrequency: '15m' | '30m' | '1h' | '6h' | '24h';
  lastCheckedAt: string;
  lastUploadedAt: string;
  detectedVideosCount: number;
  createdAt: string;
  uploadedVideos?: YouTubeVideoItem[];
}

export interface DestinationChannel {
  id: string;
  channelName: string;
  customUrl?: string;
  profileImageUrl: string;
  connectionStatus: ChannelConnectionStatus;
  subscriberCount: number;
  isPrimary: boolean;
  quotaUsedPercent: number;
  connectedAt?: string;
}

// Video Library Models
export interface VideoAsset {
  id: string;
  title: string;
  sourceChannelId?: string;
  sourceChannelName?: string;
  sourceUrl?: string;
  filename: string;
  durationSeconds: number;
  resolution: string;
  fileSizeBytes: number;
  category: LibraryCategory;
  uploadProgress?: number;
  thumbnailUrl: string;
  createdAt: string;
  processingStage?: string;
  extractedClipsCount?: number;
  errorMessage?: string;
}

export interface UploadRequest {
  files: File[];
  isAuthorizedCertified: boolean;
}

export interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'validating' | 'completed' | 'error';
  errorMessage?: string;
}

// Clips Models
export interface ClipScore {
  overallScore: number; // 0 - 100
  openingHook: number; // 25% weight (0-100)
  interestingContent: number; // 25% weight (0-100)
  contextAndCompleteness: number; // 20% weight (0-100)
  emotionalEngagement: number; // 15% weight (0-100)
  pacing: number; // 15% weight (0-100)
  rationale: string;
  suggestedHookText: string;
  isHeuristic: boolean; // Must always be true to indicate heuristic vs real guarantee
}

export interface SubtitleStyle {
  fontFamily: 'Montserrat' | 'Impact' | 'Inter' | 'Roboto' | 'Komika';
  fontSize: number; // e.g. 24, 28, 32, 36, 42
  primaryColor: string; // Hex color e.g. #FFFFFF
  outlineColor: string; // Hex color e.g. #000000
  outlineWidth: number;
  position: 'top' | 'middle' | 'bottom';
  highlightCurrentWord: boolean;
  highlightColor: string; // e.g. #FFDF00
  uppercase: boolean;
  previewTextSample?: string;
}

export interface ClipMetadata {
  title: string;
  description: string;
  hashtags: string[];
  keywords: string[];
  category: string;
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words?: SubtitleWord[];
}

export interface Clip {
  id: string;
  sourceVideoId: string;
  sourceVideoTitle: string;
  sourceChannelName: string;
  startTime: number; // seconds
  endTime: number; // seconds
  duration: number; // seconds
  aspectRatio: AspectRatioMode;
  framing: FramingMode;
  score: ClipScore;
  metadata: ClipMetadata;
  subtitleStyle: SubtitleStyle;
  subtitles: SubtitleSegment[];
  approvalStatus: ApprovalStatus;
  publishStatus: PublishStatus;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  createdAt: string;
  scheduledTime?: string;
  destinationChannelId?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  views?: number;
  likes?: number;
}

// Scheduler Models
export interface ScheduledPost {
  id: string;
  clipId: string;
  clipTitle: string;
  thumbnailUrl: string;
  duration: number;
  destinationChannelId: string;
  destinationChannelName: string;
  scheduledAt: string; // ISO String
  timezone: string; // defaults to 'Asia/Kolkata (IST)'
  visibility: VisibilityMode;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'paused';
}

export interface ScheduleRule {
  preferredDays: number[]; // 0=Sunday, 1=Monday...
  preferredHours: number[]; // e.g. [14, 18, 21]
  dailyUploadCap: number; // e.g. 3
  minimumIntervalHours: number; // e.g. 4
  timezone: string;
  autoScheduleEnabled: boolean;
  isPaused: boolean;
}

export interface CalendarItem {
  id: string;
  scheduledPost: ScheduledPost;
}

// Publishing Models
export interface PublishRequest {
  clipId: string;
  destinationChannelId: string;
  title: string;
  description: string;
  tags: string[];
  visibility: VisibilityMode;
  scheduledTime?: string;
}

export interface PublishedVideo {
  id: string;
  clipId: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  title: string;
  destinationChannelName: string;
  publishedAt: string;
  visibility: VisibilityMode;
  views: number;
  likes: number;
  comments: number;
}

// Analytics Models
export interface AnalyticsSummary {
  totalViews: number;
  viewsGrowthPercent: number;
  totalLikes: number;
  likesGrowthPercent: number;
  totalComments: number;
  commentsGrowthPercent: number;
  subscribersGained: number;
  subscribersGrowthPercent: number;
  averageViewPercentage: number;
  averageViewDurationSeconds: number;
  isLiveData: boolean;
  dataUnavailableNotice?: string;
}

export interface AnalyticsPoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
  avgWatchTimeSeconds: number;
}

export interface TopClip {
  id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  destinationChannelName: string;
}

// Automation Models
export interface PipelineService {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  lastRunAt: string;
  nextRunAt: string;
  processedCountToday: number;
  errorCountToday: number;
  queueLength: number;
}

export interface WorkerStatus {
  isWorkerOnline: boolean;
  workerName: string;
  concurrencyLimit: number;
  activeJobsCount: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  tempStorageUsageMb: number;
  tempStorageLimitMb: number;
}

// Settings Models
export interface UserPreferences {
  aiModel: string;
  qwenModelName: string;
  fasterWhisperModel: string;
  defaultClipDuration: 15 | 30 | 45 | 60;
  defaultAspectRatio: AspectRatioMode;
  defaultFraming: FramingMode;
  defaultSubtitleFont: string;
  outputResolution: string;
  tempStoragePath: string;
  workerConcurrency: number;
  dailyUploadCap: number;
  minIntervalBetweenUploadsHours: number;
  autoCleanupDays: number;
  defaultTimezone: string;
}

export interface IntegrationHealth {
  id: string;
  name: string;
  category: 'LLM' | 'Audio' | 'Video' | 'Database' | 'YouTube' | 'Worker';
  status: IntegrationHealthStatus;
  endpointOrPath: string;
  lastCheckedAt?: string;
  details?: string;
  requiresBackendRestart?: boolean;
}
