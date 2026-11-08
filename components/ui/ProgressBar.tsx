'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  stage?: string;
  className?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple';
}

export function ProgressBar({
  progress,
  label,
  stage,
  className,
  color = 'blue',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  const barColors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    purple: 'bg-purple-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || stage) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-700">
          <span className="truncate pr-2">{stage || label}</span>
          <span className="text-slate-500 font-semibold">{clamped}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', barColors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
