'use client';

import { useState, useMemo, useEffect } from 'react';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { useFinanceStore, Transaction, Wallet } from '@/hooks/useFinanceStore';
import { Plus } from 'lucide-react';
import { deleteTransactionAction } from '@/app/actions';

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
}

export function TransactionsPageClient({ initialWallets, initialTransactions }: Props) {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterWalletId, setFilterWalletId] = useState<string | null>(null);

  const { wallets, transactions, setWallets, setTransactions } = useFinanceStore();

  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
  }, [initialWallets, initialTransactions, setWallets, setTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!filterWalletId) return transactions;
    return transactions.filter(t => t.wallet === filterWalletId);
  }, [transactions, filterWalletId]);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteTransactionAction(id);
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-foreground">Transakcje</h1>
        <button
          onClick={() => { setEditingTransaction(null); setIsTransModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Nowa transakcja
        </button>
      </div>

      {/* Wallet filter */}
      {wallets.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterWalletId(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !filterWalletId
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            Wszystkie
          </button>
          {wallets.map(w => (
            <button
              key={w.id}
              onClick={() => setFilterWalletId(filterWalletId === w.id ? null : w.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterWalletId === w.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
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
    </>
  );
}
