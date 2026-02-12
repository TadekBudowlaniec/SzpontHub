import { Wallet } from '@/hooks/useFinanceStore';
import { Edit2, Trash2 } from 'lucide-react';

interface WalletCardProps {
  wallet: Wallet;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (id: string) => void;
}

export function WalletCard({ wallet, onEdit, onDelete }: WalletCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${wallet.color} p-6 text-white shadow-lg transition-transform hover:scale-[1.02] group`}>
      {/* Tło ozdobne */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20"></div>
      
      {/* Przyciski Akcji (widoczne po najechaniu) */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(wallet); }}
            className="p-1.5 bg-black/20 hover:bg-black/40 rounded-lg backdrop-blur-sm transition-colors"
            title="Edytuj"
          >
            <Edit2 className="w-3.5 h-3.5 text-white" />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(wallet.id); }}
            className="p-1.5 bg-black/20 hover:bg-red-500/80 rounded-lg backdrop-blur-sm transition-colors"
            title="Usuń"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-xl">
            {wallet.icon}
          </div>
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider bg-black/10 px-2 py-1 rounded-md">
            {wallet.type}
          </span>
        </div>
        
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{wallet.name}</p>
          <h3 className="text-2xl font-bold tracking-tight">
            {wallet.balance.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </h3>
        </div>
      </div>
    </div>
  );
}