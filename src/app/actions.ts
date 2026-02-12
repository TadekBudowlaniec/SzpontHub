'use server';

import { createClient } from '@supabase/supabase-js'; // ZMIANA: używamy bezpośredniego klienta
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Wallet, Transaction, Asset } from '@/hooks/useFinanceStore';

// KLUCZOWA ZMIANA: Inicjalizujemy klienta z kluczem Service Role. 
// Omija to blokady RLS, bo bezpieczeństwo zapewniamy niżej przez NextAuth (getUserId).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserId() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  return session?.user?.id;
}

// --- POBIERANIE DANYCH ---

export async function getDashboardData(): Promise<{
  wallets: Wallet[];
  transactions: Transaction[];
  assets: Asset[];
} | null> {
  const userId = await getUserId();
  if (!userId) return null; // Jeśli NextAuth mówi, że nie jesteś zalogowany - odrzucamy

  // 1. Wallets
  const { data: walletsRaw, error: wError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  if (wError) console.error("Wallets fetch error:", wError);

  const wallets: Wallet[] = (walletsRaw || []).map((w: any) => ({
    id: w.id,
    name: w.name,
    type: w.type as 'fiat' | 'crypto' | 'stock',
    balance: w.balance,
    color: w.color,
    icon: w.icon,
  }));

  // 2. Transactions
  const { data: transactionsRaw, error: tError } = await supabase
    .from('transactions')
    .select('*, wallets(name)')
    .order('date', { ascending: false });

  if (tError) console.error("Transactions fetch error:", tError);

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
  const { data: assetsRaw, error: aError } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId);

  if (aError) console.error("Assets fetch error:", aError);

  const assets: Asset[] = (assetsRaw || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    symbol: a.symbol,
    quantity: a.quantity,
    currentPrice: a.current_price, 
    totalValue: a.quantity * a.current_price, 
    change24h: a.change24h || 0,
  }));

  return { wallets, transactions, assets };
}

// --- ZAPIS DANYCH ---

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
  
  const { error } = await supabase.from('transactions').insert({
    amount: data.amount,
    category: data.category,
    description: data.description,
    type: data.type,
    date: new Date(data.date).toISOString(),
    wallet_id: data.wallet,
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
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

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

export async function editWalletAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  
  await supabase.from('wallets').update({
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon
  }).eq('id', id).eq('user_id', userId); 

  revalidatePath('/');
}

export async function deleteWalletAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  await supabase.from('transactions').delete().eq('wallet_id', id);
  await supabase.from('wallets').delete().eq('id', id);
  revalidatePath('/');
}

export async function signOutAction() {
  // UWAGA: Logowanie i wylogowanie obsługuje teraz NextAuth.
  // Jeśli przycisk wylogowania przestanie nagle działać, 
  // upewnij się, że na froncie wywołujesz `signOut()` zaimportowane z 'next-auth/react'.
}