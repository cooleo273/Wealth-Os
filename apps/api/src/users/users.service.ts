import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, settings: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _pw, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
    return profile;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const settings = await this.prisma.settings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
    return settings;
  }
}
