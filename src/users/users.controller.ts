import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me') async me(@CurrentUser() user: CurrentUserData) { return this.usersService.findById(user.id); }
  @Put('me') async update(@CurrentUser() user: CurrentUserData, @Body() dto: any) { return this.usersService.updateProfile(user.id, dto); }
}
