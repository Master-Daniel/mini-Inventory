import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { api } from '../services/api';
import { Package, Clock, CheckCircle2, Truck, AlertTriangle } from 'lucide-react';

export const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getMyOrders()
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600">Track and review your previous orders.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading order history...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-sm">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-2">
                <div>
                  <span className="text-xs font-mono text-gray-500">Order ID: {order.id}</span>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(order.status)}
                  <span className="text-lg font-bold text-gray-900">₦{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{item.product?.name || 'Product'}</p>
                      <p className="text-gray-500">
                        Qty: {item.quantity} × ₦{Number(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">
                      ₦{(item.quantity * Number(item.unitPrice)).toFixed(2)}
                    </span>
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
