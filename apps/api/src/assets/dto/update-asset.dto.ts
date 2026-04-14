import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { AssetType } from '@prisma/client';

export class UpdateAssetDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  shares?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  avgCost?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  currentPrice?: number;

  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;
}
