'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  HardDrive,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { PipelineService, JobSummary } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function AutomationCenterPage() {
  const {
    pipelineServices,
    togglePipelineService,
    workerStatus,
    activeJobs,
    retryJob,
    cancelJob,
  } = useApp();

  const [selectedJob, setSelectedJob] = useState<JobSummary | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Automation Control Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time process daemon supervision, individual service toggles, and hardware worker telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Worker Daemon: Online
          </span>
        </div>
      </div>

      {/* Hardware Worker Telemetry Widget */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">{workerStatus.workerName}</h3>
          </div>
          <span className="text-xs text-slate-400">Concurrency: {workerStatus.concurrencyLimit} workers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Active Jobs</span>
            <span className="text-lg font-bold text-blue-400 mt-0.5 block">{workerStatus.activeJobsCount} Running</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
            <span className="text-[11px] text-slate-400 block">CPU Load</span>
            <span className="text-lg font-bold text-slate-200 mt-0.5 block">{workerStatus.cpuUsagePercent}%</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
            <span className="text-[11px] text-slate-400 block">GPU VRAM Allocated</span>
            <span className="text-lg font-bold text-slate-200 mt-0.5 block">{workerStatus.memoryUsagePercent}%</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Render Temp Storage</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">
              {(workerStatus.tempStorageUsageMb / 1024).toFixed(1)} / {(workerStatus.tempStorageLimitMb / 1024).toFixed(0)} GB
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline Services Grid (All 8 Services from Blueprint) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pipeline Workers & Processing Daemons
          </h3>
          <span className="text-[11px] text-slate-400">Individual Start / Pause Controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pipelineServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{service.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                  </div>
                  <StatusBadge status={service.status} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Last Run</span>
                    <span className="font-semibold text-slate-700 truncate block">{service.lastRunAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Processed Today</span>
                    <span className="font-semibold text-slate-700 block">{service.processedCountToday}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Queue Length</span>
                    <span className="font-semibold text-slate-700 block">{service.queueLength}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Next: {service.nextRunAt}</span>

                <button
                  onClick={() => togglePipelineService(service.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    service.status === 'active'
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {service.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Start
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Jobs Detail Inspector */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Job Queue Inspector</h3>
            <p className="text-xs text-slate-500">Inspect real-time stage progress and worker log outputs</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {activeJobs.map((job) => (
            <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{job.id}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{job.taskName}</h4>
                  <StatusBadge status={job.status} />
                </div>

                <div className="w-full max-w-md">
                  <ProgressBar progress={job.progress} stage={job.currentStage} color="blue" />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Inspect Logs
                </button>

                <button
                  onClick={() => retryJob(job.id)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Retry Job"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Log Inspector Modal */}
      {selectedJob && (
        <Modal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          title={`Job Logs: ${selectedJob.taskName}`}
          description={`Task ID: ${selectedJob.id} • Started: ${selectedJob.startedAt}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl max-h-72 overflow-y-auto space-y-1">
              <p className="text-slate-500">[2026-11-05 19:20:10] Ingesting task parameters into local thread pool...</p>
              <p className="text-slate-300">[2026-11-05 19:20:12] Validating NVENC hardware encoder acceleration.</p>
              <p className="text-slate-300">[2026-11-05 19:20:15] Executing stage: {selectedJob.currentStage}</p>
              <p className="text-emerald-400">[2026-11-05 19:20:25] Process status: {selectedJob.status.toUpperCase()} ({selectedJob.progress}% completed)</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sans">
              <button
                onClick={() => {
                  cancelJob(selectedJob.id);
                  setSelectedJob(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl"
              >
                Cancel Job
              </button>

              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
