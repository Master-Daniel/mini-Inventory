import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { api } from '../services/api';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Incoming Orders</h1>
        <p className="text-gray-600">Review customer orders and update shipment status.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">Order ID: {order.id}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mt-1">
                    Customer: {order.user?.name || 'Customer'} ({order.user?.email})
                  </p>
                  <p className="text-xs text-gray-500">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-indigo-600">₦{Number(order.totalAmount).toFixed(2)}</p>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-1.5 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{item.product?.name || 'Product'}</span>
                      <span className="text-gray-500 text-xs ml-2">SKU: {item.product?.sku}</span>
                    </div>
                    <div className="text-gray-700">
                      {item.quantity} × ₦{Number(item.unitPrice).toFixed(2)} ={' '}
                      <span className="font-semibold">₦{(item.quantity * Number(item.unitPrice)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
