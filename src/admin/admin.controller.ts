import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('lawyers/pending') async pendingLawyers() { return this.adminService.getPendingLawyers(); }
  @Post('lawyers/:id/verify') async verify(@Param('id') id: string) { return this.adminService.verifyLawyer(id); }
  @Post('lawyers/:id/suspend') async suspend(@Param('id') id: string) { return this.adminService.suspendLawyer(id); }
  @Get('bypass-attempts') async bypassAttempts() { return this.adminService.getBypassAttempts(); }
  @Get('consultations/disputed') async disputed() { return this.adminService.getDisputedConsultations(); }
  @Post('consultations/:id/resolve') async resolve(@Param('id') id: string, @Body() body: { favor: 'CLIENT' | 'LAWYER' }) { return this.adminService.resolveDispute(id, body.favor); }
  @Get('stats') async stats() { return this.adminService.getStats(); }
}
