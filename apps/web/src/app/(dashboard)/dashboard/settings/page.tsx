'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Bell, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { useMe, useUpdateProfile, useUpdateSettings } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  fullName: z.string().min(2).max(100).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: user, isLoading: loadingUser } = useMe();
  const { mutateAsync: updateProfile, isPending: updatingProfile } = useUpdateProfile();
  const { mutateAsync: updateSettings, isPending: updatingSettings } = useUpdateSettings();
  const { toast } = useToast();
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (user?.profile) {
      reset({
        fullName: user.profile.fullName ?? '',
        bio: user.profile.bio ?? '',
        avatarUrl: user.profile.avatarUrl ?? '',
      });
    }
  }, [user, reset]);

  async function onProfileSubmit(data: ProfileForm) {
    try {
      await updateProfile({
        fullName: data.fullName || undefined,
        bio: data.bio || undefined,
        avatarUrl: data.avatarUrl || undefined,
      });
      toast({ title: 'Profile updated successfully' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to update profile' });
    }
  }

  async function handleNotifToggle(enabled: boolean) {
    try {
      await updateSettings({ notificationsEnabled: enabled });
      toast({ title: `Notifications ${enabled ? 'enabled' : 'disabled'}` });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to update settings' });
    }
  }

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatarUrl')}
              />
              {errors.avatarUrl && (
                <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Tell us about yourself..."
                {...register('bio')}
              />
            </div>

            <Button type="submit" disabled={updatingProfile}>
              {updatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Currently: {theme ?? 'system'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive updates about your portfolio
              </p>
            </div>
            <Switch
              checked={user?.settings?.notificationsEnabled ?? true}
              onCheckedChange={handleNotifToggle}
              disabled={updatingSettings}
            />
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Price Alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified when assets hit target prices
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Account details and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Account ID</span>
            <span className="font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {user?.role ?? 'USER'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
