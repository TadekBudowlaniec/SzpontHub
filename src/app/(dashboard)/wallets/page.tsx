import { getWalletsWithTransactions } from "@/app/actions";
import { WalletsPageClient } from "@/components/pages/WalletsPageClient";

export default async function WalletsPage() {
  const data = await getWalletsWithTransactions();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <WalletsPageClient
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
    />
  );
}
