import { Wallet } from '@/hooks/useFinanceStore';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const change = Math.random() * 10 - 5; // Mock change percentage
  const isPositive = change >= 0;

  return (
    <div className={`bg-gradient-to-br ${wallet.color} p-6 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform cursor-pointer`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{wallet.icon}</div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{Math.abs(change).toFixed(2)}%</span>
        </div>
      </div>
      
      <h3 className="text-white/80 text-sm font-medium mb-1">{wallet.name}</h3>
      <p className="text-2xl font-bold text-white">
        {wallet.balance.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
      </p>
    </div>
  );
}
