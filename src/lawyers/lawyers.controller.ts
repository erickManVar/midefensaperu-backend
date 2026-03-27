import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import {
  CreateLawyerProfileSchema,
  UpdateLawyerProfileSchema,
  SearchLawyersSchema,
  CreateLawyerProfileDto,
  UpdateLawyerProfileDto,
  SearchLawyersDto,
} from './lawyers.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Get('search')
  async search(@Query(new ZodValidationPipe(SearchLawyersSchema)) query: SearchLawyersDto) {
    return this.lawyersService.searchLawyers(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.lawyersService.getProfileById(id);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LAWYER')
  async createProfile(
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(CreateLawyerProfileSchema)) dto: CreateLawyerProfileDto,
  ) {
    return this.lawyersService.createProfile(user.id, dto);
  }

  @Get('my/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LAWYER')
  async getMyProfile(@CurrentUser() user: CurrentUserData) {
    return this.lawyersService.getProfile(user.id);
  }

  @Put('my/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LAWYER')
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(UpdateLawyerProfileSchema)) dto: UpdateLawyerProfileDto,
  ) {
    return this.lawyersService.updateProfile(user.id, dto);
  }
}
