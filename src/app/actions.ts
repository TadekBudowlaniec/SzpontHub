'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// KLUCZOWA ZMIANA: Importujemy typy dokładnie te, których używa frontend!
import { Wallet, Transaction, Asset } from '@/hooks/useFinanceStore';

async function getUserId() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  return session?.user?.id;
}

// --- POBIERANIE DANYCH ---

// Wymuszamy na funkcji, żeby zwracała dokładnie to, czego oczekuje page.tsx
export async function getDashboardData(): Promise<{
  wallets: Wallet[];
  transactions: Transaction[];
  assets: Asset[];
} | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = await createClient();

  // 1. Wallets
  const { data: walletsRaw } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  // Zmieniamy dane z bazy na format dla frontendu
  const wallets: Wallet[] = (walletsRaw || []).map((w: any) => ({
    id: w.id,
    name: w.name,
    type: w.type as 'fiat' | 'crypto' | 'stock',
    balance: w.balance,
    color: w.color,
    icon: w.icon,
  }));

  // 2. Transactions
  const { data: transactionsRaw } = await supabase
    .from('transactions')
    .select('*, wallets(name)')
    .order('date', { ascending: false });

  const userTransactions = (transactionsRaw || []).filter(
    (t: any) => t.wallets && t.wallets.user_id === userId
  );

  const transactions: Transaction[] = userTransactions.map((t: any) => ({
    id: t.id,
    amount: t.amount,
    category: t.category,
    date: t.date ? t.date.split('T')[0] : '',
    wallet: t.wallet_id,
    walletName: t.wallets?.name || 'Nieznany',
    type: t.type as 'income' | 'outcome',
    description: t.description || null,
  }));

  // 3. Assets
  const { data: assetsRaw } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId);

  const assets: Asset[] = (assetsRaw || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    symbol: a.symbol,
    quantity: a.quantity,
    currentPrice: a.current_price, // Tłumaczymy snake_case z bazy na camelCase
    totalValue: a.quantity * a.current_price, 
    change24h: a.change24h || 0,
  }));

  return { wallets, transactions, assets };
}

// --- ZAPIS DANYCH (Backend wysyła do bazy snake_case) ---

export async function addTransactionAction(data: {
  amount: number;
  category: string;
  description: string;
  type: string;
  date: string;
  wallet: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  
  const supabase = await createClient();

  const { error } = await supabase.from('transactions').insert({
    amount: data.amount,
    category: data.category,
    description: data.description,
    type: data.type,
    date: new Date(data.date).toISOString(),
    wallet_id: data.wallet, // snake_case dla bazy
    created_at: new Date().toISOString()
  });

  if (error) throw new Error(error.message);

  const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', data.wallet).single();
  
  if (wallet) {
    const newBalance = data.type === 'income' 
       ? wallet.balance + data.amount 
       : wallet.balance - Math.abs(data.amount);

    await supabase.from('wallets').update({
      balance: newBalance
    }).eq('id', data.wallet);
  }

  revalidatePath('/');
}

export async function editTransactionAction(id: string, data: any) {
  const supabase = await createClient();
  
  await supabase.from('transactions').update({
    amount: data.amount,
    category: data.category,
    description: data.description,
    type: data.type,
    date: new Date(data.date).toISOString(),
    wallet_id: data.wallet
  }).eq('id', id);

  revalidatePath('/');
}

export async function deleteTransactionAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: transaction } = await supabase.from('transactions').select('*').eq('id', id).single();

  if (transaction) {
     const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', transaction.wallet_id).single();
     if (wallet) {
       const balanceCorrection = transaction.type === 'income' 
         ? -transaction.amount 
         : Math.abs(transaction.amount);

       await supabase.from('wallets').update({
         balance: wallet.balance + balanceCorrection
       }).eq('id', transaction.wallet_id);
     }
  }

  await supabase.from('transactions').delete().eq('id', id);
  revalidatePath('/');
}

export async function addWalletAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  const supabase = await createClient();

  await supabase.from('wallets').insert({
    user_id: userId,
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon,
    balance: 0,
    currency: 'PLN',
    created_at: new Date().toISOString()
  });
  revalidatePath('/');
}

export async function deleteWalletAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  const supabase = await createClient();

  await supabase.from('transactions').delete().eq('wallet_id', id);
  await supabase.from('wallets').delete().eq('id', id);
  revalidatePath('/');
}

// --- BRAKUJĄCE FUNKCJE (DODAJ NA DOLE PLIKU) ---

export async function editWalletAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  
  const supabase = await createClient();

  // Aktualizujemy dane w bazie dla konkretnego portfela (snake_case dla kolumn)
  await supabase.from('wallets').update({
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon
  }).eq('id', id).eq('user_id', userId); // Upewniamy się, że to portfel tego usera

  revalidatePath('/');
}

export async function signOutAction() {
  const supabase = await createClient();
  
  // Wylogowanie sesji Supabase (jeśli z niej korzystasz lokalnie)
  await supabase.auth.signOut();
  
  revalidatePath('/');
}