import { Controller, Get, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: User) {
    return this.portfolioService.getSummary(user.id);
  }
}
