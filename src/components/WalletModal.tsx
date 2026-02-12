'use client';

import { useState, useEffect } from 'react';
import { X, Wallet as WalletIcon } from 'lucide-react';
import { addWalletAction, editWalletAction } from '@/app/actions'; // Importujemy akcje
import { Wallet } from '@/hooks/useFinanceStore';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWallet?: Wallet | null;
}

export function WalletModal({ isOpen, onClose, editingWallet }: WalletModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'fiat' | 'crypto' | 'stock'>('fiat');
  const [color, setColor] = useState('from-blue-500 to-cyan-600');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingWallet) {
      setName(editingWallet.name);
      setType(editingWallet.type);
      setColor(editingWallet.color);
    } else {
      setName('');
      setType('fiat');
      setColor('from-blue-500 to-cyan-600');
    }
  }, [editingWallet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const icon = type === 'crypto' ? '₿' : type === 'stock' ? '📈' : '💵';
    
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-purple-400" /> 
            {editingWallet ? 'Edytuj Portfel' : 'Dodaj Portfel'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nazwa</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
              placeholder="np. Oszczędności"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Typ</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            >
              <option value="fiat">Waluta (PLN/USD)</option>
              <option value="crypto">Kryptowaluty</option>
              <option value="stock">Giełda / Akcje</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Styl</label>
            <div className="flex gap-2">
              {[
                'from-blue-500 to-cyan-600',
                'from-purple-500 to-pink-600',
                'from-green-500 to-emerald-600',
                'from-orange-500 to-red-600'
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} ${color === c ? 'ring-2 ring-white' : ''}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors mt-4"
          >
            {loading ? 'Zapisywanie...' : (editingWallet ? 'Zapisz zmiany' : 'Utwórz portfel')}
          </button>
        </form>
      </div>
    </div>
  );
}