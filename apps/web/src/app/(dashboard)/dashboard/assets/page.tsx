'use client';

import { Wallet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssets } from '@/hooks/use-portfolio';
import { formatCurrency } from '@/lib/utils';
import { AssetType } from '@wealth/types';

const TYPE_LABELS: Record<AssetType, string> = {
  STOCK: 'Stocks',
  CRYPTO: 'Cryptocurrency',
  REAL_ESTATE: 'Real Estate',
  BOND: 'Bonds',
  CASH: 'Cash',
  OTHER: 'Other',
};

const RISK_MAP: Record<AssetType, { label: string; color: string }> = {
  STOCK:       { label: 'Medium',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
  CRYPTO:      { label: 'High',     color: 'text-red-600 bg-red-50 dark:bg-red-950' },
  REAL_ESTATE: { label: 'Low',      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  BOND:        { label: 'Very Low', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
  CASH:        { label: 'None',     color: 'text-slate-600 bg-slate-50 dark:bg-slate-900' },
  OTHER:       { label: 'Varies',   color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
};

export default function AssetsPage() {
  const { data: assets, isLoading } = useAssets();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Group assets by type
  const grouped = (assets ?? []).reduce<Record<string, typeof assets>>((acc, a) => {
    const key = a.assetType;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(a);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped).map(([type, items]) => {
    const totalValue = (items ?? []).reduce(
      (sum, a) => sum + Number(a.shares) * Number(a.currentPrice),
      0,
    );
    const totalCost = (items ?? []).reduce(
      (sum, a) => sum + Number(a.shares) * Number(a.avgCost),
      0,
    );
    const growth = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    return { type: type as AssetType, items: items ?? [], totalValue, growth };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
      </div>

      {groupEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No assets yet. Add your first asset from the Portfolio page.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupEntries.map(({ type, items, totalValue, growth }) => {
            const risk = RISK_MAP[type];
            return (
              <Card key={type} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{TYPE_LABELS[type]}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {items.length} holding{items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${risk.color}`}>
                      {risk.label} Risk
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                    <p className={`text-sm font-semibold ${growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% P&L
                    </p>
                  </div>
                  <div className="mt-3 space-y-1">
                    {items.map((a) => (
                      <div key={a.id} className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{a.symbol}</span>
                        <span>{Number(a.shares).toFixed(4)} @ {formatCurrency(Number(a.currentPrice))}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
