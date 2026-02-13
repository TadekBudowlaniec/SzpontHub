'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/cached';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

async function getUserId() {
  const user = await getUser();
  return user?.id;
}

// --- POBIERANIE DANYCH ---

async function fetchWalletsAndTransactions(userId: string) {
  const { data: wallets, error: walletsError } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  if (walletsError) {
    console.error('Error fetching wallets:', walletsError);
  }

  const { data: transactionsRaw, error: transError } = await supabaseAdmin
    .from('transactions')
    .select(`
      *,
      wallet:wallets(name)
    `)
    .in('wallet_id', (wallets || []).map(w => w.id))
    .order('date', { ascending: false });

  if (transError) {
    console.error('Error fetching transactions:', transError);
  }

  const transactions = (transactionsRaw || []).map(t => ({
    ...t,
    date: t.date?.split('T')[0] || '',
    walletName: t.wallet?.name || '',
    wallet: t.wallet_id,
    type: t.type as 'income' | 'outcome'
  }));

  return { wallets: wallets || [], transactions };
}

export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  const { wallets, transactions } = await fetchWalletsAndTransactions(userId);

  const { data: assets, error: assetsError } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('user_id', userId);

  if (assetsError) {
    console.error('Error fetching assets:', assetsError);
  }

  return { wallets, transactions, assets: assets || [] };
}

export async function getWalletsWithTransactions() {
  const userId = await getUserId();
  if (!userId) return null;

  return fetchWalletsAndTransactions(userId);
}

export async function getTransactionsData() {
  const userId = await getUserId();
  if (!userId) return null;

  return fetchWalletsAndTransactions(userId);
}

export async function getAssetsData() {
  const userId = await getUserId();
  if (!userId) return null;

  const { data: assets, error: assetsError } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('user_id', userId);

  if (assetsError) {
    console.error('Error fetching assets:', assetsError);
  }

  return { assets: assets || [] };
}

// --- TRANSAKCJE ---

export async function addTransactionAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // 1. Pobierz portfel
  const { data: wallet, error: walletError } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.wallet)
    .eq('user_id', userId)
    .single();

  if (walletError || !wallet) {
    console.error('Error finding wallet:', walletError);
    throw new Error("Wallet not found");
  }

  // 2. Dodaj transakcję
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

  if (insertError) {
    console.error('Error adding transaction:', insertError);
    throw new Error(insertError.message);
  }

  // 3. Zaktualizuj saldo
  await supabaseAdmin
    .from('wallets')
    .update({ balance: wallet.balance + data.amount })
    .eq('id', data.wallet);

  revalidatePath('/', 'layout');
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
  await supabaseAdmin
    .from('wallets')
    .update({ balance: transaction.wallet.balance - transaction.amount })
    .eq('id', transaction.wallet_id);

  await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function editTransactionAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { data: oldTransaction } = await supabaseAdmin
    .from('transactions')
    .select('*, wallet:wallets(*)')
    .eq('id', id)
    .single();

  if (!oldTransaction || oldTransaction.wallet?.user_id !== userId) return;

  // 1. Cofnij starą transakcję
  await supabaseAdmin
    .from('wallets')
    .update({ balance: oldTransaction.wallet.balance - oldTransaction.amount })
    .eq('id', oldTransaction.wallet_id);

  // 2. Zaktualizuj transakcję
  await supabaseAdmin
    .from('transactions')
    .update({
      amount: data.amount,
      category: data.category,
      description: data.description,
      type: data.type,
      date: data.date,
      wallet_id: data.wallet
    })
    .eq('id', id);

  // 3. Dodaj do nowego portfela
  const { data: newWallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.wallet)
    .single();

  if (newWallet) {
    await supabaseAdmin
      .from('wallets')
      .update({ balance: newWallet.balance + data.amount })
      .eq('id', newWallet.id);
  }

  revalidatePath('/', 'layout');
}

// --- PORTFELE ---

export async function addWalletAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin
    .from('wallets')
    .insert({
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

  if (error) {
    console.error('Error adding wallet:', error);
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
}

export async function editWalletAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Sprawdź czy portfel należy do użytkownika
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!wallet || wallet.user_id !== userId) return;

  await supabaseAdmin
    .from('wallets')
    .update({
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon
    })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteWalletAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Sprawdź czy portfel należy do użytkownika
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!wallet || wallet.user_id !== userId) return;

  // Usuń najpierw transakcje (Supabase nie ma cascade by default)
  await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('wallet_id', id);

  await supabaseAdmin
    .from('wallets')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

// --- WYLOGOWANIE ---
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}
