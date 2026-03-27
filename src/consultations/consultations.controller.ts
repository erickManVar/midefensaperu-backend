import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import {
  CreateConsultationSchema, CreateConsultationDto,
  PayConsultationSchema, PayConsultationDto,
  DisputeConsultationSchema, DisputeConsultationDto,
} from './consultations.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(CreateConsultationSchema)) dto: CreateConsultationDto,
  ) {
    return this.consultationsService.createConsultation(user.id, dto);
  }

  @Post(':id/pay')
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  async pay(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(PayConsultationSchema)) dto: PayConsultationDto,
  ) {
    return this.consultationsService.payConsultation(id, user.id, dto);
  }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  async confirm(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.consultationsService.confirmConsultation(id, user.id);
  }

  @Post(':id/dispute')
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  async dispute(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(DisputeConsultationSchema)) dto: DisputeConsultationDto,
  ) {
    return this.consultationsService.disputeConsultation(id, user.id, dto);
  }

  @Get('my')
  async getMy(@CurrentUser() user: CurrentUserData) {
    if (user.role === 'CLIENT') {
      return this.consultationsService.getClientConsultations(user.id);
    }
    return this.consultationsService.getLawyerConsultations(user.id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.consultationsService.getConsultation(id, user.id);
  }
}
