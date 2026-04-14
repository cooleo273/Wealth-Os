import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['refresh_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET', 'fallback_refresh'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }) {
    const rawToken: string | undefined = req?.cookies?.['refresh_token'];
    if (!rawToken) throw new UnauthorizedException('No refresh token');

    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });

    const matched = await Promise.all(
      tokens.map((t) => bcrypt.compare(rawToken, t.tokenHash)),
    );
    const validToken = tokens.find((_t, i) => matched[i]);
    if (!validToken) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true, settings: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    return { ...user, refreshTokenId: validToken.id };
  }
}
