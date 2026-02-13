'use client';

import { useState, useMemo, useEffect } from 'react';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { WalletModal } from '@/components/WalletModal';
import { useFinanceStore, Transaction, Wallet } from '@/hooks/useFinanceStore';
import { Plus } from 'lucide-react';
import { deleteTransactionAction, deleteWalletAction } from '@/app/actions';

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
}

export function WalletsPageClient({ initialWallets, initialTransactions }: Props) {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const { wallets, transactions, activeWalletId, setWallets, setTransactions, setActiveWallet } = useFinanceStore();

  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
  }, [initialWallets, initialTransactions, setWallets, setTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!activeWalletId) return transactions;
    return transactions.filter(t => t.wallet === activeWalletId);
  }, [transactions, activeWalletId]);

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
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfele</h1>
          {activeWalletId && (
            <button
              onClick={() => setActiveWallet(null)}
              className="text-primary hover:underline text-sm mt-1"
            >
              Pokaż wszystkie portfele
            </button>
          )}
        </div>
        <button
          onClick={() => { setEditingWallet(null); setIsWalletModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Nowy portfel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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

      {/* Transactions for selected wallet */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 pb-0 flex items-center justify-between">
          <h2 className="text-xl font-bold text-card-foreground">
            {activeWalletId
              ? `Transakcje — ${wallets.find(w => w.id === activeWalletId)?.name}`
              : 'Wszystkie transakcje'}
          </h2>
          <button
            onClick={() => { setEditingTransaction(null); setIsTransModalOpen(true); }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border"
          >
            <Plus className="w-3 h-3" /> Transakcja
          </button>
        </div>
        <TransactionList
          transactions={filteredTransactions}
          onDelete={handleDeleteTransaction}
          onEdit={(t) => { setEditingTransaction(t); setIsTransModalOpen(true); }}
        />
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
