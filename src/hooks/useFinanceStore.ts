import { create } from 'zustand';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  wallet: string; // To jest ID portfela
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
  change24h: number; // Opcjonalne, jeśli nie masz tego w bazie
}

interface FinanceState {
  wallets: Wallet[];
  transactions: Transaction[];
  assets: Asset[];
  activeWalletId: string | null;
  
  // Settery (aktualizacja stanu z bazy)
  setWallets: (wallets: Wallet[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAssets: (assets: Asset[]) => void;
  
  setActiveWallet: (id: string | null) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  wallets: [],
  transactions: [],
  assets: [],
  activeWalletId: null,

  setWallets: (wallets) => set({ wallets }),
  setTransactions: (transactions) => set({ transactions }),
  setAssets: (assets) => set({ assets }),
  
  setActiveWallet: (id) => set({ activeWalletId: id }),
}));