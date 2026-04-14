'use client';

import { TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { usePortfolioSummary, useTransactions } from '@/hooks/use-portfolio';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const { data: summary, isLoading: loadingSummary } = usePortfolioSummary();
  const { data: transactions } = useTransactions(100);

  // Build monthly gains/losses from transactions
  const monthlyMap: Record<string, { gains: number; losses: number }> = {};
  for (const tx of transactions ?? []) {
    const d = new Date(tx.createdAt);
    const key = d.toLocaleString('default', { month: 'short' });
    if (!monthlyMap[key]) monthlyMap[key] = { gains: 0, losses: 0 };
    if (tx.type === 'SELL' || tx.type === 'DIVIDEND' || tx.type === 'DEPOSIT') {
      monthlyMap[key].gains += Number(tx.amount);
    } else if (tx.type === 'BUY' || tx.type === 'WITHDRAWAL') {
      monthlyMap[key].losses += Number(tx.amount);
    }
  }

  // Use last 6 months from history as chart base
  const chartData = (summary?.monthlyHistory ?? []).slice(-6).map((h) => {
    const key = h.month.split(' ')[0]; // "Apr 26" → "Apr"
    return {
      month: key,
      gains: Math.round((monthlyMap[key]?.gains ?? 0) * 100) / 100,
      losses: Math.round(-(monthlyMap[key]?.losses ?? 0) * 100) / 100,
    };
  });

  // Derive Sharpe-like ratio: monthly return / volatility approximation
  const values = (summary?.monthlyHistory ?? []).map((h) => h.value);
  let sharpe = 0;
  if (values.length > 1) {
    const returns = values.slice(1).map((v, i) => (values[i] > 0 ? (v - values[i]) / values[i] : 0));
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - avg) ** 2, 0) / returns.length;
    const stddev = Math.sqrt(variance);
    sharpe = stddev > 0 ? parseFloat((avg / stddev).toFixed(2)) : 0;
  }

  const winRate =
    transactions && transactions.length > 0
      ? Math.round(
          (transactions.filter((t) => t.type === 'SELL' || t.type === 'DIVIDEND').length /
            transactions.length) *
            100,
        )
      : 0;

  const bestMonth = (summary?.monthlyHistory ?? []).reduce(
    (best, h) => (h.value > (best?.value ?? 0) ? h : best),
    summary?.monthlyHistory?.[0],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      </div>

      {loadingSummary ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6">
              <p className="text-xs text-muted-foreground font-medium">Best Month</p>
              <p className="text-2xl font-bold mt-1">{bestMonth?.month ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {bestMonth ? formatCurrency(bestMonth.value) : 'No data'}
              </p>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs text-muted-foreground font-medium">Sharpe Ratio</p>
              <p className="text-2xl font-bold mt-1">{sharpe.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs text-muted-foreground font-medium">Income Rate</p>
              <p className="text-2xl font-bold mt-1">{winRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Sells & dividends vs total</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Activity (last 6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transaction data yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v: number) =>
                        `$${Math.abs(v / 1000).toFixed(1)}k`
                      }
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(Math.abs(value))
                      }
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="gains" name="Income" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="losses" name="Spending" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Value — 12 Month History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Month</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Value</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.monthlyHistory ?? []).map((h, i, arr) => {
                      const prev = arr[i - 1]?.value ?? 0;
                      const change = i > 0 && prev > 0 ? ((h.value - prev) / prev) * 100 : 0;
                      return (
                        <tr key={h.month} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium">{h.month}</td>
                          <td className="text-right py-2 px-3">{formatCurrency(h.value)}</td>
                          <td className={`text-right py-2 px-3 ${i === 0 ? 'text-muted-foreground' : change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {i === 0 ? '—' : `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
