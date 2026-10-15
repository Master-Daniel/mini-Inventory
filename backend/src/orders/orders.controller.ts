import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Post()
  createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user, createOrderDto);
  }

  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Get('my-orders')
  findMyOrders(@Request() req) {
    return this.ordersService.findUserOrders(req.user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, updateDto);
  }
}
