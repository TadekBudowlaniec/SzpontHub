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
    const assetsTotal = assets.reduce((sum, asset) => sum + (asset.totalValue || 0), 0);
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

    return { totalNetWorth: netWorth, totalIncome: income, totalOutcome: outcome, profit: income - outcome, periodLabel: range };
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Portfel: <span className="text-primary">{wallets.find(w => w.id === activeWalletId)?.name}</span>
            </h1>
          ) : (
            <h1 className="text-4xl font-extrabold text-foreground mb-2 flex items-center gap-1">
              <span className="text-primary">$zpont</span>
              <span className="text-primary">Hub</span>
            </h1>
          )}
          <p className="text-muted-foreground">
            {activeWalletId
              ? <button onClick={() => setActiveWallet(null)} className="text-primary hover:underline flex items-center gap-1"><Filter className="w-3 h-3"/> Wróć</button>
              : 'Twoje finanse'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingWallet(null); setIsWalletModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border"
          >
            <Plus className="w-4 h-4" /> Portfel
          </button>
          <button
            onClick={() => { setEditingTransaction(null); setIsTransModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Transakcja
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-primary/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Saldo</span>
            <WalletIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalNetWorth.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        <div className="bg-card border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Przychody ({stats.periodLabel})</span>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalIncome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        <div className="bg-card border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Wydatki ({stats.periodLabel})</span>
            <ArrowDownRight className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalOutcome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        <div className={`bg-card border ${stats.profit >= 0 ? 'border-cyan-500/30' : 'border-orange-500/30'} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Bilans ({stats.periodLabel})</span>
            <TrendingUp className={`w-5 h-5 ${stats.profit >= 0 ? 'text-cyan-500' : 'text-orange-500'}`} />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <FinancialChart transactions={filteredTransactions} range={range} setRange={setRange} />
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <BTCWidget />
        </div>
      </div>

      {/* Wallets */}
      <div id="wallets" className="mb-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Portfele</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => setActiveWallet(activeWalletId === wallet.id ? null : wallet.id)}
              className={`cursor-pointer transition-all ${activeWalletId === wallet.id ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'}`}
            >
              <WalletCard
                wallet={wallet}
                onEdit={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
                onDelete={handleDeleteWallet}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Assets & Transactions */}
      <div id="assets" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-8">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <AssetList assets={assets} />
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <TransactionList
            transactions={filteredTransactions.slice(0, 10)}
            onDelete={handleDeleteTransaction}
            onEdit={(t) => { setEditingTransaction(t); setIsTransModalOpen(true); }}
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
