'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceStore, Transaction } from '@/hooks/useFinanceStore';
import { addTransactionAction, editTransactionAction } from '@/app/actions';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, editingTransaction }: TransactionModalProps) {
  const { wallets } = useFinanceStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'outcome'>('outcome');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setAmount(Math.abs(editingTransaction.amount).toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description || '');
      setWalletId(editingTransaction.wallet);
      setDate(editingTransaction.date);
      setType(editingTransaction.type);
    } else {
      setAmount('');
      setCategory('');
      setDescription('');
      if (wallets.length > 0) setWalletId(wallets[0].id);
      setDate(new Date().toISOString().split('T')[0]);
      setType('outcome');
    }
  }, [editingTransaction, isOpen, wallets]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) return;
    setLoading(true);

    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'outcome' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    const transactionData = {
      amount: finalAmount,
      category,
      description,
      wallet: walletId,
      date,
      type,
    };

    try {
      if (editingTransaction) {
        await editTransactionAction(editingTransaction.id, transactionData);
      } else {
        await addTransactionAction(transactionData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd zapisu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-card-foreground">
            {editingTransaction ? 'Edytuj Transakcję' : 'Nowa Transakcja'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-lg text-center font-medium transition-colors ${
                type === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              Przychód
            </button>
            <button
              type="button"
              onClick={() => setType('outcome')}
              className={`py-2.5 rounded-lg text-center font-medium transition-colors ${
                type === 'outcome'
                  ? 'bg-red-600 text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              Wydatek
            </button>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Kwota</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Kategoria</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="np. Jedzenie"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Opis (opcjonalnie)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="Dodatkowy opis..."
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Portfel</label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {wallets.length === 0 && <option value="">Brak portfeli</option>}
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.balance.toLocaleString()} PLN)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || wallets.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Zapisywanie...' : (editingTransaction ? 'Zapisz zmiany' : 'Dodaj transakcję')}
          </button>
        </form>
      </div>
    </div>
  );
}
