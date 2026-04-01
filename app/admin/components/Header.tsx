'use client';

import { Bell, User, Settings } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = 'Dashboard', subtitle }: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-background border-b border-border px-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <User className="w-5 h-5 text-foreground" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  );
}
