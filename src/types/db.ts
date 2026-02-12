export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: 'fiat' | 'crypto' | 'stock';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'income' | 'outcome';
  category: string;
  description?: string | null;
  date: string;
  createdAt: string;
  // Opcjonalne pole do joinów
  wallet?: Wallet; 
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  totalValue: number; // To obliczasz na froncie/back, w bazie może nie być
  change24h: number;  // j.w.
}