'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Zap, Clock, Settings, FileText, Shield, LogOut, Boxes } from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Agents', href: '/admin/agents', icon: Zap },
  { name: 'Models', href: '/admin/models', icon: Boxes },
  { name: 'Sessions', href: '/admin/sessions', icon: Clock },
  { name: 'Tools', href: '/admin/tools', icon: Settings },
  { name: 'Governance', href: '/admin/governance', icon: Shield },
  { name: 'Audit Logs', href: '/admin/logs', icon: FileText },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-6 py-8">
        <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <span className="text-sm font-bold text-sidebar-primary-foreground">ZC</span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-sidebar-foreground">ZombieCoder</h1>
          <p className="text-xs text-sidebar-foreground/60">Hub v2.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
