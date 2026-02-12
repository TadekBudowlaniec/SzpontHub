import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";
import { DashboardClient } from "@/components/DashboardClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const data = await getDashboardData();

  if (!data) {
    return <div className="text-white text-center mt-20">Ładowanie danych...</div>;
  }

  return (
    <DashboardClient 
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
      initialAssets={data.assets}
    />
  );
}