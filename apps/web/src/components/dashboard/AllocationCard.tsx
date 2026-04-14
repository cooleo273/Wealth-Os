'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AllocationEntry } from '@wealth/types';
import { cn, formatCurrency } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  STOCK: 'bg-violet-500',
  CRYPTO: 'bg-blue-500',
  REAL_ESTATE: 'bg-emerald-500',
  BOND: 'bg-amber-500',
  CASH: 'bg-slate-400',
  OTHER: 'bg-rose-400',
};

const TYPE_LABELS: Record<string, string> = {
  STOCK: 'Stocks',
  CRYPTO: 'Crypto',
  REAL_ESTATE: 'Real Estate',
  BOND: 'Bonds',
  CASH: 'Cash',
  OTHER: 'Other',
};

interface AllocationCardProps {
  data?: AllocationEntry[];
}

export function AllocationCard({ data }: AllocationCardProps) {
  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No assets yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-3 w-full rounded-full overflow-hidden">
          {data.map((entry) => (
            <div
              key={entry.type}
              className={cn(TYPE_COLORS[entry.type] ?? 'bg-gray-400', 'transition-all')}
              style={{ width: `${entry.pct}%` }}
              title={`${TYPE_LABELS[entry.type] ?? entry.type}: ${entry.pct}%`}
            />
          ))}
        </div>

        <div className="space-y-2">
          {data.map((entry) => (
            <div key={entry.type} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    TYPE_COLORS[entry.type] ?? 'bg-gray-400',
                  )}
                />
                <span className="text-muted-foreground">
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </span>
              </div>
              <div className="flex items-center gap-3 font-medium">
                <span>{formatCurrency(entry.value)}</span>
                <span className="text-muted-foreground text-xs w-10 text-right">
                  {entry.pct.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
