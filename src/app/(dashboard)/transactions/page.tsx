import { getTransactionsData } from "@/app/actions";
import { TransactionsPageClient } from "@/components/pages/TransactionsPageClient";

export default async function TransactionsPage() {
  const data = await getTransactionsData();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <TransactionsPageClient
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
    />
  );
}
