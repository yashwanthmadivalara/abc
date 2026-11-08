'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Tv,
  Film,
  Scissors,
  CheckCircle2,
  Calendar,
  BarChart3,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Upload,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { dashboardSummary } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Source Channels', href: '/channels/sources', icon: Radio },
    { name: 'My YouTube Channels', href: '/channels/destinations', icon: Tv },
    { name: 'Video Library', href: '/library', icon: Film },
    { name: 'Clip Studio', href: '/clips', icon: Scissors },
    {
      name: 'Approvals',
      href: '/approvals',
      icon: CheckCircle2,
      badge: dashboardSummary.pendingApprovalsCount > 0 ? dashboardSummary.pendingApprovalsCount : undefined,
    },
    { name: 'Scheduler', href: '/scheduler', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Automation', href: '/automation', icon: Cpu },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-base text-slate-900 tracking-tight block">
                  ViralFlow <span className="text-blue-600 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-0.5">
                  Shorts Automation
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Link
            href="/library/upload"
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all',
              isCollapsed && 'px-0'
            )}
            title="Upload source video"
          >
            <Upload className="w-4 h-4" />
            {!isCollapsed && <span>Upload Video</span>}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {/* Badge for notifications / pending approvals */}
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'ml-auto inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-white',
                      isCollapsed && 'absolute top-1 right-1 px-1.5 py-0.2 text-[9px]'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-xs">
          {!isCollapsed ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Pipeline Engine</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-400">v1.0.0 Frontend Build</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
