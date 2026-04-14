'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: PieChart },
  { href: '/dashboard/assets', label: 'Assets', icon: Wallet },
  { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  async function handleLogout() {
    await logout();
    router.push('/login');
    toast({ title: 'Signed out successfully' });
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 shrink-0', collapsed && 'justify-center')}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="ml-3 font-bold text-lg tracking-tight truncate">Wealth</span>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Settings & User */}
      <div className="p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            pathname === '/dashboard/settings' && 'bg-primary/10 text-primary',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User profile mini */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user.profile?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(user.profile?.fullName, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {user.profile?.fullName ?? user.email.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn(
            'w-full text-muted-foreground hover:text-destructive',
            !collapsed && 'justify-start gap-3 px-3',
          )}
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign out'}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
