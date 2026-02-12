'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceStore, Transaction } from '@/hooks/useFinanceStore';
// Importujemy Server Actions
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingTransaction ? 'Edytuj Transakcję' : 'Nowa Transakcja'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`p-2 rounded-lg text-center font-medium transition-colors ${
                type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Przychód
            </button>
            <button
              type="button"
              onClick={() => setType('outcome')}
              className={`p-2 rounded-lg text-center font-medium transition-colors ${
                type === 'outcome' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Wydatek
            </button>
          </div>

          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            placeholder="Kwota"
          />
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            placeholder="Kategoria"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            placeholder="Opis (opcjonalnie)"
          />
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
          >
            {wallets.length === 0 && <option value="">Brak portfeli</option>}
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.balance.toLocaleString()} PLN)</option>
            ))}
          </select>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
          />

          <button
            type="submit"
            disabled={loading || wallets.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors mt-4"
          >
            {loading ? 'Zapisywanie...' : (editingTransaction ? 'Zapisz zmiany' : 'Dodaj transakcję')}
          </button>
        </form>
      </div>
    </div>
  );
}