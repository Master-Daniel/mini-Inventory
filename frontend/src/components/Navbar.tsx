import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Package, BarChart3, LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <Package className="w-6 h-6" />
              <span>InventoryHub</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                {user.role === 'admin' ? (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-indigo-600 flex items-center gap-1.5">
                      <Package className="w-4 h-4" /> Products
                    </Link>
                    <Link to="/admin/orders" className="text-gray-700 hover:text-indigo-600 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" /> Orders
                    </Link>
                    <Link to="/admin/analytics" className="text-gray-700 hover:text-indigo-600 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4" /> Analytics
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-indigo-600 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" /> Catalog
                    </Link>
                    <Link to="/my-orders" className="text-gray-700 hover:text-indigo-600 flex items-center gap-1.5">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border">
                  {user.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
