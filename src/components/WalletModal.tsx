'use client';

import { useState, useEffect } from 'react';
import { X, Wallet as WalletIcon, Banknote, Bitcoin, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';
import { addWalletAction, editWalletAction } from '@/app/actions';
import { Wallet } from '@/hooks/useFinanceStore';

const iconOptions = [
  { name: 'wallet', icon: WalletIcon },
  { name: 'banknote', icon: Banknote },
  { name: 'bitcoin', icon: Bitcoin },
  { name: 'trending', icon: TrendingUp },
  { name: 'card', icon: CreditCard },
  { name: 'piggy', icon: PiggyBank },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWallet?: Wallet | null;
}

export function WalletModal({ isOpen, onClose, editingWallet }: WalletModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'fiat' | 'crypto' | 'stock'>('fiat');
  const [color, setColor] = useState('from-violet-600 to-purple-500');
  const [icon, setIcon] = useState('wallet');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingWallet) {
      setName(editingWallet.name);
      setType(editingWallet.type);
      setColor(editingWallet.color);
      setIcon(editingWallet.icon || 'wallet');
    } else {
      setName('');
      setType('fiat');
      setColor('from-violet-600 to-purple-500');
      setIcon('wallet');
    }
  }, [editingWallet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingWallet) {
        await editWalletAction(editingWallet.id, { name, type, color, icon });
      } else {
        await addWalletAction({ name, type, color, icon });
      }
      onClose();
    } catch (error) {
      alert('Błąd zapisu portfela');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-primary" />
            {editingWallet ? 'Edytuj Portfel' : 'Dodaj Portfel'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Nazwa</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="np. Oszczędności"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Typ</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              <option value="fiat">Waluta (PLN/USD)</option>
              <option value="crypto">Kryptowaluty</option>
              <option value="stock">Giełda / Akcje</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Ikona</label>
            <div className="flex gap-2">
              {iconOptions.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setIcon(opt.name)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      icon === opt.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Kolor</label>
            <div className="flex gap-2 flex-wrap">
              {[
                'from-violet-600 to-purple-500',
                'from-indigo-500 to-blue-600',
                'from-blue-500 to-cyan-500',
                'from-emerald-500 to-teal-600',
                'from-amber-500 to-orange-600',
                'from-rose-500 to-pink-600',
                'from-fuchsia-500 to-violet-600',
                'from-slate-700 to-zinc-800',
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} transition-transform ${color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Zapisywanie...' : (editingWallet ? 'Zapisz zmiany' : 'Utwórz portfel')}
          </button>
        </form>
      </div>
    </div>
  );
}
