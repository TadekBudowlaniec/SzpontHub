'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { signOutAction } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallets', label: 'Portfele', icon: Wallet },
  { href: '/transactions', label: 'Transakcje', icon: ArrowLeftRight },
  { href: '/assets', label: 'Aktywa', icon: PiggyBank },
];

export function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOutAction();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">
                <span className="text-primary">$zpont</span>Hub
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-sidebar-foreground/70">Motyw</span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Wyloguj się
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              <span className="text-primary">$zpont</span>Hub
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="p-6 pt-20 lg:pt-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
