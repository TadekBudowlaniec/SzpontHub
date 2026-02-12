'use client';

import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { AssetList } from '@/components/AssetList';
import { FinancialChart } from '@/components/FinancialChart';
import { BTCWidget } from '@/components/BTCWidget';
import { TransactionModal } from '@/components/TransactionModal';
import { WalletModal } from '@/components/WalletModal';
import { useFinanceStore, Transaction, Wallet, Asset } from '@/hooks/useFinanceStore';
import { TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Filter } from 'lucide-react';
import { subDays } from 'date-fns';
import { 
  addTransactionAction, 
  deleteTransactionAction, 
  editTransactionAction,
  addWalletAction,
  editWalletAction,
  deleteWalletAction
} from '@/app/actions';

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
  initialAssets: Asset[];
}

export function DashboardClient({ initialWallets, initialTransactions, initialAssets }: Props) {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [range, setRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');

  const { 
    wallets, transactions, assets, activeWalletId, 
    setWallets, setTransactions, setAssets, setActiveWallet 
  } = useFinanceStore();

  // SYNCHRONIZACJA Z BAZĄ DANYCH
  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
    setAssets(initialAssets);
  }, [initialWallets, initialTransactions, initialAssets, setWallets, setTransactions, setAssets]);

  // --- OBLICZENIA (pozostają bez zmian) ---
  const filteredTransactions = useMemo(() => {
    if (!activeWalletId) return transactions;
    return transactions.filter(t => t.wallet === activeWalletId);
  }, [transactions, activeWalletId]);

  const stats = useMemo(() => {
    const currentWallets = activeWalletId ? wallets.filter(w => w.id === activeWalletId) : wallets;
    const walletsTotal = currentWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const assetsTotal = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const netWorth = walletsTotal + assetsTotal;

    const today = new Date();
    let startDate = subDays(today, 30);
    if (range === '1W') startDate = subDays(today, 7);
    if (range === '1M') startDate = subDays(today, 30);
    if (range === '3M') startDate = subDays(today, 90);
    if (range === '1Y') startDate = subDays(today, 365);

    const periodTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const outcome = periodTransactions
      .filter(t => t.type === 'outcome')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { 
      totalNetWorth: netWorth, 
      totalIncome: income, 
      totalOutcome: outcome,
      profit: income - outcome,
      periodLabel: range === '1W' ? 'Ost. 7 dni' : range === '1M' ? 'Ost. 30 dni' : range === '3M' ? 'Ost. 90 dni' : 'Ost. rok'
    };
  }, [wallets, assets, filteredTransactions, activeWalletId, range]);

  // --- HANDLERY (Teraz wywołują Server Actions) ---

  // Transakcje
  const handleAddTransactionSubmit = async (data: any) => {
    // Uwaga: TransactionModal wywołuje store. Zamiast modyfikować Modal,
    // najlepiej byłoby przekazać tę funkcję do Modala, ale na razie
    // zakładamy, że logika w Modalu jest OK, a my tylko odświeżamy dane.
    // ALE w Twoim obecnym TransactionModal używasz hooków ze store.
    // TO WYMAGA POPRAWKI w TransactionModal lub tutaj.
    // Najprościej: TransactionModal powinien tylko zbierać dane.
    // Jednak żeby nie mieszać, w TransactionModal podmień wywołania store na actions.
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę transakcję?')) {
      await deleteTransactionAction(id);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransModalOpen(true);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransModalOpen(true);
  };

  // Portfele
  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setIsWalletModalOpen(true);
  };

  const handleDeleteWallet = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten portfel?')) {
      await deleteWalletAction(id);
      if (activeWalletId === id) setActiveWallet(null);
    }
  };

  const handleAddWallet = () => {
    setEditingWallet(null);
    setIsWalletModalOpen(true);
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {activeWalletId ? (
            <h1 className="text-3xl font-bold text-white mb-2">
              Portfel: <span className="text-purple-400">{wallets.find(w => w.id === activeWalletId)?.name}</span>
            </h1>
          ) : (
            <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center tracking-tight">
              <span className="text-emerald-400">$</span>
              <span className="text-emerald-400">zpont</span>
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent ml-2">Hub</span>
            </h1>
          )}
          <p className="text-gray-400">
            {activeWalletId 
              ? <button onClick={() => setActiveWallet(null)} className="text-purple-400 hover:underline flex items-center gap-1"><Filter className="w-3 h-3"/> Wróć do widoku głównego</button> 
              : 'Twoje centrum dowodzenia finansami'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAddWallet} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 shadow-lg hover:shadow-xl">
            <Plus className="w-4 h-4" /> Portfel
          </button>
          <button onClick={handleAddTransaction} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg transition-all shadow-lg hover:shadow-purple-500/25">
            <Plus className="w-4 h-4" /> Transakcja
          </button>
        </div>
      </div>

      {/* STATYSTYKI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tu wklej swoje kafelki statystyk z poprzedniego page.tsx (NetWorth, Income, Outcome, Profit) */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Saldo całkowite</span>
            <WalletIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalNetWorth.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Przychody</span>
            <ArrowUpRight className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalIncome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
          <div className="text-xs text-gray-500">{stats.periodLabel}</div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Wydatki</span>
            <ArrowDownRight className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalOutcome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
          <div className="text-xs text-gray-500">{stats.periodLabel}</div>
        </div>

        <div className={`bg-gradient-to-br ${stats.profit >= 0 ? 'from-cyan-600/20 to-cyan-900/20 border-cyan-500/30' : 'from-orange-600/20 to-orange-900/20 border-orange-500/30'} border rounded-xl p-6 backdrop-blur-sm shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Bilans</span>
            <TrendingUp className={`w-5 h-5 ${stats.profit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
          <div className={`text-xs ${stats.profit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
            {stats.periodLabel}
          </div>
        </div>
      </div>

      {/* WYKRESY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 shadow-lg rounded-xl overflow-hidden">
          <FinancialChart transactions={filteredTransactions} range={range} setRange={setRange} />
        </div>
        <div className="shadow-lg rounded-xl overflow-hidden">
          <BTCWidget />
        </div>
      </div>

      {/* PORTFELE I LISTY */}
      <div id="wallets" className="mb-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Portfele</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id} 
              onClick={() => setActiveWallet(activeWalletId === wallet.id ? null : wallet.id)}
              className={`cursor-pointer transition-all ${activeWalletId === wallet.id ? 'ring-2 ring-purple-500 scale-105 shadow-xl shadow-purple-900/20' : 'hover:scale-105'}`}
            >
              <WalletCard 
                wallet={wallet} 
                onEdit={handleEditWallet} 
                onDelete={handleDeleteWallet} 
              />
            </div>
          ))}
        </div>
      </div>

      <div id="assets" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-8">
        <div className="shadow-lg rounded-xl overflow-hidden">
          <AssetList assets={assets} />
        </div>
        <div className="shadow-lg rounded-xl overflow-hidden">
          <TransactionList 
            transactions={filteredTransactions.slice(0, 10)} 
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
          />
        </div>
      </div>

      <TransactionModal 
        isOpen={isTransModalOpen} 
        onClose={() => setIsTransModalOpen(false)} 
        editingTransaction={editingTransaction}
      />
      
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        editingWallet={editingWallet}
      />
    </DashboardLayout>
  );
}