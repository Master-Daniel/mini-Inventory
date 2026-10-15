const API_BASE = '/api';
const ANALYTICS_BASE = '/analytics';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const safeJson = async (res: Response) => {
  const text = await res.text();
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text);
    return {};
  }
};

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  register: async (userData: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return safeJson(res);
  },

  // Products
  getProducts: async () => {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return safeJson(res);
  },

  createProduct: async (product: any) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    return data;
  },

  updateProduct: async (id: string, product: any) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to update product');
    return data;
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  },

  // Orders
  createOrder: async (items: { productId: string; quantity: number }[]) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    return data;
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user orders');
    return safeJson(res);
  },

  getAllOrders: async () => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch all orders');
    return safeJson(res);
  },

  updateOrderStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  // Analytics (Go Microservice)
  getSummaryReport: async () => {
    const res = await fetch(`${ANALYTICS_BASE}/reports/summary`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics report');
    return safeJson(res);
  },
};
