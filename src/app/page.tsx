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
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pobieramy tylko surowe dane ze store
  const { wallets, transactions, assets } = useFinanceStore();

  // Obliczenia (Derived State) - naprawia problem z persist
  const { totalNetWorth, totalIncome, totalOutcome, profit } = useMemo(() => {
    // 1. Net Worth
    const walletsTotal = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const assetsTotal = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const netWorth = walletsTotal + assetsTotal;

    // 2. Income & Outcome (ostatnie 30 dni)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const income = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const outcome = transactions
      .filter(t => t.type === 'outcome' && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentProfit = income - outcome;

    return { 
      totalNetWorth: netWorth, 
      totalIncome: income, 
      totalOutcome: outcome,
      profit: currentProfit
    };
  }, [wallets, transactions, assets]);


  return (
    <DashboardLayout>
      {/* Header Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Finance Hub</h1>
        <p className="text-gray-400">Zarządzaj swoimi finansami w jednym miejscu</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Net Worth</span>
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalNetWorth.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12.5% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Income</span>
            <ArrowUpRight className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalIncome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
          <div className="text-gray-400 text-sm">Last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Outcome</span>
            <ArrowDownRight className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalOutcome.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
          <div className="text-gray-400 text-sm">Last 30 days</div>
        </div>

        <div className={`bg-gradient-to-br ${profit >= 0 ? 'from-cyan-600/20 to-cyan-900/20 border-cyan-500/30' : 'from-orange-600/20 to-orange-900/20 border-orange-500/30'} border rounded-xl p-6 backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Profit/Loss</span>
            <TrendingUp className={`w-5 h-5 ${profit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </div>
          <div className={`text-sm ${profit >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
            {profit >= 0 ? 'Positive' : 'Negative'} cashflow
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <FinancialChart />
        </div>
        <div>
          <BTCWidget />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MonthlyIncomeChart />
        <ProfitChart />
      </div>

      {/* Wallets Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Portfele</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj transakcję
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>
      </div>

      {/* Assets and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetList assets={assets} />
        <TransactionList transactions={transactions.slice(0, 10)} />
      </div>

      {/* Transaction Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
}