import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  wallet: string; // Przechowujemy ID portfela dla lepszej spójności, ale w UI wyświetlamy nazwę
  walletName: string; // Helper do wyświetlania
  type: 'income' | 'outcome';
  description: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  type: 'fiat' | 'crypto' | 'stock';
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  change24h: number;
}

interface FinanceState {
  wallets: Wallet[];
  transactions: Transaction[];
  assets: Asset[];
  activeWalletId: string | null; // Do filtrowania
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  editTransaction: (id: string, updatedData: Omit<Transaction, 'id'>) => void;
  
  addWallet: (wallet: Omit<Wallet, 'id' | 'balance'>) => void;
  setActiveWallet: (id: string | null) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
}

// Helper do aktualizacji salda
const updateWalletBalance = (wallets: Wallet[], walletId: string, amount: number, type: 'income' | 'outcome', reverse: boolean = false) => {
  return wallets.map(w => {
    if (w.id === walletId) {
      const value = type === 'income' ? amount : -amount;
      const finalValue = reverse ? -value : value;
      return { ...w, balance: w.balance + finalValue };
    }
    return w;
  });
};

// Mock Data (skrócone dla czytelności)
const mockWallets: Wallet[] = [
  { id: '1', name: 'Gotówka', balance: 5420.50, icon: '💵', color: 'from-green-500 to-emerald-600', type: 'fiat' },
  { id: '2', name: 'Konto Bankowe', balance: 45230.75, icon: '🏦', color: 'from-blue-500 to-cyan-600', type: 'fiat' },
];
// ... reszta mocków bez zmian ...

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      wallets: mockWallets,
      transactions: [], // Zacznijmy od pustej lub mockowej listy
      assets: [], 
      activeWalletId: null,

      setActiveWallet: (id) => set({ activeWalletId: id }),

      addWallet: (walletData) => set((state) => ({
        wallets: [...state.wallets, { ...walletData, id: Date.now().toString(), balance: 0 }]
      })),

      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: Date.now().toString() };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
          wallets: updateWalletBalance(state.wallets, transaction.wallet, transaction.amount, transaction.type)
        }));
      },

      removeTransaction: (id) => {
        const state = get();
        const transaction = state.transactions.find(t => t.id === id);
        if (!transaction) return;

        set((state) => ({
          transactions: state.transactions.filter(t => t.id !== id),
          // Odwracamy działanie transakcji na saldo (reverse = true)
          wallets: updateWalletBalance(state.wallets, transaction.wallet, transaction.amount, transaction.type, true)
        }));
      },

      editTransaction: (id, updatedData) => {
        const state = get();
        const oldTransaction = state.transactions.find(t => t.id === id);
        if (!oldTransaction) return;

        // 1. Cofnij wpływ starej transakcji
        let tempWallets = updateWalletBalance(state.wallets, oldTransaction.wallet, oldTransaction.amount, oldTransaction.type, true);
        
        // 2. Dodaj wpływ nowej transakcji
        tempWallets = updateWalletBalance(tempWallets, updatedData.wallet, updatedData.amount, updatedData.type, false);

        set({
          transactions: state.transactions.map(t => t.id === id ? { ...updatedData, id } : t),
          wallets: tempWallets
        });
      },

      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map(asset => 
            asset.id === id 
              ? { ...asset, ...updates, totalValue: (updates.quantity || asset.quantity) * (updates.currentPrice || asset.currentPrice) }
              : asset
          ),
        }));
      },
    }),
    { name: 'finance-storage' }
  )
);