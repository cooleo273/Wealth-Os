import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        profile: {
          create: { fullName: dto.fullName ?? null },
        },
        settings: {
          create: {},
        },
      },
      include: { profile: true, settings: true },
    });

    await this.mail.sendWelcome(user.email, dto.fullName ?? '');

    const { passwordHash: _pw, ...safeUser } = user;
    return safeUser;
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(userId: string, email: string, role: string, oldTokenId: string) {
    await this.prisma.refreshToken.delete({ where: { id: oldTokenId } });
    const tokens = await this.generateTokens(userId, email, role);
    await this.storeRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string, tokenId?: string) {
    if (tokenId) {
      await this.prisma.refreshToken.deleteMany({
        where: { id: tokenId, userId },
      });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, settings: true },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash: _pw, ...safeUser } = user;
    return safeUser;
  }
}
