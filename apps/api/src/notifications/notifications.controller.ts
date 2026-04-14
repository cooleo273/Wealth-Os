import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notifService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.notifService.findAll(user.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: User) {
    return this.notifService.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifService.markRead(user.id, id);
  }
}
