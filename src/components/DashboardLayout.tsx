import { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, TrendingUp, Wallet, Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Zaktualizowane Logo
  const Logo = () => (
    <div className="flex items-center font-extrabold text-xl tracking-tight">
      <span className="text-emerald-400 text-2xl">$</span>
      <span className="text-emerald-400">zpont</span>
      <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent ml-1.5">Hub</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 z-50 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-purple-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <Logo />
          </div>
          
          <nav className="space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link href="#wallets" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Portfele</span>
            </Link>
            
            <Link href="#assets" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Inwestycje</span>
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              JK
            </div>
            <div>
              <p className="text-sm font-medium text-white">Jan Kowalski</p>
              <p className="text-xs text-gray-400">jan@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}