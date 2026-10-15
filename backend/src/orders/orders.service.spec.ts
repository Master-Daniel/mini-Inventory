import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockQueryRunner: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn((entityClass, data) => data),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn(() => mockQueryRunner),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if order items are empty', async () => {
    await expect(service.createOrder({ id: 'u1' }, { items: [] })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException if product is not found', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

    await expect(
      service.createOrder({ id: 'u1' }, { items: [{ productId: 'invalid', quantity: 1 }] }),
    ).rejects.toThrow(NotFoundException);
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('should throw BadRequestException if stock is insufficient', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValueOnce({
      id: 'p1',
      name: 'Keyboard',
      stock: 1,
      price: 100,
    });

    await expect(
      service.createOrder({ id: 'u1' }, { items: [{ productId: 'p1', quantity: 5 }] }),
    ).rejects.toThrow(BadRequestException);
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('should successfully place an order and deduct stock', async () => {
    const mockProduct = {
      id: 'p1',
      name: 'Keyboard',
      stock: 10,
      price: 100,
    };
    const mockUser = { id: 'u1', email: 'test@example.com' };

    mockQueryRunner.manager.findOne
      .mockResolvedValueOnce(mockProduct)
      .mockResolvedValueOnce(mockUser);

    mockQueryRunner.manager.save.mockImplementation((item) => Promise.resolve(item));

    const result = await service.createOrder(
      { id: 'u1' },
      { items: [{ productId: 'p1', quantity: 2 }] },
    );

    expect(mockProduct.stock).toBe(8);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(result.totalAmount).toBe(200);
  });
});
