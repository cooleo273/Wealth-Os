import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, limit?: number, month?: string) {
    const where: Record<string, unknown> = { userId };

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      where['createdAt'] = { gte: start, lt: end };
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ?? 50,
    });
  }

  create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        symbol: dto.symbol?.toUpperCase() ?? null,
        name: dto.name ?? null,
        amount: dto.amount,
        price: dto.price ?? null,
        shares: dto.shares ?? null,
        note: dto.note ?? null,
      },
    });
  }
}
