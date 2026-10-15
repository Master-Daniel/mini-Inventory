import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'inventory_db',
    entities: [User, Product, Order, OrderItem],
    synchronize: true,
  });

  await ds.initialize();
  console.log('Seeding database...');

  const userRepo = ds.getRepository(User);
  const productRepo = ds.getRepository(Product);

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  let admin = await userRepo.findOne({ where: { email: 'admin@example.com' } });
  if (!admin) {
    admin = userRepo.create({
      email: 'admin@example.com',
      password: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
  }

  let customer = await userRepo.findOne({ where: { email: 'customer@example.com' } });
  if (!customer) {
    customer = userRepo.create({
      email: 'customer@example.com',
      password: customerPassword,
      name: 'John Doe',
      role: UserRole.CUSTOMER,
    });
    await userRepo.save(customer);
  }

  // Products
  const productsData = [
    { name: 'Ergonomic Mechanical Keyboard', description: 'Wireless mechanical keyboard with RGB backlighting and tactile switches.', price: 129.99, stock: 50, sku: 'SKU-KB-01' },
    { name: 'Precision Wireless Mouse', description: 'High precision optical mouse with programmable buttons.', price: 59.99, stock: 100, sku: 'SKU-MS-02' },
    { name: '4K Ultra HD Monitor 27"', description: '27-inch IPS display with 4K resolution and 144Hz refresh rate.', price: 349.50, stock: 15, sku: 'SKU-MN-03' },
    { name: 'Noise-Canceling Headphones', description: 'Over-ear Bluetooth headphones with active noise cancellation.', price: 199.99, stock: 30, sku: 'SKU-HP-04' },
    { name: 'USB-C Docking Station', description: 'Multi-port USB-C hub with HDMI, Ethernet, and 100W Power Delivery.', price: 79.99, stock: 8, sku: 'SKU-DK-05' },
  ];

  for (const pData of productsData) {
    let p = await productRepo.findOne({ where: { sku: pData.sku } });
    if (!p) {
      p = productRepo.create(pData);
      await productRepo.save(p);
    }
  }

  console.log('Seeding completed successfully!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
