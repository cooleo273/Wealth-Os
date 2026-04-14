// ─── Auth DTOs ─────────────────────────────────────────────────────────────

export interface RegisterDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

// ─── User / Profile ─────────────────────────────────────────────────────────

export type Role = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  profile: Profile | null;
  settings: UserSettings | null;
}

export interface Profile {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export interface UserSettings {
  userId: string;
  themePreference: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

// ─── Update DTOs ─────────────────────────────────────────────────────────────

export interface UpdateProfileDto {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface UpdateSettingsDto {
  themePreference?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export type AssetType = 'STOCK' | 'CRYPTO' | 'REAL_ESTATE' | 'BOND' | 'CASH' | 'OTHER';

export interface Asset {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  assetType: AssetType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetDto {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  assetType?: AssetType;
}

export interface UpdateAssetDto {
  shares?: number;
  avgCost?: number;
  currentPrice?: number;
  assetType?: AssetType;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TxType = 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND';

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  symbol: string | null;
  name: string | null;
  amount: number;
  price: number | null;
  shares: number | null;
  note: string | null;
  createdAt: string;
}

export interface CreateTransactionDto {
  type: TxType;
  symbol?: string;
  name?: string;
  amount: number;
  price?: number;
  shares?: number;
  note?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotifType = 'SUCCESS' | 'WARNING' | 'INFO' | 'ERROR';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: NotifType;
  createdAt: string;
}

// ─── Portfolio Summary ────────────────────────────────────────────────────────

export interface AllocationEntry {
  type: AssetType;
  value: number;
  pct: number;
}

export interface MonthlyHistoryEntry {
  month: string;
  value: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  unrealisedGain: number;
  unrealisedGainPct: number;
  cashBalance: number;
  monthlyReturn: number;
  monthlyReturnPct: number;
  allocationByType: AllocationEntry[];
  monthlyHistory: MonthlyHistoryEntry[];
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
