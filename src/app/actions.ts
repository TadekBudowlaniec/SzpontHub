'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  return session?.user?.id;
}

// --- POBIERANIE DANYCH ---
export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  const wallets = await prisma.wallet.findMany({ where: { userId } });
  
  const transactionsRaw = await prisma.transaction.findMany({
    where: { wallet: { userId } },
    include: { wallet: true },
    orderBy: { date: 'desc' }
  });

  const transactions = transactionsRaw.map(t => ({
    ...t,
    date: t.date.toISOString().split('T')[0],
    walletName: t.wallet.name,
    wallet: t.walletId, // Mapowanie dla zgodności z frontendem
    type: t.type as 'income' | 'outcome'
  }));

  const assets = await prisma.asset.findMany({ where: { userId } });

  return { wallets, transactions, assets };
}

// --- TRANSAKCJE ---

export async function addTransactionAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // 1. Dodaj transakcję
  await prisma.transaction.create({
    data: {
      amount: data.amount,
      category: data.category,
      description: data.description,
      type: data.type,
      date: new Date(data.date),
      walletId: data.wallet
    }
  });

  // 2. Zaktualizuj saldo (dodajemy kwotę - jeśli wydatek, kwota jest ujemna, więc się odejmie)
  const wallet = await prisma.wallet.findUnique({ where: { id: data.wallet } });
  if (wallet) {
    await prisma.wallet.update({
      where: { id: data.wallet },
      data: { balance: wallet.balance + data.amount }
    });
  }

  revalidatePath('/');
}

export async function deleteTransactionAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return;

  // Cofnij saldo (odejmij kwotę transakcji)
  const wallet = await prisma.wallet.findUnique({ where: { id: transaction.walletId } });
  if (wallet) {
    await prisma.wallet.update({
      where: { id: transaction.walletId },
      data: { balance: wallet.balance - transaction.amount }
    });
  }

  await prisma.transaction.delete({ where: { id } });
  revalidatePath('/');
}

export async function editTransactionAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const oldTransaction = await prisma.transaction.findUnique({ where: { id } });
  if (!oldTransaction) return;

  // Logika aktualizacji salda:
  // 1. Cofnij starą transakcję ze starego portfela
  const oldWallet = await prisma.wallet.findUnique({ where: { id: oldTransaction.walletId } });
  if (oldWallet) {
    await prisma.wallet.update({
      where: { id: oldWallet.id },
      data: { balance: oldWallet.balance - oldTransaction.amount }
    });
  }

  // 2. Zaktualizuj transakcję
  await prisma.transaction.update({
    where: { id },
    data: {
      amount: data.amount,
      category: data.category,
      description: data.description,
      type: data.type,
      date: new Date(data.date),
      walletId: data.wallet
    }
  });

  // 3. Dodaj nową transakcję do nowego portfela (może być ten sam)
  const newWallet = await prisma.wallet.findUnique({ where: { id: data.wallet } });
  if (newWallet) {
    await prisma.wallet.update({
      where: { id: newWallet.id },
      data: { balance: newWallet.balance + data.amount }
    });
  }

  revalidatePath('/');
}

// --- PORTFELE ---

export async function addWalletAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  await prisma.wallet.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
      balance: 0 // Startujemy od zera
    }
  });
  revalidatePath('/');
}

export async function editWalletAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  await prisma.wallet.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon
    }
  });
  revalidatePath('/');
}

export async function deleteWalletAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Prisma ma onDelete: Cascade, więc transakcje usuną się same
  await prisma.wallet.delete({ where: { id } });
  revalidatePath('/');
}