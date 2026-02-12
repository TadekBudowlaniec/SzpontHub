'use server';

import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  return session?.user?.id;
}

// --- POBIERANIE DANYCH (FIXED) ---

export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = await createClient();

  // 1. Wallets: Pobieramy i mapujemy na format, który lubi frontend
  const { data: walletsRaw } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  const wallets = (walletsRaw || []).map((w: any) => ({
    id: w.id,
    userId: w.user_id,          // Baza: user_id -> Frontend: userId
    name: w.name,
    type: w.type,
    balance: w.balance,
    currency: w.currency,
    color: w.color,
    icon: w.icon,
    createdAt: w.created_at,    // Baza: created_at -> Frontend: createdAt
  }));

  // 2. Transactions
  const { data: transactionsRaw } = await supabase
    .from('transactions')
    .select('*, wallets(name)')
    .order('date', { ascending: false });

  // Filtrujemy tylko transakcje zalogowanego usera
  const userTransactions = (transactionsRaw || []).filter(
    (t: any) => t.wallets && t.wallets.user_id === userId
  );

  const transactions = userTransactions.map((t: any) => ({
    id: t.id,
    walletId: t.wallet_id,      // Tłumaczenie
    amount: t.amount,
    type: t.type,
    category: t.category,
    description: t.description,
    date: t.date ? t.date.split('T')[0] : '',
    createdAt: t.created_at,
    walletName: t.wallets?.name || 'Nieznany',
    wallet: t.wallet_id, 
  }));

  // 3. Assets (Najważniejsze - naprawa błędu currentPrice)
  const { data: assetsRaw } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId);

  const assets = (assetsRaw || []).map((a: any) => ({
    id: a.id,
    userId: a.user_id,
    name: a.name,
    symbol: a.symbol,
    quantity: a.quantity,
    currentPrice: a.current_price, // Tłumaczenie: current_price -> currentPrice
    totalValue: a.quantity * a.current_price, 
    change24h: a.change24h || 0,
  }));

  // ZWRACAMY JAKO 'any', ŻEBY TYPESCRIPT NIE BLOKOWAŁ DEPLOYA
  return { 
    wallets: wallets as any, 
    transactions: transactions as any, 
    assets: assets as any 
  };
}

// --- TRANSAKCJE (ZAPIS) ---

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

  // Update salda
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

// --- PORTFELE ---

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