'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { dashboardSummary, activityEvents } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/channels/sources') return 'Monitored Source Channels';
    if (path === '/channels/destinations') return 'My YouTube Channels';
    if (path === '/library') return 'Video Asset Library';
    if (path === '/library/upload') return 'Upload Authorized Media';
    if (path.startsWith('/clips/')) return 'Clip Studio & Subtitle Editor';
    if (path === '/clips') return 'Candidate Shorts Studio';
    if (path === '/approvals') return 'Pending Approvals Queue';
    if (path === '/scheduler') return 'Publishing Scheduler';
    if (path.startsWith('/publishing/')) return 'Pre-Publish Review & Dispatch';
    if (path === '/analytics') return 'Shorts Performance Analytics';
    if (path === '/automation') return 'Pipeline Automation Center';
    if (path === '/settings') return 'System Settings & Integration Health';
    return 'ViralFlow AI';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Breadcrumbs */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span>ViralFlow AI</span>
            <span>/</span>
            <span className="text-slate-600 capitalize">
              {pathname.replace('/', '').replace('/', ' / ') || 'Dashboard'}
            </span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Timezone pill - specified in blueprint to show Asia/Kolkata / IST by default */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>IST (Asia/Kolkata)</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {dashboardSummary.pendingApprovalsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900">Notifications & Alerts</h4>
                <span className="text-xs text-slate-400">Recent events</span>
              </div>
              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto">
                {activityEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-semibold text-slate-800">{event.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{event.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{event.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security & Token Health Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Credentials Secure (Zero Browser Secrets)</span>
        </div>
      </div>
    </header>
  );
}
