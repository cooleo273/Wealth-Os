'use client';

import { useState } from 'react';
import { PieChart, Loader2, Trash2, Plus, ArrowUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAssets, useCreateAsset, useDeleteAsset, useCreateTransaction } from '@/hooks/use-portfolio';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AssetType, TxType } from '@wealth/types';

// ─── Add Asset form ───────────────────────────────────────────────────────────

const assetSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  shares: z.coerce.number().positive('Must be positive'),
  avgCost: z.coerce.number().positive('Must be positive'),
  currentPrice: z.coerce.number().positive('Must be positive'),
  assetType: z.enum(['STOCK', 'CRYPTO', 'REAL_ESTATE', 'BOND', 'CASH', 'OTHER']),
});
type AssetForm = z.infer<typeof assetSchema>;

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'STOCK', label: 'Stock / ETF' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'BOND', label: 'Bond' },
  { value: 'CASH', label: 'Cash' },
  { value: 'OTHER', label: 'Other' },
];

function AddAssetDialog({ onClose }: { onClose: () => void }) {
  const { mutateAsync: createAsset } = useCreateAsset();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: { assetType: 'STOCK' },
  });

  async function onSubmit(data: AssetForm) {
    try {
      await createAsset(data);
      toast({ title: `${data.symbol} added to portfolio` });
      onClose();
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to add asset',
        description: (err as Error)?.message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="symbol">Ticker Symbol</Label>
          <Input id="symbol" placeholder="AAPL" {...register('symbol')} className="uppercase" />
          {errors.symbol && <p className="text-xs text-destructive">{errors.symbol.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assetType">Asset Type</Label>
          <select
            id="assetType"
            {...register('assetType')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Apple Inc." {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="shares">Shares / Units</Label>
          <Input id="shares" type="number" step="any" placeholder="50" {...register('shares')} />
          {errors.shares && <p className="text-xs text-destructive">{errors.shares.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avgCost">Avg. Cost ($)</Label>
          <Input id="avgCost" type="number" step="any" placeholder="150.00" {...register('avgCost')} />
          {errors.avgCost && <p className="text-xs text-destructive">{errors.avgCost.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currentPrice">Current Price ($)</Label>
          <Input id="currentPrice" type="number" step="any" placeholder="189.50" {...register('currentPrice')} />
          {errors.currentPrice && <p className="text-xs text-destructive">{errors.currentPrice.message}</p>}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add to Portfolio
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Add Transaction form ─────────────────────────────────────────────────────

const txSchema = z.object({
  type: z.enum(['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND']),
  symbol: z.string().max(20).optional(),
  name: z.string().max(100).optional(),
  amount: z.coerce.number().positive('Must be positive'),
  price: z.coerce.number().positive().optional().or(z.literal('')),
  shares: z.coerce.number().positive().optional().or(z.literal('')),
  note: z.string().max(500).optional(),
});
type TxForm = z.infer<typeof txSchema>;

const TX_TYPES: { value: TxType; label: string }[] = [
  { value: 'BUY', label: 'Buy' },
  { value: 'SELL', label: 'Sell' },
  { value: 'DEPOSIT', label: 'Deposit' },
  { value: 'WITHDRAWAL', label: 'Withdrawal' },
  { value: 'DIVIDEND', label: 'Dividend' },
];

function AddTransactionDialog({ onClose }: { onClose: () => void }) {
  const { mutateAsync: createTx } = useCreateTransaction();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TxForm>({
    resolver: zodResolver(txSchema),
    defaultValues: { type: 'BUY' },
  });

  const txType = watch('type');
  const needsAsset = ['BUY', 'SELL', 'DIVIDEND'].includes(txType);

  async function onSubmit(data: TxForm) {
    try {
      await createTx({
        type: data.type,
        symbol: data.symbol || undefined,
        name: data.name || undefined,
        amount: data.amount,
        price: data.price ? Number(data.price) : undefined,
        shares: data.shares ? Number(data.shares) : undefined,
        note: data.note || undefined,
      });
      toast({ title: `${data.type} transaction recorded` });
      onClose();
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to add transaction',
        description: (err as Error)?.message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label>Transaction Type</Label>
        <div className="flex gap-2 flex-wrap">
          {TX_TYPES.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input type="radio" value={t.value} {...register('type')} className="sr-only" />
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                txType === t.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:bg-accent'
              }`}>
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {needsAsset && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tx-symbol">Symbol (optional)</Label>
            <Input id="tx-symbol" placeholder="AAPL" className="uppercase" {...register('symbol')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tx-name">Name (optional)</Label>
            <Input id="tx-name" placeholder="Apple Inc." {...register('name')} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5 col-span-1">
          <Label htmlFor="tx-amount">Amount ($)</Label>
          <Input id="tx-amount" type="number" step="any" placeholder="1000.00" {...register('amount')} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        {needsAsset && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="tx-shares">Shares (optional)</Label>
              <Input id="tx-shares" type="number" step="any" placeholder="10" {...register('shares')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-price">Price/share (optional)</Label>
              <Input id="tx-price" type="number" step="any" placeholder="189.50" {...register('price')} />
            </div>
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-note">Note (optional)</Label>
        <Input id="tx-note" placeholder="e.g. Dollar-cost averaging" {...register('note')} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Record Transaction
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Portfolio Page ───────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { data: assets, isLoading } = useAssets();
  const { mutate: deleteAsset } = useDeleteAsset();
  const { toast } = useToast();
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);

  function handleDelete(id: string, symbol: string) {
    deleteAsset(id, {
      onSuccess: () => toast({ title: `${symbol} removed from portfolio` }),
      onError: () =>
        toast({ variant: 'destructive', title: 'Failed to remove asset' }),
    });
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddTx(true)}>
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          <Button size="sm" onClick={() => setShowAddAsset(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Holdings table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Holdings</CardTitle>
          <span className="text-sm text-muted-foreground">
            {assets?.length ?? 0} position{assets?.length !== 1 ? 's' : ''}
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !assets?.length ? (
            <div className="text-center py-12 space-y-3">
              <PieChart className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">No holdings yet.</p>
              <Button size="sm" onClick={() => setShowAddAsset(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first asset
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Asset</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Type</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Shares</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Avg Cost</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Current</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Value</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">P&L</th>
                    <th className="py-3 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => {
                    const value = Number(a.shares) * Number(a.currentPrice);
                    const cost = Number(a.shares) * Number(a.avgCost);
                    const pl = value - cost;
                    const plPct = cost > 0 ? ((pl / cost) * 100).toFixed(1) : '0.0';
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-semibold">{a.symbol}</p>
                            <p className="text-xs text-muted-foreground">{a.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {a.assetType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-right py-3 px-2">{Number(a.shares).toFixed(4)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(Number(a.avgCost))}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(Number(a.currentPrice))}</td>
                        <td className="text-right py-3 px-2 font-semibold">{formatCurrency(value)}</td>
                        <td className={`text-right py-3 px-2 font-medium ${pl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                          <span className="block text-xs opacity-75">{pl >= 0 ? '+' : ''}{plPct}%</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(a.id, a.symbol)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Asset Dialog */}
      <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Asset</DialogTitle>
            <DialogDescription>
              Add a stock, crypto, or other asset to track in your portfolio.
            </DialogDescription>
          </DialogHeader>
          <AddAssetDialog onClose={() => setShowAddAsset(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTx} onOpenChange={setShowAddTx}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>
              Log a buy, sell, deposit, withdrawal, or dividend.
            </DialogDescription>
          </DialogHeader>
          <AddTransactionDialog onClose={() => setShowAddTx(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
