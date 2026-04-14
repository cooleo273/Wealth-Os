import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

function toNum(d: Decimal | null | undefined): number {
  return d ? parseFloat(d.toString()) : 0;
}

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [assets, transactions] = await Promise.all([
      this.prisma.asset.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // ── Total portfolio value & cost ──────────────────────────────────────────
    let totalValue = 0;
    let totalCost = 0;

    for (const a of assets) {
      const shares = toNum(a.shares);
      totalValue += shares * toNum(a.currentPrice);
      totalCost += shares * toNum(a.avgCost);
    }

    const unrealisedGain = totalValue - totalCost;
    const unrealisedGainPct = totalCost > 0 ? (unrealisedGain / totalCost) * 100 : 0;

    // ── Cash balance (DEPOSIT - WITHDRAWAL + DIVIDEND - BUY cost + SELL proceeds) ─
    let cashBalance = 0;
    for (const tx of transactions) {
      const amt = toNum(tx.amount);
      if (tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND') cashBalance += amt;
      else if (tx.type === 'WITHDRAWAL') cashBalance -= amt;
      else if (tx.type === 'BUY') cashBalance -= amt;
      else if (tx.type === 'SELL') cashBalance += amt;
    }

    // ── Monthly return (current calendar month BUY/SELL/DIVIDEND delta) ───────
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let monthlyReturn = 0;
    for (const tx of transactions) {
      if (tx.createdAt < monthStart) continue;
      const amt = toNum(tx.amount);
      if (tx.type === 'DIVIDEND' || tx.type === 'SELL') monthlyReturn += amt;
      else if (tx.type === 'BUY') monthlyReturn -= amt;
    }
    const monthlyReturnPct =
      totalCost > 0 ? (monthlyReturn / totalCost) * 100 : 0;

    // ── Allocation by asset type ────────────────────────────────────────────────
    const typeMap: Record<string, number> = {};
    for (const a of assets) {
      const val = toNum(a.shares) * toNum(a.currentPrice);
      typeMap[a.assetType] = (typeMap[a.assetType] ?? 0) + val;
    }
    const allocationByType = Object.entries(typeMap).map(([type, value]) => ({
      type,
      value: Math.round(value * 100) / 100,
      pct: totalValue > 0 ? Math.round((value / totalValue) * 10000) / 100 : 0,
    }));

    // ── 12-month portfolio value history ──────────────────────────────────────
    // Approximate by spreading cost basis linearly over months
    const monthlyHistory: { month: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      // Sum value of assets bought up to this month
      let historicValue = 0;
      for (const tx of transactions) {
        if (tx.createdAt > d) continue;
        if (tx.type === 'BUY') historicValue += toNum(tx.amount);
        else if (tx.type === 'SELL') historicValue -= toNum(tx.amount);
        else if (tx.type === 'DIVIDEND') historicValue += toNum(tx.amount) * 0.5;
      }

      monthlyHistory.push({ month: label, value: Math.max(0, Math.round(historicValue * 100) / 100) });
    }

    // Replace last month with current actual value
    if (monthlyHistory.length > 0) {
      monthlyHistory[monthlyHistory.length - 1].value =
        Math.round(totalValue * 100) / 100;
    }

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      unrealisedGain: Math.round(unrealisedGain * 100) / 100,
      unrealisedGainPct: Math.round(unrealisedGainPct * 100) / 100,
      cashBalance: Math.round(cashBalance * 100) / 100,
      monthlyReturn: Math.round(monthlyReturn * 100) / 100,
      monthlyReturnPct: Math.round(monthlyReturnPct * 100) / 100,
      allocationByType,
      monthlyHistory,
    };
  }
}
