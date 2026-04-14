import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { AssetType } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  symbol: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsPositive()
  shares: number;

  @IsNumber()
  @IsPositive()
  avgCost: number;

  @IsNumber()
  @IsPositive()
  currentPrice: number;

  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;
}
