'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileVideo,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { formatBytes } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'ready' | 'uploading' | 'validating' | 'done' | 'error';
  progress: number;
  error?: string;
}

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

export default function UploadPage() {
  const router = useRouter();
  const { uploadSimulatedFiles } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAuthorizedCertified, setIsAuthorizedCertified] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateAndAddFiles = (fileList: FileList | File[]) => {
    setGlobalError(null);
    const newItems: QueuedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setGlobalError(`Unsupported extension for "${file.name}". Only MP4, MOV, MKV, and WEBM are accepted.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setGlobalError(`File "${file.name}" exceeds 5 GB limit.`);
        return;
      }

      // Check duplicate in current queue
      if (queue.some((q) => q.name === file.name && q.size === file.size)) {
        setGlobalError(`"${file.name}" is already in the upload queue.`);
        return;
      }

      newItems.push({
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'video/mp4',
        status: 'ready',
        progress: 0,
      });
    });

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUploadSubmit = () => {
    if (!isAuthorizedCertified) {
      setGlobalError('You must verify copyright ownership and authorization before processing.');
      return;
    }
    if (queue.length === 0) {
      setGlobalError('Please select at least one video file.');
      return;
    }

    setIsProcessing(true);

    // Simulate progress animation for realistic UX
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 25;
      setQueue((prev) =>
        prev.map((item) => ({
          ...item,
          status: currentStep < 100 ? 'uploading' : 'validating',
          progress: Math.min(100, currentStep),
        }))
      );

      if (currentStep >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          uploadSimulatedFiles(
            queue.map((q) => ({ name: q.name, size: q.size }))
          );
          router.push('/library');
        }, 600);
      }
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/library"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Back to Video Library"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Upload Source Videos</h2>
          <p className="text-xs text-slate-500">
            Import authorized long-form content for AI transcription and Shorts extraction.
          </p>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".mp4,.mov,.mkv,.webm"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) validateAndAddFiles(e.target.files);
          }}
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          Drag & drop your video files here, or <span className="text-blue-600 underline">browse</span>
        </h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          Supports MP4, MOV, MKV, and WEBM up to 5 GB per file. Multi-file uploads supported.
        </p>

        {/* FFprobe Callout - specified in blueprint */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] text-slate-600 font-medium">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          <span>Authoritative stream validation & codec probing is performed server-side via FFprobe</span>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Upload Queue List */}
      {queue.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Selected Upload Queue ({queue.length})
            </h3>
            <button
              onClick={() => setQueue([])}
              disabled={isProcessing}
              className="text-xs text-rose-600 hover:underline disabled:text-slate-400"
            >
              Clear All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {queue.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{formatBytes(item.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {item.status !== 'ready' ? (
                    <div className="w-32">
                      <ProgressBar progress={item.progress} stage={item.status} color="blue" />
                    </div>
                  ) : (
                    <button
                      onClick={() => removeQueueItem(item.id)}
                      disabled={isProcessing}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copyright & Authorization Mandatory Checkbox (Specified in blueprint) */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <input
            id="auth-checkbox"
            type="checkbox"
            checked={isAuthorizedCertified}
            onChange={(e) => {
              setIsAuthorizedCertified(e.target.checked);
              setGlobalError(null);
            }}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="auth-checkbox" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
            <strong className="text-slate-900 font-semibold block">
              Authorization & Copyright Compliance Certification *
            </strong>
            I certify that I own all rights to these media files, hold a valid commercial license, or have explicit legal authorization to transcribe, extract, and publish derivative clips.
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
          <span className="text-[11px] text-slate-500">
            {queue.length} file(s) ready for ingestion
          </span>

          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleUploadSubmit}
              disabled={isProcessing || queue.length === 0 || !isAuthorizedCertified}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uploading & Validating...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Start Ingestion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
