import { Wallet } from '@/hooks/useFinanceStore';
import { Edit2, Trash2, Banknote, Bitcoin, TrendingUp, Wallet as WalletIcon, CreditCard, PiggyBank } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  banknote: Banknote,
  bitcoin: Bitcoin,
  trending: TrendingUp,
  wallet: WalletIcon,
  card: CreditCard,
  piggy: PiggyBank,
};

const typeLabels: Record<string, string> = {
  fiat: 'Waluta',
  crypto: 'Crypto',
  stock: 'Giełda',
};

interface WalletCardProps {
  wallet: Wallet;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (id: string) => void;
}

export function WalletCard({ wallet, onEdit, onDelete }: WalletCardProps) {
  const IconComponent = iconMap[wallet.icon] || WalletIcon;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${wallet.color} p-[1px] group transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}>
      {/* Animated shine on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      </div>

      {/* Inner card */}
      <div className={`relative rounded-[calc(1rem-1px)] bg-gradient-to-br ${wallet.color} p-5 h-full`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.07] rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/[0.06] rounded-full translate-y-10 -translate-x-10" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/[0.04] rounded-full blur-xl" />

        {/* Mesh pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${wallet.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${wallet.id})`} />
        </svg>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(wallet); }}
              className="p-1.5 bg-white/15 hover:bg-white/30 rounded-lg backdrop-blur-md transition-colors"
              title="Edytuj"
            >
              <Edit2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(wallet.id); }}
              className="p-1.5 bg-white/15 hover:bg-red-500/70 rounded-lg backdrop-blur-md transition-colors"
              title="Usuń"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full min-h-[140px]">
          {/* Top row: icon + type badge */}
          <div className="flex items-start justify-between mb-auto">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/5">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-white/70 uppercase tracking-[0.15em] bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
              {typeLabels[wallet.type] || wallet.type}
            </span>
          </div>

          {/* Bottom: name + balance */}
          <div className="mt-5">
            <p className="text-sm font-medium text-white/70 mb-0.5 truncate">{wallet.name}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {wallet.balance.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-sm font-medium text-white/60">PLN</span>
            </div>
          </div>

          {/* Card dots decoration */}
          <div className="flex gap-1.5 mt-3">
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[5px] h-[5px] rounded-full bg-white/25" />
              ))}
            </div>
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[5px] h-[5px] rounded-full bg-white/25" />
              ))}
            </div>
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[5px] h-[5px] rounded-full bg-white/15" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
