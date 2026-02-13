'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { AssetList } from '@/components/AssetList';
import { FinancialChart } from '@/components/FinancialChart';
import { BTCWidget } from '@/components/BTCWidget';
import { TransactionModal } from '@/components/TransactionModal';
import { WalletModal } from '@/components/WalletModal';
import { useFinanceStore, Transaction, Wallet, Asset } from '@/hooks/useFinanceStore';
import { TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, ArrowRight } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { deleteTransactionAction, deleteWalletAction } from '@/app/actions';

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
  initialAssets: Asset[];
  userName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Dzień dobry';
  if (hour >= 12 && hour < 18) return 'Cześć';
  if (hour >= 18 && hour < 22) return 'Dobry wieczór';
  return 'Dobrej nocy';
}

export function DashboardOverview({ initialWallets, initialTransactions, initialAssets, userName }: Props) {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [range, setRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');

  const { wallets, transactions, assets, setWallets, setTransactions, setAssets } = useFinanceStore();

  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
    setAssets(initialAssets);
  }, [initialWallets, initialTransactions, initialAssets, setWallets, setTransactions, setAssets]);

  const stats = useMemo(() => {
    const walletsTotal = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const assetsTotal = assets.reduce((sum, asset) => sum + (asset.total_value || 0), 0);
    const netWorth = walletsTotal + assetsTotal;

    const today = new Date();
    let startDate = subDays(today, 30);
    if (range === '1W') startDate = subDays(today, 7);
    if (range === '1M') startDate = subDays(today, 30);
    if (range === '3M') startDate = subDays(today, 90);
    if (range === '1Y') startDate = subDays(today, 365);

    const periodTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const outcome = periodTransactions.filter(t => t.type === 'outcome').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalNetWorth: netWorth, totalIncome: income, totalOutcome: outcome, profit: income - outcome, periodLabel: range };
  }, [wallets, assets, transactions, range]);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteTransactionAction(id);
  };

  const handleDeleteWallet = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteWalletAction(id);
  };

  return (
    <>
      <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-5xl font-bold text-foreground mb-2">
            {getGreeting()}, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: pl })}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Saldo</span>
            <WalletIcon className="w-5 h-5 text-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalNetWorth.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Przychody ({stats.periodLabel})</span>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-500">
            {stats.totalIncome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Wydatki ({stats.periodLabel})</span>
            <ArrowDownRight className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-500">
            {stats.totalOutcome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Bilans ({stats.periodLabel})</span>
            <TrendingUp className={`w-5 h-5 ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <FinancialChart transactions={transactions} range={range} setRange={setRange} />
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <BTCWidget />
        </div>
      </div>

      {/* Wallets preview */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-foreground">Portfele</h2>
          <Link href="/wallets" className="flex items-center gap-1 text-sm text-primary hover:underline">
            Zobacz wszystkie <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {wallets.slice(0, 4).map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onEdit={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
              onDelete={handleDeleteWallet}
            />
          ))}
        </div>
      </div>

      {/* Assets & Transactions preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <AssetList assets={assets} />
          <div className="px-6 pb-4">
            <Link href="/assets" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
              Wszystkie aktywa <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <TransactionList
            transactions={transactions.slice(0, 10)}
            onDelete={handleDeleteTransaction}
            onEdit={(t) => { setEditingTransaction(t); setIsTransModalOpen(true); }}
          />
          <div className="px-6 pb-4">
            <Link href="/transactions" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
              Wszystkie transakcje <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
    </>
  );
}
