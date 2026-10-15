import React, { useState, useEffect } from 'react';
import { SummaryReport } from '../types';
import { api } from '../services/api';
import { ShoppingCart, TrendingUp, AlertTriangle, Award, Cpu } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSummaryReport()
      .then((data) => setReport(data))
      .catch((err) => setError(err.message || 'Failed to fetch microservice report'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading Golang Analytics Microservice report...</div>;
  }

  if (error || !report) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-red-600 bg-red-50 p-4 rounded-lg">{error || 'Report unavailable'}</div>;
  }

  const topSellingProducts = report.topSellingProducts || [];
  const lowStockProducts = report.lowStockProducts || [];
  const totalRevenue = report.totalRevenue || 0;
  const averageOrderValue = report.averageOrderValue || 0;
  const totalOrders = report.totalOrders || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time inventory & revenue metrics calculated by Golang microservice.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200">
          <Cpu className="w-4 h-4 text-blue-600" /> Golang Analytics Service
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg text-2xl font-bold">
            ₦
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₦{totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-900">₦{averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> Top Selling Products
          </h2>
          {topSellingProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales data recorded yet.</p>
          ) : (
            <div className="divide-y">
              {topSellingProducts.map((p) => (
                <div key={p.productId} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.name || 'Product'}</p>
                    <p className="text-xs text-gray-500">{p.totalQuantitySold} units sold</p>
                  </div>
                  <span className="font-bold text-sm text-indigo-600">₦{(p.totalRevenue || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Warning (≤ 10)
          </h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">All products have sufficient stock.</p>
          ) : (
            <div className="divide-y">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs font-mono text-gray-500">SKU: {p.sku}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    {p.stock} remaining
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
