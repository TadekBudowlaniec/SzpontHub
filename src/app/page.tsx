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

  // Jeśli użytkownik jest zalogowany, ale nie ma danych (np. błąd bazy), pokaż komunikat lub pusty dashboard
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Ładowanie danych lub brak dostępu...
      </div>
    );
  }

  // Przekazujemy dane z serwera do komponentu klienta
  return (
    <DashboardClient 
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
      initialAssets={data.assets}
    />
  );
}