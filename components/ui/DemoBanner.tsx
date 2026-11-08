'use client';

import React from 'react';
import { Info, RotateCcw, Database, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export function DemoBanner() {
  const { uiState, setUiState, resetAllData } = useApp();

  return (
    <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
          <Database className="w-3 h-3 text-blue-400" />
          Demo Mode (Mock API Fixtures)
        </span>
        <span className="hidden sm:inline text-slate-300">
          All metrics and responses are simulated for UX validation. Real endpoints link via <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded">lib/api/client.ts</code>.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400 font-medium hidden md:inline">Test UI State:</span>
        <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700 text-xs">
          {(['populated', 'empty', 'loading', 'error'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setUiState(mode)}
              className={`px-2.5 py-0.5 rounded-md capitalize font-medium transition-all ${
                uiState === mode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={resetAllData}
          title="Reset simulated data to default"
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
