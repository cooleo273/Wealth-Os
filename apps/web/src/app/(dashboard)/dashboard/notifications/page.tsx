'use client';

import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/use-portfolio';
import { NotifType } from '@wealth/types';

const TYPE_COLORS: Record<NotifType, string> = {
  SUCCESS: 'bg-emerald-500',
  WARNING: 'bg-amber-500',
  INFO: 'bg-blue-500',
  ERROR: 'bg-red-500',
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {unreadCount} unread
          </span>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead()}
              disabled={markingAll}
            >
              {markingAll ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !notifications?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-all cursor-pointer ${
                n.read ? 'opacity-60' : 'border-primary/30'
              }`}
              onClick={() => {
                if (!n.read) markRead(n.id);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      TYPE_COLORS[n.type]
                    } ${n.read ? 'opacity-30' : ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium ${
                          n.read ? 'text-muted-foreground' : ''
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
