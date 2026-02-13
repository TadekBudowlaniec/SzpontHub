'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error.message, error.status);
        setError(error.message === 'Invalid login credentials'
          ? 'Nieprawidłowy email lub hasło. Jeśli konto było tworzone przed migracją, zarejestruj się ponownie.'
          : error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Wystąpił błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-accent border border-primary/30 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-1">
            Witaj w <span className="text-primary">$zpont</span><span className="text-primary">Hub</span>
          </h1>
          <p className="text-muted-foreground text-sm">Zaloguj się, aby zarządzać finansami</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
              placeholder="jan@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hasło</label>
            <input
              type="password"
              required
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Nie masz jeszcze konta?{' '}
          <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  );
}
