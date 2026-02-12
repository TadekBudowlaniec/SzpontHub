'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

// --- POBIERANIE DANYCH ---
export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  const { data: wallets } = await supabaseAdmin
    .from('Wallet')
    .select('*')
    .eq('userId', userId);

  const { data: transactionsRaw } = await supabaseAdmin
    .from('Transaction')
    .select(`
      *,
      wallet:Wallet(name)
    `)
    .in('walletId', (wallets || []).map(w => w.id))
    .order('date', { ascending: false });

  const transactions = (transactionsRaw || []).map(t => ({
    ...t,
    date: t.date.split('T')[0],
    walletName: t.wallet?.name || '',
    wallet: t.walletId,
    type: t.type as 'income' | 'outcome'
  }));

  const { data: assets } = await supabaseAdmin
    .from('Asset')
    .select('*')
    .eq('userId', userId);

  return { wallets: wallets || [], transactions, assets: assets || [] };
}

// --- TRANSAKCJE ---

export async function addTransactionAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // 1. Pobierz portfel
  const { data: wallet } = await supabaseAdmin
    .from('Wallet')
    .select('*')
    .eq('id', data.wallet)
    .eq('userId', userId)
    .single();

  if (!wallet) throw new Error("Wallet not found");

  // 2. Dodaj transakcję
  await supabaseAdmin
    .from('Transaction')
    .insert({
      amount: data.amount,
      category: data.category,
      description: data.description,
      type: data.type,
      date: data.date,
      walletId: data.wallet,
      createdAt: new Date().toISOString()
    });

  // 3. Zaktualizuj saldo
  await supabaseAdmin
    .from('Wallet')
    .update({ balance: wallet.balance + data.amount })
    .eq('id', data.wallet);

  revalidatePath('/');
}

export async function deleteTransactionAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { data: transaction } = await supabaseAdmin
    .from('Transaction')
    .select('*, wallet:Wallet(*)')
    .eq('id', id)
    .single();

  if (!transaction || transaction.wallet?.userId !== userId) return;

  // Cofnij saldo
  await supabaseAdmin
    .from('Wallet')
    .update({ balance: transaction.wallet.balance - transaction.amount })
    .eq('id', transaction.walletId);

  await supabaseAdmin
    .from('Transaction')
    .delete()
    .eq('id', id);

  revalidatePath('/');
}

export async function editTransactionAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { data: oldTransaction } = await supabaseAdmin
    .from('Transaction')
    .select('*, wallet:Wallet(*)')
    .eq('id', id)
    .single();

  if (!oldTransaction || oldTransaction.wallet?.userId !== userId) return;

  // 1. Cofnij starą transakcję
  await supabaseAdmin
    .from('Wallet')
    .update({ balance: oldTransaction.wallet.balance - oldTransaction.amount })
    .eq('id', oldTransaction.walletId);

  // 2. Zaktualizuj transakcję
  await supabaseAdmin
    .from('Transaction')
    .update({
      amount: data.amount,
      category: data.category,
      description: data.description,
      type: data.type,
      date: data.date,
      walletId: data.wallet
    })
    .eq('id', id);

  // 3. Dodaj do nowego portfela
  const { data: newWallet } = await supabaseAdmin
    .from('Wallet')
    .select('*')
    .eq('id', data.wallet)
    .single();

  if (newWallet) {
    await supabaseAdmin
      .from('Wallet')
      .update({ balance: newWallet.balance + data.amount })
      .eq('id', newWallet.id);
  }

  revalidatePath('/');
}

// --- PORTFELE ---

export async function addWalletAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin
    .from('Wallet')
    .insert({
      id: nanoid(),
      userId,
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
      balance: 0,
      currency: 'PLN',
      createdAt: new Date().toISOString()
    });

  if (error) {
    console.error('Error adding wallet:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function editWalletAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Sprawdź czy portfel należy do użytkownika
  const { data: wallet } = await supabaseAdmin
    .from('Wallet')
    .select('userId')
    .eq('id', id)
    .single();

  if (!wallet || wallet.userId !== userId) return;

  await supabaseAdmin
    .from('Wallet')
    .update({
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon
    })
    .eq('id', id);

  revalidatePath('/');
}

export async function deleteWalletAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Sprawdź czy portfel należy do użytkownika
  const { data: wallet } = await supabaseAdmin
    .from('Wallet')
    .select('userId')
    .eq('id', id)
    .single();

  if (!wallet || wallet.userId !== userId) return;

  // Usuń najpierw transakcje (Supabase nie ma cascade by default)
  await supabaseAdmin
    .from('Transaction')
    .delete()
    .eq('walletId', id);

  await supabaseAdmin
    .from('Wallet')
    .delete()
    .eq('id', id);

  revalidatePath('/');
}

// --- WYLOGOWANIE ---
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
}
