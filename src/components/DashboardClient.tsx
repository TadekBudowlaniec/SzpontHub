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
import { deleteTransactionAction, deleteWalletAction } from '@/app/actions';

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

  const { wallets, transactions, assets, activeWalletId, setWallets, setTransactions, setAssets, setActiveWallet } = useFinanceStore();

  // Wczytaj dane z serwera do stora
  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
    setAssets(initialAssets);
  }, [initialWallets, initialTransactions, initialAssets, setWallets, setTransactions, setAssets]);

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
    const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const outcome = periodTransactions.filter(t => t.type === 'outcome').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalNetWorth, totalIncome: income, totalOutcome: outcome, profit: income - outcome, periodLabel: range };
  }, [wallets, assets, filteredTransactions, activeWalletId, range]);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteTransactionAction(id);
  };
  const handleDeleteWallet = async (id: string) => {
    if (confirm('Czy na pewno?')) {
      await deleteWalletAction(id);
      if (activeWalletId === id) setActiveWallet(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {activeWalletId ? (
            <h1 className="text-3xl font-bold text-white mb-2">Portfel: <span className="text-purple-400">{wallets.find(w => w.id === activeWalletId)?.name}</span></h1>
          ) : (
            <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-1"><span className="text-emerald-400">$</span><span className="text-emerald-400">zpont</span><span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent ml-2">Hub</span></h1>
          )}
          <p className="text-gray-400">{activeWalletId ? <button onClick={() => setActiveWallet(null)} className="text-purple-400 hover:underline flex items-center gap-1"><Filter className="w-3 h-3"/> Wróć</button> : 'Twoje finanse'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingWallet(null); setIsWalletModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"><Plus className="w-4 h-4" /> Portfel</button>
          <button onClick={() => { setEditingTransaction(null); setIsTransModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg transition-all"><Plus className="w-4 h-4" /> Transakcja</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-gray-400 text-sm mb-1">Saldo</div>
          <div className="text-3xl font-bold text-white">{stats.totalNetWorth.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</div>
        </div>
        <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-gray-400 text-sm mb-1">Przychody ({stats.periodLabel})</div>
          <div className="text-3xl font-bold text-white">{stats.totalIncome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</div>
        </div>
        <div className="bg-gray-900/50 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-gray-400 text-sm mb-1">Wydatki ({stats.periodLabel})</div>
          <div className="text-3xl font-bold text-white">{stats.totalOutcome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</div>
        </div>
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-gray-400 text-sm mb-1">Bilans</div>
          <div className="text-3xl font-bold text-white">{stats.profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2"><FinancialChart transactions={filteredTransactions} range={range} setRange={setRange} /></div>
        <div><BTCWidget /></div>
      </div>

      <div id="wallets" className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Portfele</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map(w => (
            <div key={w.id} onClick={() => setActiveWallet(activeWalletId === w.id ? null : w.id)} className={`cursor-pointer transition-all ${activeWalletId === w.id ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
              <WalletCard wallet={w} onEdit={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }} onDelete={handleDeleteWallet} />
            </div>
          ))}
        </div>
      </div>

      <div id="assets" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetList assets={assets} />
        <TransactionList transactions={filteredTransactions.slice(0, 10)} onDelete={handleDeleteTransaction} onEdit={(t) => { setEditingTransaction(t); setIsTransModalOpen(true); }} />
      </div>

      <TransactionModal isOpen={isTransModalOpen} onClose={() => setIsTransModalOpen(false)} editingTransaction={editingTransaction} />
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} editingWallet={editingWallet} />
    </DashboardLayout>
  );
}