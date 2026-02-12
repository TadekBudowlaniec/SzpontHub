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

// 1. POBIERANIE DANYCH
export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  const wallets = await prisma.wallet.findMany({ where: { userId } });
  
  // Pobieramy transakcje z relacją do portfela
  const transactionsRaw = await prisma.transaction.findMany({
    where: { wallet: { userId } },
    include: { wallet: true },
    orderBy: { date: 'desc' }
  });

  // Mapujemy dane, aby pasowały do Twojego interfejsu Transaction z TypeScript
  const transactions = transactionsRaw.map(t => ({
    ...t,
    date: t.date.toISOString().split('T')[0], // Data jako string YYYY-MM-DD
    walletName: t.wallet.name,
    amount: t.amount // Amount jest już float z bazy
  }));

  const assets = await prisma.asset.findMany({ where: { userId } });

  return { wallets, transactions, assets };
}

// 2. DODAWANIE TRANSAKCJI
export async function addTransactionAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Dodajemy transakcję
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

  // Aktualizujemy saldo portfela
  const wallet = await prisma.wallet.findUnique({ where: { id: data.wallet } });
  if (wallet) {
    await prisma.wallet.update({
      where: { id: data.wallet },
      data: { balance: wallet.balance + data.amount }
    });
  }

  revalidatePath('/');
}

// ... Analogicznie addWalletAction i deleteTransactionAction ...