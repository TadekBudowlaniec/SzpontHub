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
    // Sytuacja brzegowa: user zalogowany ale nie ma go w bazie (np. usunięty)
    return <div>Nie znaleziono danych użytkownika.</div>;
  }

  return (
    <DashboardClient 
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
      initialAssets={data.assets}
    />
  );
}