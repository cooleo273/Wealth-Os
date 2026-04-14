import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  themePreference?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}
