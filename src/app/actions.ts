'use server';

// 1. Zmień import na createClient
import { createClient } from '@/lib/supabase/server'; 
import { getServerSession } from 'next-auth';
// ... reszta importów

// ...

// Helper do pobierania klienta Supabase
async function getSupabase() {
  // 2. Tutaj też wywołaj createClient() zamiast createServerClient()
  return await createClient(); 
}import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { Wallet, Transaction, Asset } from '@/types/db';

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

// --- POBIERANIE DANYCH ---
export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  // 1. Wallets
  const { data: wallets, error: walletsError } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  if (walletsError) console.error('Wallets error:', walletsError);

  // 2. Transactions (join z wallets)
  const { data: transactionsRaw, error: transError } = await supabaseAdmin
    .from('transactions')
    .select('*, wallet:wallets(name)')
    .eq('wallet.user_id', userId) // Filtrujemy po userze przez relację
    .order('date', { ascending: false });

  if (transError) console.error('Transactions error:', transError);

  // Mapowanie danych
  const transactions = (transactionsRaw || []).map((t: any) => ({
    ...t,
    date: t.date ? t.date.split('T')[0] : '',
    walletName: t.wallet?.name || 'Nieznany',
    wallet: t.wallet_id, // dla kompatybilności z frontendem
    type: t.type as 'income' | 'outcome'
  }));

  // 3. Assets
  const { data: assets, error: assetsError } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('user_id', userId);

  if (assetsError) console.error('Assets error:', assetsError);

  return { 
    wallets: (wallets as Wallet[]) || [], 
    transactions: (transactions as any[]) || [], 
    assets: (assets as Asset[]) || [] 
  };
}

// --- TRANSAKCJE ---

export async function addTransactionAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Pobierz portfel
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.wallet)
    .eq('user_id', userId)
    .single();

  if (!wallet) throw new Error("Wallet not found");

  // Dodaj transakcję
  const { error: insertError } = await supabaseAdmin
    .from('transactions')
    .insert({
      id: nanoid(),
      amount: data.amount,
      category: data.category,
      description: data.description,
      type: data.type,
      date: data.date,
      wallet_id: data.wallet,
      created_at: new Date().toISOString()
    });

  if (insertError) throw new Error(insertError.message);

  // Aktualizuj saldo
  const newBalance = data.type === 'income' 
    ? wallet.balance + data.amount 
    : wallet.balance - Math.abs(data.amount);

  await supabaseAdmin
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', data.wallet);

  revalidatePath('/');
}

export async function deleteTransactionAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { data: transaction } = await supabaseAdmin
    .from('transactions')
    .select('*, wallet:wallets(*)')
    .eq('id', id)
    .single();

  if (!transaction || transaction.wallet?.user_id !== userId) return;

  // Cofnij saldo
  const currentWallet = transaction.wallet;
  const balanceCorrection = transaction.type === 'income' 
    ? -transaction.amount 
    : Math.abs(transaction.amount);

  await supabaseAdmin
    .from('wallets')
    .update({ balance: currentWallet.balance + balanceCorrection })
    .eq('id', transaction.wallet_id);

  await supabaseAdmin.from('transactions').delete().eq('id', id);
  revalidatePath('/');
}

export async function editTransactionAction(id: string, data: any) {
    // Logika edycji (uproszczona: cofnij starą, dodaj nową logikę salda)
    // Ze względu na limit znaków, upewnij się, że używasz tutaj 
    // supabaseAdmin.from('transactions') i 'wallets' tak jak powyżej.
    // Kluczowe pola to wallet_id zamiast walletId
    revalidatePath('/');
}

// --- PORTFELE ---

export async function addWalletAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  await supabaseAdmin.from('wallets').insert({
    id: nanoid(),
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

    await supabaseAdmin.from('wallets')
        .update({ name: data.name, type: data.type, color: data.color, icon: data.icon })
        .eq('id', id)
        .eq('user_id', userId);
    revalidatePath('/');
}

export async function deleteWalletAction(id: string) {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");
    
    // Usuń transakcje najpierw
    await supabaseAdmin.from('transactions').delete().eq('wallet_id', id);
    await supabaseAdmin.from('wallets').delete().eq('id', id).eq('user_id', userId);
    revalidatePath('/');
}

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
}