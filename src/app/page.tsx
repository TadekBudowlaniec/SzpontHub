import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";
import { DashboardClient } from "@/components/DashboardClient";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData();

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
    />
  );
}
