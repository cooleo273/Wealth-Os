import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'glass-card p-6 space-y-4 hover:shadow-2xl transition-shadow duration-300',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change && (
          <p
            className={cn(
              'text-xs font-medium',
              changeType === 'positive' && 'text-emerald-500',
              changeType === 'negative' && 'text-red-500',
              changeType === 'neutral' && 'text-muted-foreground',
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
