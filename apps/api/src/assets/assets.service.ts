import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        userId,
        symbol: dto.symbol.toUpperCase(),
        name: dto.name,
        shares: dto.shares,
        avgCost: dto.avgCost,
        currentPrice: dto.currentPrice,
        assetType: dto.assetType ?? 'STOCK',
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAssetDto) {
    await this.assertOwner(userId, id);
    return this.prisma.asset.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    await this.prisma.asset.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertOwner(userId: string, id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    if (asset.userId !== userId) throw new ForbiddenException('Not your asset');
  }
}
