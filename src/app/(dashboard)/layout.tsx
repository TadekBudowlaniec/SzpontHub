import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getUser } from "@/lib/supabase/cached";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Użytkownik';

  return (
    <DashboardLayout userName={userName}>
      {children}
    </DashboardLayout>
  );
}
