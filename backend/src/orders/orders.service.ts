import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';

@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}

  async createOrder(user: { id: string }, createOrderDto: CreateOrderDto): Promise<Order> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order items cannot be empty');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        // Lock row for update to prevent concurrent race condition stock over-drafts
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
        }

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". Requested: ${itemDto.quantity}, Available: ${product.stock}`,
          );
        }

        // Deduct inventory stock
        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * itemDto.quantity;

        const orderItem = queryRunner.manager.create(OrderItem, {
          product,
          quantity: itemDto.quantity,
          unitPrice,
        });
        orderItems.push(orderItem);
      }

      const dbUser = await queryRunner.manager.findOne(User, { where: { id: user.id } });
      if (!dbUser) {
        throw new NotFoundException('User not found');
      }

      const order = queryRunner.manager.create(Order, {
        user: dbUser,
        status: OrderStatus.PENDING,
        totalAmount: Math.round(totalAmount * 100) / 100,
        items: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.dataSource.getRepository(Order).find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllOrders(): Promise<Order[]> {
    return this.dataSource.getRepository(Order).find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateDto.status;
    return this.dataSource.getRepository(Order).save(order);
  }
}
