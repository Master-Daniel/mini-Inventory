import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LogIn, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isRegister) {
        const res = await api.register({ email, password, name, role });
        login(res);
      } else {
        const res = await api.login({ email, password });
        login(res);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(demoEmail.startsWith('admin') ? 'admin123' : 'customer123');
    try {
      const res = await api.login({
        email: demoEmail,
        password: demoEmail.startsWith('admin') ? 'admin123' : 'customer123',
      });
      login(res);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white border rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {isRegister ? 'Sign up to place orders' : 'Log in to manage or browse orders'}
        </p>

        {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
                className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {isRegister ? 'Log In' : 'Sign Up'}
          </button>
        </div>

        {/* Quick Demo Login Helpers */}
        <div className="mt-8 border-t pt-4">
          <p className="text-xs text-gray-500 text-center mb-2 font-medium">QUICK DEMO LOGIN</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('customer@example.com')}
              className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition"
            >
              Demo Customer
            </button>
            <button
              onClick={() => handleDemoLogin('admin@example.com')}
              className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
