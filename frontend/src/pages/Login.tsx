import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { enhancedApi } from '../services/enhanced-api';
import type { User } from '../types';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await enhancedApi.post<{ access_token: string; user: User }>('/auth/login', { username, password });
      const { access_token, user } = response.data;
      
      login(access_token, user);
      
      // Save login information if "Remember me" is selected
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      navigate('/');
    } catch (err: unknown) {
      console.error('Login failed', err);
      const hasResponse = typeof err === 'object' && err !== null && 'response' in (err as object);
      const message =
        hasResponse
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid username or password'
          : 'Invalid username or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Load saved username when component mounts and activate dark mode
  React.useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
    
    // Activate dark mode for login page
    document.documentElement.classList.add('dark');
    
    // Cleanup: remove dark mode when component unmounts (if needed)
    return () => {
      // Don't remove dark mode here as other pages might also use dark mode
      // document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex items-stretch overflow-hidden">
      {/* Left Panel: Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-surface-dark overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-primary/10 z-10"></div>
          <div 
            className="w-full h-full bg-cover bg-center opacity-60" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          ></div>
        </div>
        
        {/* Top Branding */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            KFC MEGA MARKET <span className="text-primary font-extrabold">SCM</span>
          </h1>
        </div>
        
        {/* Bottom Text */}
        <div className="relative z-20 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Comprehensive Supply Chain Management
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            ERP system that optimizes warehouse operations, tracks real-time inventory, and manages distribution for KFC stores nationwide.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 border-2 border-background-dark rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                K
              </div>
              <div className="w-10 h-10 border-2 border-background-dark rounded-full bg-primary/80 flex items-center justify-center text-white text-xs font-bold">
                F
              </div>
              <div className="w-10 h-10 border-2 border-background-dark rounded-full bg-primary/60 flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-primary border-2 border-background-dark rounded-full hover:bg-red-700">
                +99
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-white text-sm font-bold">120+ Warehouses</span>
              <span className="text-gray-400 text-xs">Active on the system</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        {/* Mobile Background (visible only on small screens) */}
        <div className="absolute inset-0 lg:hidden -z-10 bg-background-dark">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background-dark"></div>
        </div>
        
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
            <h1 className="text-white text-lg font-bold">KFC SCM</h1>
          </div>
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Please enter your credentials to access the ERP system.</p>
          </div>

          {/* Form Fields */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Username / Email</label>
              <div className="relative flex w-full items-center">
                <div className="absolute left-4 text-[#b89d9f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input
                  className="w-full rounded-lg bg-surface-dark border border-[#382929] text-white placeholder-[#6d5a5c] h-12 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter employee ID or company email"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-white text-sm font-medium">Password</label>
              </div>
              <div className="relative flex w-full items-center">
                <div className="absolute left-4 text-[#b89d9f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  className="w-full rounded-lg bg-surface-dark border border-[#382929] text-white placeholder-[#6d5a5c] h-12 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-4 text-[#b89d9f] hover:text-white flex items-center justify-center transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="rounded border-[#533c3d] bg-surface-dark text-primary focus:ring-offset-background-dark focus:ring-primary/50 w-4 h-4 cursor-pointer"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-[#b89d9f] text-sm group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <a className="text-sm font-semibold text-primary hover:text-red-400 transition-colors cursor-pointer" href="#">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-primary hover:bg-red-600 text-white font-bold rounded-lg h-12 mt-2 shadow-[0_0_15px_rgba(234,42,51,0.4)] hover:shadow-[0_0_20px_rgba(234,42,51,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Logging in...' : 'LOGIN TO SYSTEM'}</span>
              {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </form>

          {/* Footer / Help */}
          <div className="mt-8 pt-6 border-t border-[#382929] flex flex-col items-center gap-4">
            <p className="text-[#b89d9f] text-sm text-center">
              Having trouble logging in? <br/>
              <a className="text-white font-semibold hover:text-primary transition-colors cursor-pointer" href="#">
                Contact IT Support
              </a>
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-dark border border-[#382929]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-gray-400 font-medium">System operating normally</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 text-center">
            <p className="text-[#533c3d] text-xs">© 2024 KFC Mega Market SCM. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
