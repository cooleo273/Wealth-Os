'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, UpdateProfileDto, UpdateSettingsDto } from '@wealth/types';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

export const USER_QUERY_KEY = ['user', 'me'] as const;

export function useMe() {
  const { token } = useAuth();

  return useQuery<UserProfile>({
    queryKey: USER_QUERY_KEY,
    queryFn: () => api.get<UserProfile>('/users/me', token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const { token, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) =>
      api.patch('/users/profile', dto, token ?? undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      await refreshUser();
    },
  });
}

export function useUpdateSettings() {
  const { token, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateSettingsDto) =>
      api.patch('/users/settings', dto, token ?? undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      await refreshUser();
    },
  });
}
