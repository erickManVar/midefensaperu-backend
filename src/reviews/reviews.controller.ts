import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';
const CreateReviewSchema = z.object({ consultationId: z.string().uuid(), rating: z.number().int().min(1).max(5), comentario: z.string().optional() });
const UpdateReviewSchema = z.object({ rating: z.number().int().min(1).max(5).optional(), comentario: z.string().optional() });
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  async create(@CurrentUser() user: CurrentUserData, @Body(new ZodValidationPipe(CreateReviewSchema)) dto: z.infer<typeof CreateReviewSchema>) {
    return this.reviewsService.createReview(user.id, dto);
  }
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  async update(@Param('id') id: string, @CurrentUser() user: CurrentUserData, @Body(new ZodValidationPipe(UpdateReviewSchema)) dto: z.infer<typeof UpdateReviewSchema>) {
    return this.reviewsService.updateReview(id, user.id, dto);
  }
  @Get('lawyer/:lawyerId')
  async getLawyerReviews(@Param('lawyerId') lawyerId: string) {
    return this.reviewsService.getLawyerReviews(lawyerId);
  }
}
