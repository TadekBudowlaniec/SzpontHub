import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";
import { DashboardClient } from "@/components/DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  // POPRAWKA: Używamy NextAuth do sprawdzenia sesji, a nie supabase.auth!
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const data = await getDashboardData();
  const userName = session.user.name || session.user.email?.split('@')[0] || 'Użytkownik';

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <DashboardClient
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
      initialAssets={data.assets}
      userName={userName}
    />
  );
}