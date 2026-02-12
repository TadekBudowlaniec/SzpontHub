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
  // Pobieramy tylko listę portfeli ze store (do wyświetlenia w select)
  const { wallets } = useFinanceStore();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'outcome'>('outcome');
  const [loading, setLoading] = useState(false);

  // Wypełnij formularz jeśli edytujemy
  useEffect(() => {
    if (editingTransaction) {
      // Używamy Math.abs, aby w polu edycji nie wyświetlał się minus (np. -50 wyświetlamy jako 50)
      setAmount(Math.abs(editingTransaction.amount).toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description || '');
      setWalletId(editingTransaction.wallet); // Tutaj wallet to ID portfela
      setDate(editingTransaction.date);
      setType(editingTransaction.type);
    } else {
      // Reset jeśli dodajemy nową transakcję
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

    // Konwersja kwoty:
    // Jeśli wydatek (outcome) -> ujemna
    // Jeśli przychód (income) -> dodatnia
    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'outcome' ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    // Obiekt zgodny z tym, czego oczekuje Server Action
    const transactionData = {
      amount: finalAmount,
      category,
      description,
      wallet: walletId, // Server Action oczekuje pola 'wallet' jako ID
      date,
      type,
    };

    try {
      if (editingTransaction) {
        await editTransactionAction(editingTransaction.id, transactionData);
      } else {
        await addTransactionAction(transactionData);
      }
      onClose(); // Zamknij modal po sukcesie
    } catch (error) {
      console.error('Błąd zapisu transakcji:', error);
      alert('Wystąpił błąd podczas zapisywania transakcji.');
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
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Przełącznik Typu */}
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

          {/* Kwota */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Kwota</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="0.00"
            />
          </div>

          {/* Kategoria */}
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

          {/* Opis */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Opis (opcjonalnie)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
              placeholder="np. Zakupy w Biedronce"
            />
          </div>

          {/* Portfel */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Portfel</label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
            >
              {wallets.length === 0 && <option value="">Brak portfeli - dodaj najpierw portfel</option>}
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.balance.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN)
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
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

          {/* Przycisk Submit */}
          <button
            type="submit"
            disabled={loading || wallets.length === 0}
            className={`w-full font-medium py-2 rounded-lg transition-colors mt-4 ${
              loading || wallets.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading 
              ? 'Przetwarzanie...' 
              : (editingTransaction ? 'Zapisz zmiany' : 'Dodaj transakcję')}
          </button>
        </form>
      </div>
    </div>
  );
}