import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TxType } from '@prisma/client';

export class CreateTransactionDto {
  @IsEnum(TxType)
  type: TxType;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  symbol?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  shares?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
