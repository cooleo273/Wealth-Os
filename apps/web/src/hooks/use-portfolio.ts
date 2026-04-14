'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Asset,
  CreateAssetDto,
  UpdateAssetDto,
  Transaction,
  CreateTransactionDto,
  Notification,
  PortfolioSummary,
} from '@wealth/types';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const PORTFOLIO_KEYS = {
  summary: ['portfolio', 'summary'] as const,
  assets: ['assets'] as const,
  transactions: (limit?: number, month?: string) =>
    ['transactions', { limit, month }] as const,
  notifications: ['notifications'] as const,
};

// ─── Portfolio Summary ────────────────────────────────────────────────────────

export function usePortfolioSummary() {
  const { token } = useAuth();
  return useQuery<PortfolioSummary>({
    queryKey: PORTFOLIO_KEYS.summary,
    queryFn: () => api.get<PortfolioSummary>('/portfolio/summary', token ?? undefined),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export function useAssets() {
  const { token } = useAuth();
  return useQuery<Asset[]>({
    queryKey: PORTFOLIO_KEYS.assets,
    queryFn: () => api.get<Asset[]>('/assets', token ?? undefined),
    enabled: !!token,
  });
}

export function useCreateAsset() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAssetDto) =>
      api.post<Asset>('/assets', dto, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.assets });
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.summary });
    },
  });
}

export function useUpdateAsset() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAssetDto }) =>
      api.patch<Asset>(`/assets/${id}`, dto, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.assets });
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.summary });
    },
  });
}

export function useDeleteAsset() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/assets/${id}`, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.assets });
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.summary });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useTransactions(limit?: number, month?: string) {
  const { token } = useAuth();
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (month) params.set('month', month);
  const query = params.toString() ? `?${params}` : '';

  return useQuery<Transaction[]>({
    queryKey: PORTFOLIO_KEYS.transactions(limit, month),
    queryFn: () =>
      api.get<Transaction[]>(`/transactions${query}`, token ?? undefined),
    enabled: !!token,
  });
}

export function useCreateTransaction() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransactionDto) =>
      api.post<Transaction>('/transactions', dto, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.summary });
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications() {
  const { token } = useAuth();
  return useQuery<Notification[]>({
    queryKey: PORTFOLIO_KEYS.notifications,
    queryFn: () =>
      api.get<Notification[]>('/notifications', token ?? undefined),
    enabled: !!token,
  });
}

export function useMarkRead() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/notifications/${id}/read`, undefined, token ?? undefined),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.notifications }),
  });
}

export function useMarkAllRead() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.patch('/notifications/read-all', undefined, token ?? undefined),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: PORTFOLIO_KEYS.notifications }),
  });
}
