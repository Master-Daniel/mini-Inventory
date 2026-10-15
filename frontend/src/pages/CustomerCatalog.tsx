import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export const CustomerCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const savedCart = localStorage.getItem('shopping_cart');
      if (!savedCart || savedCart === 'undefined' || savedCart === 'null') return [];
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shopping_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      setError(null);
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      await api.createOrder(items);
      setCart([]);
      localStorage.removeItem('shopping_cart');
      setIsCartOpen(false);
      setOrderSuccess(true);
      fetchProducts();
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner / Success alert */}
      {orderSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Order placed successfully! Check your order history to track progress.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Products</h1>
          <p className="text-gray-600">Browse inventory and place orders instantly.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
          />

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.sku}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description || 'No description available.'}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-indigo-600">₦{Number(product.price).toFixed(2)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>

                <button
                  disabled={product.stock === 0}
                  onClick={() => addToCart(product)}
                  className="w-full py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  Your Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700 text-lg">
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
                ) : (
                  cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">₦{Number(product.price).toFixed(2)} each</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded">
                          <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-gray-100" title="Decrease quantity">
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="px-2 text-sm font-medium">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-gray-100" title="Increase quantity">
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-gray-900 w-16 text-right">
                          ₦{(product.price * quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-indigo-600">₦{totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                >
                  Complete Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
