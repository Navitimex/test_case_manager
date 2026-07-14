'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { authApi } from '@/lib/api';
import { LayoutGrid, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, setAuth } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { user: loggedIn } = await authApi.login(email, password);
        setAuth(loggedIn);
      } else {
        if (!name.trim()) { setError('Name is required.'); setLoading(false); return; }
        const { user: registered } = await authApi.register(name.trim(), email, password);
        setAuth(registered);
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : mode === 'login' ? 'Login failed' : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg border border-[#DFE1E6] shadow-sm w-full max-w-sm p-8">
        <div className="flex items-center justify-center mb-8">
          <LayoutGrid className="text-[#0C66E4] mr-2" size={24} strokeWidth={2} />
          <span className="text-xl font-semibold text-[#172B4D] tracking-tight">TestFlow</span>
        </div>

        <h1 className="text-lg font-semibold text-[#172B4D] mb-1">
          {mode === 'login' ? 'Sign in to continue' : 'Create an account'}
        </h1>
        <p className="text-sm text-[#6B778C] mb-6">Test Case Management System</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-[#BF2600] bg-[#FFEBE6] px-3 py-2 rounded-md">{error}</div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#6B778C] uppercase tracking-wide mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="Jane Smith"
                className="w-full text-sm px-3 py-2 rounded-md border border-[#DFE1E6] text-[#172B4D] focus:outline-none focus:border-[#0C66E4] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6B778C] uppercase tracking-wide mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === 'login'}
              placeholder="you@example.com"
              className="w-full text-sm px-3 py-2 rounded-md border border-[#DFE1E6] text-[#172B4D] focus:outline-none focus:border-[#0C66E4] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B778C] uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full text-sm px-3 py-2 rounded-md border border-[#DFE1E6] text-[#172B4D] focus:outline-none focus:border-[#0C66E4] transition-colors"
            />
            {mode === 'register' && (
              <p className="text-xs text-[#6B778C] mt-1">Minimum 8 characters.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium bg-[#0C66E4] text-white rounded-md hover:bg-[#0052CC] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading
              ? mode === 'login' ? 'Signing in…' : 'Creating account…'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B778C]">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                onClick={() => switchMode('register')}
                className="text-[#0C66E4] hover:underline font-medium"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-[#0C66E4] hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>
        {mode === 'register' && (
          <p className="mt-2 text-center text-xs text-[#6B778C]">
            New accounts are created as <span className="font-medium">USER</span> (read-only). An admin can promote your role.
          </p>
        )}
      </div>
    </div>
  );
}
