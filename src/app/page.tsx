'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { AssetList } from '@/components/AssetList';
import { FinancialChart } from '@/components/FinancialChart';
import { MonthlyIncomeChart } from '@/components/MonthlyIncomeChart';
import { ProfitChart } from '@/components/ProfitChart';
import { BTCWidget } from '@/components/BTCWidget';
import { TransactionModal } from '@/components/TransactionModal';
import { WalletModal } from '@/components/WalletModal';
import { useFinanceStore, Transaction } from '@/hooks/useFinanceStore';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Plus, Filter } from 'lucide-react';

export default function Home() {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { wallets, transactions, assets, removeTransaction, activeWalletId, setActiveWallet } = useFinanceStore();

  // Filtrowanie danych w zależności od wybranego portfela
  const filteredTransactions = useMemo(() => {
    if (!activeWalletId) return transactions;
    return transactions.filter(t => t.wallet === activeWalletId);
  }, [transactions, activeWalletId]);

  const filteredWallets = useMemo(() => {
    // Portfele pokazujemy zawsze wszystkie, ale zaznaczamy aktywny wizualnie
    return wallets;
  }, [wallets]);

  // Kalkulacje (Live)
  const { totalNetWorth, totalIncome, totalOutcome, profit } = useMemo(() => {
    // Jeśli wybrano portfel, licz tylko dla niego
    const currentWallets = activeWalletId ? wallets.filter(w => w.id === activeWalletId) : wallets;
    const currentAssets = assets; // Assets globalne, chyba że przypiszesz je do portfela w przyszłości

    const walletsTotal = currentWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const assetsTotal = currentAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const netWorth = walletsTotal + assetsTotal;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const income = filteredTransactions
      .filter(t => t.type === 'income' && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const outcome = filteredTransactions
      .filter(t => t.type === 'outcome' && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { 
      totalNetWorth: netWorth, 
      totalIncome: income, 
      totalOutcome: outcome,
      profit: income - outcome
    };
  }, [wallets, assets, filteredTransactions, activeWalletId]);

  // Handlery
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransModalOpen(true);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę transakcję? Środki zostaną cofnięte.')) {
      removeTransaction(id);
    }
  };

  return (
    <DashboardLayout>
      {/* Header Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {activeWalletId ? `Portfel: ${wallets.find(w => w.id === activeWalletId)?.name}` : '$zpont Hub'}
          </h1>
          <p className="text-gray-400">
            {activeWalletId 
              ? <button onClick={() => setActiveWallet(null)} className="text-purple-400 hover:underline flex items-center gap-1"><Filter className="w-3 h-3"/> Wróć do widoku głównego</button> 
              : 'Zarządzaj swoimi finansami w jednym miejscu'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
          >
            <Plus className="w-4 h-4" /> Portfel
          </button>
          <button
            onClick={handleAddTransaction}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Transakcja
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Net Worth */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Saldo całkowite</span>
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalNetWorth.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        {/* Income */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Przychody (30 dni)</span>
            <ArrowUpRight className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalIncome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        {/* Outcome */}
        <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Wydatki (30 dni)</span>
            <ArrowDownRight className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalOutcome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        {/* Profit */}
        <div className={`bg-gradient-to-br ${profit >= 0 ? 'from-cyan-600/20 to-cyan-900/20 border-cyan-500/30' : 'from-orange-600/20 to-orange-900/20 border-orange-500/30'} border rounded-xl p-6 backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Bilans (30 dni)</span>
            <TrendingUp className={`w-5 h-5 ${profit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>
      </div>

      {/* Charts Section - Passing filtered Transactions to update chart LIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <FinancialChart transactions={filteredTransactions} />
        </div>
        <div>
          <BTCWidget />
        </div>
      </div>

      {/* Wallets Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Portfele</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id} 
              onClick={() => setActiveWallet(activeWalletId === wallet.id ? null : wallet.id)}
              className={`cursor-pointer transition-all ${activeWalletId === wallet.id ? 'ring-2 ring-purple-500 scale-105' : ''}`}
            >
              <WalletCard wallet={wallet} />
            </div>
          ))}
        </div>
      </div>

      {/* Assets and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetList assets={assets} />
        <TransactionList 
          transactions={filteredTransactions.slice(0, 10)} 
          onDelete={handleDeleteTransaction}
          onEdit={handleEditTransaction}
        />
      </div>

      {/* Modals */}
      <TransactionModal 
        isOpen={isTransModalOpen} 
        onClose={() => setIsTransModalOpen(false)} 
        editingTransaction={editingTransaction}
      />
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </DashboardLayout>
  );
}