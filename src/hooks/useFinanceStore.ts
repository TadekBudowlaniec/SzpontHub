import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  wallet: string;
  type: 'income' | 'outcome';
  description: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
}

// Mock Data
const mockWallets: Wallet[] = [
  { id: '1', name: 'Gotówka', balance: 5420.50, icon: '💵', color: 'from-green-500 to-emerald-600' },
  { id: '2', name: 'Konto Bankowe', balance: 45230.75, icon: '🏦', color: 'from-blue-500 to-cyan-600' },
  { id: '3', name: 'Portfel Krypto', balance: 28950.00, icon: '₿', color: 'from-orange-500 to-amber-600' },
  { id: '4', name: 'Giełda', balance: 67800.25, icon: '📈', color: 'from-purple-500 to-pink-600' },
];

const mockTransactions: Transaction[] = [
  { id: '1', amount: 8500, category: 'Wynagrodzenie', date: '2026-02-10', wallet: 'Konto Bankowe', type: 'income', description: 'Wypłata - Luty 2026' },
  { id: '2', amount: -450.50, category: 'Zakupy', date: '2026-02-09', wallet: 'Konto Bankowe', type: 'outcome', description: 'Zakupy spożywcze' },
  { id: '3', amount: 2500, category: 'Freelance', date: '2026-02-08', wallet: 'Gotówka', type: 'income', description: 'Projekt webowy' },
  { id: '4', amount: -1200, category: 'Czynsz', date: '2026-02-05', wallet: 'Konto Bankowe', type: 'outcome', description: 'Czynsz - Luty' },
  { id: '5', amount: -89.99, category: 'Subskrypcje', date: '2026-02-04', wallet: 'Konto Bankowe', type: 'outcome', description: 'Netflix + Spotify' },
  { id: '6', amount: 5000, category: 'Inwestycja', date: '2026-02-03', wallet: 'Portfel Krypto', type: 'income', description: 'Zakup BTC' },
  { id: '7', amount: -320, category: 'Transport', date: '2026-02-02', wallet: 'Gotówka', type: 'outcome', description: 'Paliwo + Bilet' },
  { id: '8', amount: 1500, category: 'Bonus', date: '2026-02-01', wallet: 'Konto Bankowe', type: 'income', description: 'Premia kwartalna' },
  { id: '9', amount: -650, category: 'Restauracje', date: '2026-01-30', wallet: 'Gotówka', type: 'outcome', description: 'Kolacja biznesowa' },
  { id: '10', amount: -2100, category: 'Elektronika', date: '2026-01-28', wallet: 'Konto Bankowe', type: 'outcome', description: 'Nowy laptop' },
  { id: '11', amount: 3200, category: 'Dywidendy', date: '2026-01-25', wallet: 'Giełda', type: 'income', description: 'Dywidendy z akcji' },
  { id: '12', amount: -180, category: 'Zdrowie', date: '2026-01-22', wallet: 'Konto Bankowe', type: 'outcome', description: 'Wizyta lekarska' },
  { id: '13', amount: 8500, category: 'Wynagrodzenie', date: '2026-01-10', wallet: 'Konto Bankowe', type: 'income', description: 'Wypłata - Styczeń 2026' },
  { id: '14', amount: -1200, category: 'Czynsz', date: '2026-01-05', wallet: 'Konto Bankowe', type: 'outcome', description: 'Czynsz - Styczeń' },
  { id: '15', amount: 4500, category: 'Freelance', date: '2026-01-15', wallet: 'Gotówka', type: 'income', description: 'Konsulting IT' },
];

const mockAssets: Asset[] = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', quantity: 0.35, currentPrice: 380000, totalValue: 133000, change24h: 3.2 },
  { id: '2', name: 'Ethereum', symbol: 'ETH', quantity: 2.5, currentPrice: 14500, totalValue: 36250, change24h: -1.5 },
  { id: '3', name: 'Apple Inc.', symbol: 'AAPL', quantity: 15, currentPrice: 720, totalValue: 10800, change24h: 0.8 },
  { id: '4', name: 'Tesla Inc.', symbol: 'TSLA', quantity: 8, currentPrice: 1050, totalValue: 8400, change24h: 2.1 },
  { id: '5', name: 'Microsoft', symbol: 'MSFT', quantity: 12, currentPrice: 1680, totalValue: 20160, change24h: 1.3 },
  { id: '6', name: 'Złoto', symbol: 'GOLD', quantity: 50, currentPrice: 280, totalValue: 14000, change24h: -0.3 },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      wallets: mockWallets,
      transactions: mockTransactions,
      assets: mockAssets,
      
      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
        };
        
        set((state) => {
          const updatedWallets = state.wallets.map(wallet => {
            if (wallet.name === transaction.wallet) {
              return {
                ...wallet,
                balance: wallet.balance + (transaction.type === 'income' ? transaction.amount : -Math.abs(transaction.amount))
              };
            }
            return wallet;
          });
          
          return {
            transactions: [newTransaction, ...state.transactions],
            wallets: updatedWallets,
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
    {
      name: 'finance-storage',
    }
  )
);