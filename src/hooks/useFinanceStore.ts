import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  amount: number; // Ujemne dla wydatków, dodatnie dla przychodów
  category: string;
  date: string;
  wallet: string;
  walletName: string;
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
  activeWalletId: string | null;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  editTransaction: (id: string, updatedData: Omit<Transaction, 'id'>) => void;
  
  addWallet: (wallet: Omit<Wallet, 'id' | 'balance'>) => void;
  removeWallet: (id: string) => void;
  editWallet: (id: string, updatedData: Partial<Wallet>) => void;
  setActiveWallet: (id: string | null) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
}

// Mock Data
const mockWallets: Wallet[] = [
  { id: '1', name: 'Gotówka', balance: 5420.50, icon: '💵', color: 'from-green-500 to-emerald-600', type: 'fiat' },
  { id: '2', name: 'Konto Bankowe', balance: 45230.75, icon: '🏦', color: 'from-blue-500 to-cyan-600', type: 'fiat' },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      wallets: mockWallets,
      transactions: [],
      assets: [],
      activeWalletId: null,

      setActiveWallet: (id) => set({ activeWalletId: id }),

      addWallet: (walletData) => set((state) => ({
        wallets: [...state.wallets, { ...walletData, id: Date.now().toString(), balance: 0 }]
      })),

      removeWallet: (id) => set((state) => ({
        wallets: state.wallets.filter(w => w.id !== id),
        activeWalletId: state.activeWalletId === id ? null : state.activeWalletId
      })),

      editWallet: (id, updatedData) => set((state) => ({
        wallets: state.wallets.map(w => w.id === id ? { ...w, ...updatedData } : w)
      })),

      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: Date.now().toString() };
        
        set((state) => {
          // Aktualizuj saldo portfela: Po prostu dodaj kwotę (ujemną dla wydatku, dodatnią dla przychodu)
          const updatedWallets = state.wallets.map(w => {
            if (w.id === transaction.wallet) {
              return { ...w, balance: w.balance + transaction.amount };
            }
            return w;
          });

          return {
            transactions: [newTransaction, ...state.transactions],
            wallets: updatedWallets
          };
        });
      },

      removeTransaction: (id) => {
        const state = get();
        const transaction = state.transactions.find(t => t.id === id);
        if (!transaction) return;

        set((state) => {
          // Cofnij saldo: Odejmij kwotę transakcji. 
          // Jeśli to był wydatek (-100), to balance - (-100) da balance + 100. Correct.
          const updatedWallets = state.wallets.map(w => {
            if (w.id === transaction.wallet) {
              return { ...w, balance: w.balance - transaction.amount };
            }
            return w;
          });

          return {
            transactions: state.transactions.filter(t => t.id !== id),
            wallets: updatedWallets
          };
        });
      },

      editTransaction: (id, updatedData) => {
        const state = get();
        const oldTransaction = state.transactions.find(t => t.id === id);
        if (!oldTransaction) return;

        set((state) => {
          const updatedWallets = state.wallets.map(w => {
            let newBalance = w.balance;

            // 1. Cofnij starą transakcję (jeśli dotyczyła tego portfela)
            if (w.id === oldTransaction.wallet) {
              newBalance -= oldTransaction.amount;
            }

            // 2. Dodaj nową transakcję (jeśli dotyczy tego portfela)
            if (w.id === updatedData.wallet) {
              newBalance += updatedData.amount;
            }

            return { ...w, balance: newBalance };
          });

          return {
            transactions: state.transactions.map(t => t.id === id ? { ...updatedData, id } : t),
            wallets: updatedWallets
          };
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