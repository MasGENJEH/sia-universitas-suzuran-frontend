import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.message || 'Email atau password salah.');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi internet bermasalah atau server mati.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-monday-background px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[480px] bg-white border border-monday-border rounded-3xl p-8 shadow-sm flex flex-col gap-6 transition-300 hover:shadow-md">
        
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="bg-monday-blue p-3 rounded-2xl text-white">
            <Layers size={26} />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-monday-black uppercase tracking-tight leading-none">SIAKAD</h1>
            <p className="text-[10px] text-monday-gray font-extrabold tracking-widest uppercase mt-1">SUZURAN PORTAL</p>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="font-extrabold text-xl text-monday-black">Selamat Datang Kembali</h2>
          <p className="text-sm text-monday-gray font-medium">Masuk untuk mengakses portal akademik Anda</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-monday-red/10 border border-monday-red/20 text-monday-red p-4 rounded-2xl text-sm font-semibold">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-monday-black uppercase tracking-wider pl-1" htmlFor="email">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-monday-gray" size={18} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-12 pr-4 py-3.5 bg-monday-background border border-transparent rounded-2xl text-sm font-semibold text-monday-black placeholder-monday-gray/50 focus:border-monday-blue focus:bg-[var(--monday-card)] focus:outline-none transition-300"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-monday-black uppercase tracking-wider pl-1" htmlFor="password">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-monday-gray" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-monday-background border border-transparent rounded-2xl text-sm font-semibold text-monday-black placeholder-monday-gray/50 focus:border-monday-blue focus:bg-[var(--monday-card)] focus:outline-none transition-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-monday-gray hover:text-monday-black transition-300 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 rounded-2xl text-sm font-bold text-white blue-gradient hover:bg-opacity-90 shadow-md hover:shadow-lg disabled:opacity-50 transition-300 mt-2 gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="text-center text-xs text-monday-gray font-bold border-t border-monday-border pt-4 mt-2">
          <p>SIAKAD v1.0.0 &copy; 2026</p>
          <p className="text-[10px] text-monday-blue mt-0.5 uppercase tracking-wide">Sistem Informasi Akademik Suzuran</p>
        </div>

      </div>
    </div>
  );
}
