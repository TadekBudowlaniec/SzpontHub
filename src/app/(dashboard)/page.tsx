import { getDashboardData } from "@/app/actions";
import { DashboardOverview } from "@/components/DashboardOverview";
import { getUser } from "@/lib/supabase/cached";

export default async function Home() {
  const [user, data] = await Promise.all([
    getUser(),
    getDashboardData(),
  ]);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Użytkownik';

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <DashboardOverview
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
      initialAssets={data.assets}
      userName={userName}
    />
  );
}
