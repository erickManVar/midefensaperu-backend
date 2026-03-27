import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}
  @Get('products')
  @UseGuards(RolesGuard)
  @Roles('LAWYER', 'PROVIDER', 'ADMIN')
  async getProducts(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.storeService.getProducts(cursor, limit ? parseInt(limit) : 10);
  }
  @Post('products')
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  async createProduct(@CurrentUser() user: CurrentUserData, @Body() dto: any) {
    return this.storeService.createProduct(user.id, dto);
  }
  @Put('products/:id')
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  async updateProduct(@Param('id') id: string, @CurrentUser() user: CurrentUserData, @Body() dto: any) {
    return this.storeService.updateProduct(id, user.id, dto);
  }
  @Post('products/:id/buy')
  @UseGuards(RolesGuard)
  @Roles('LAWYER')
  async buy(@Param('id') id: string, @CurrentUser() user: CurrentUserData, @Body() body: { cantidad: number; culqiToken: string; email: string }) {
    return this.storeService.buyProduct(user.id, id, body.cantidad, body.culqiToken, body.email);
  }
  @Get('my-products')
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  async myProducts(@CurrentUser() user: CurrentUserData) {
    return this.storeService.getProviderProducts(user.id);
  }
}
