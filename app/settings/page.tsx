'use client';

import React, { useState } from 'react';
import {
  Settings,
  Activity,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Cpu,
  Tv,
  Database,
  Lock,
  Clock,
  Sparkles,
  Save,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserPreferences, IntegrationHealth } from '@/types';

export default function SettingsPage() {
  const {
    integrationHealth,
    testIntegration,
    userPreferences,
    updateUserPreferences,
  } = useApp();

  // Local form preferences
  const [formData, setFormData] = useState<UserPreferences>(userPreferences);
  const [isSaved, setIsSaved] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    await testIntegration(id);
    setTestingId(null);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">System Settings & Integration Health</h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor service connection latencies, test API health sockets, and configure pipeline preferences.
        </p>
      </div>

      {/* Integration Health Matrix (All 9 Components from Blueprint) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Integration Health Matrix</h3>
            <p className="text-xs text-slate-500">Live sockets, AI runtimes, and storage dependencies</p>
          </div>
          <span className="text-[11px] text-slate-400">Never displays connected without real verification</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationHealth.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-2 truncate">{item.name}</h4>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 truncate">
                  {item.endpointOrPath}
                </div>

                {item.details && (
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">{item.details}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {item.lastCheckedAt || 'Not checked'}
                </span>

                <button
                  onClick={() => handleTestConnection(item.id)}
                  disabled={testingId === item.id}
                  className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${testingId === item.id ? 'animate-spin text-blue-600' : ''}`}
                  />
                  <span>{testingId === item.id ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Preferences Form (Specified in Blueprint) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pipeline & Rendering Preferences</h3>
            <p className="text-xs text-slate-500">Configure AI model variants, vertical encoding, and daily rate limits</p>
          </div>
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Preferences Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {/* AI Model Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                AI Reasoning Engine (Ollama / Qwen)
              </label>
              <select
                value={formData.qwenModelName}
                onChange={(e) => setFormData({ ...formData, qwenModelName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              >
                <option value="qwen2.5:7b-instruct">Qwen 2.5: 7B Instruct (Recommended)</option>
                <option value="qwen2.5:14b-instruct">Qwen 2.5: 14B Instruct (Deep Reasoning)</option>
                <option value="llama3.2:3b">Llama 3.2: 3B (Fast / Low VRAM)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Local Ollama inference endpoint</span>
            </div>

            {/* Whisper Model Size */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Faster-Whisper Model Size
              </label>
              <select
                value={formData.fasterWhisperModel}
                onChange={(e) => setFormData({ ...formData, fasterWhisperModel: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              >
                <option value="tiny">Tiny (Fastest, minimal accuracy)</option>
                <option value="base">Base (Fast)</option>
                <option value="small">Small (Balanced)</option>
                <option value="medium">Medium (High accuracy)</option>
                <option value="large-v3">Large-v3 (Production Quality)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Requires GPU CUDA acceleration</span>
            </div>

            {/* Default Clip Duration */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Target Clip Duration Preset
              </label>
              <select
                value={formData.defaultClipDuration}
                onChange={(e) =>
                  setFormData({ ...formData, defaultClipDuration: parseInt(e.target.value) as any })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              >
                <option value="15">15 Seconds</option>
                <option value="30">30 Seconds</option>
                <option value="45">45 Seconds (Optimal retention)</option>
                <option value="60">60 Seconds (Max Short limit)</option>
              </select>
            </div>

            {/* Output Resolution */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                FFmpeg Target Resolution
              </label>
              <input
                type="text"
                value={formData.outputResolution}
                onChange={(e) => setFormData({ ...formData, outputResolution: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            {/* Concurrency Worker Limit */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Worker Concurrency Limit
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.workerConcurrency}
                onChange={(e) =>
                  setFormData({ ...formData, workerConcurrency: parseInt(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Simultaneous video transcode processes</span>
            </div>

            {/* Timezone Preference */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                System Scheduler Timezone
              </label>
              <select
                value={formData.defaultTimezone}
                onChange={(e) => setFormData({ ...formData, defaultTimezone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST / UTC+5:30) [Default]</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="UTC">UTC (Universal Coordinated)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Service Restart Note:</strong> Changing Whisper models or worker concurrency requires restarting the local worker daemon background service.
            </span>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Preference Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
