export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

export interface Order {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  user?: User;
  items: OrderItem[];
}

export interface SummaryReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    price: number;
  }[];
  topSellingProducts: {
    productId: string;
    name: string;
    totalQuantitySold: number;
    totalRevenue: number;
  }[];
}
