export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: 'fiat' | 'crypto' | 'stock';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'income' | 'outcome';
  category: string;
  description?: string | null;
  date: string;
  created_at: string;
  wallet?: Wallet; // opcjonalne do joinów
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  quantity: number;
  current_price: number;
  totalValue?: number;
  change24h?: number;
}