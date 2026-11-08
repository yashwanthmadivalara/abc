'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { useApp } from '@/lib/context/AppContext';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { uiState, setUiState } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Demo Banner & State Switcher */}
      <DemoBanner />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          <Topbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {/* Global UI State Simulator Handling */}
            {uiState === 'loading' ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <h3 className="text-base font-semibold text-slate-800">
                  Simulating API Loading State...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Testing component skeleton loaders, network delay handlers, and spinner states.
                </p>
                <button
                  onClick={() => setUiState('populated')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Return to Populated View
                </button>
              </div>
            ) : uiState === 'error' ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-rose-50/50 rounded-2xl border border-rose-200">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-full mb-3">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-rose-900">
                  Simulated Backend Connection Failure
                </h3>
                <p className="text-xs text-rose-700 mt-1.5 max-w-md">
                  Backend API unreachable (HTTP 503 Service Unavailable). Ensure backend worker daemon and PostgreSQL connection are configured.
                </p>
                <button
                  onClick={() => setUiState('populated')}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Connection / Reset State
                </button>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
