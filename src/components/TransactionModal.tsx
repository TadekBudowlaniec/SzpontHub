'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceStore, Transaction } from '@/hooks/useFinanceStore';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, editingTransaction }: TransactionModalProps) {
  const { wallets, addTransaction, editTransaction } = useFinanceStore();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'outcome'>('outcome');

  // Wypełnij formularz jeśli edytujemy
  useEffect(() => {
    if (editingTransaction) {
      // Używamy Math.abs, aby w polu edycji nie wyświetlał się minus (np. -50 -> 50)
      setAmount(Math.abs(editingTransaction.amount).toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) return;

    const selectedWallet = wallets.find(w => w.id === walletId);
    
    // Kluczowa poprawka: Jeśli to wydatek, kwota musi być ujemna
    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'outcome' ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    const transactionData = {
      amount: finalAmount,
      category,
      description,
      wallet: walletId,
      walletName: selectedWallet ? selectedWallet.name : 'Nieznany',
      date,
      type,
    };

    if (editingTransaction) {
      editTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingTransaction ? 'Edytuj Transakcję' : 'Nowa Transakcja'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`p-2 rounded-lg text-center font-medium transition-colors ${
                type === 'income' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Przychód
            </button>
            <button
              type="button"
              onClick={() => setType('outcome')}
              className={`p-2 rounded-lg text-center font-medium transition-colors ${
                type === 'outcome' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Wydatek
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Kwota</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Kategoria</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
              placeholder="np. Jedzenie, Praca"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Opis</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Portfel</label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            >
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>{wallet.name} ({wallet.balance.toLocaleString('pl-PL')} PLN)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors mt-4"
          >
            {editingTransaction ? 'Zapisz zmiany' : 'Dodaj transakcję'}
          </button>
        </form>
      </div>
    </div>
  );
}