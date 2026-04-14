import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private txService: TransactionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('month') month?: string,
  ) {
    return this.txService.findAll(
      user.id,
      limit ? parseInt(limit, 10) : undefined,
      month,
    );
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTransactionDto) {
    return this.txService.create(user.id, dto);
  }
}
