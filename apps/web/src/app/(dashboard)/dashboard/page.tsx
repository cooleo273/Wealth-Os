'use client';

import { DollarSign, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { WealthChart } from '@/components/dashboard/WealthChart';
import { AllocationCard } from '@/components/dashboard/AllocationCard';
import { useAuth } from '@/providers/AuthProvider';
import { useMe } from '@/hooks/use-user';
import { usePortfolioSummary, useTransactions } from '@/hooks/use-portfolio';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@wealth/types';

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function txColor(type: Transaction['type']) {
  if (type === 'SELL' || type === 'DIVIDEND' || type === 'DEPOSIT') return 'text-emerald-500';
  if (type === 'BUY') return 'text-blue-500';
  return 'text-red-500';
}

function txLabel(tx: Transaction): string {
  if (tx.type === 'BUY') return `Bought ${tx.symbol ?? tx.name ?? ''}`;
  if (tx.type === 'SELL') return `Sold ${tx.symbol ?? tx.name ?? ''}`;
  if (tx.type === 'DIVIDEND') return `Dividend — ${tx.symbol ?? tx.name ?? ''}`;
  if (tx.type === 'DEPOSIT') return 'Deposit';
  return 'Withdrawal';
}

function txAmount(tx: Transaction): string {
  const sign = tx.type === 'WITHDRAWAL' || tx.type === 'BUY' ? '-' : '+';
  return `${sign}${formatCurrency(tx.amount)}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useMe();
  const { data: summary, isLoading: loadingSummary } = usePortfolioSummary();
  const { data: transactions, isLoading: loadingTx } = useTransactions(5);

  const displayName =
    (profile ?? user)?.profile?.fullName ??
    (profile ?? user)?.email?.split('@')[0] ??
    'there';

  const gain = summary?.unrealisedGain ?? 0;
  const gainPct = summary?.unrealisedGainPct ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning, {displayName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your wealth today.
        </p>
      </div>

      {loadingSummary ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Portfolio"
            value={formatCurrency(summary?.totalValue ?? 0)}
            change={`${gainPct >= 0 ? '↑' : '↓'} ${Math.abs(gainPct).toFixed(1)}% unrealised`}
            changeType={gainPct >= 0 ? 'positive' : 'negative'}
            icon={DollarSign}
          />
          <StatCard
            title="Monthly Return"
            value={formatCurrency(summary?.monthlyReturn ?? 0)}
            change={`${(summary?.monthlyReturnPct ?? 0) >= 0 ? '↑' : '↓'} ${Math.abs(summary?.monthlyReturnPct ?? 0).toFixed(1)}% this month`}
            changeType={(summary?.monthlyReturn ?? 0) >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
          />
          <StatCard
            title="Unrealised P&L"
            value={formatCurrency(Math.abs(gain))}
            change={gain >= 0 ? `↑ ${gainPct.toFixed(1)}% gain` : `↓ ${Math.abs(gainPct).toFixed(1)}% loss`}
            changeType={gain >= 0 ? 'positive' : 'negative'}
            icon={TrendingDown}
          />
          <StatCard
            title="Cash Balance"
            value={formatCurrency(summary?.cashBalance ?? 0)}
            change="Available to invest"
            changeType="neutral"
            icon={Wallet}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WealthChart data={summary?.monthlyHistory} />
        <AllocationCard data={summary?.allocationByType} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-base font-semibold mb-4">Recent Transactions</h2>
        {loadingTx ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : !transactions?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions yet. Add your first transaction to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{txLabel(tx)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(tx.createdAt)}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${txColor(tx.type)}`}>
                  {txAmount(tx)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
