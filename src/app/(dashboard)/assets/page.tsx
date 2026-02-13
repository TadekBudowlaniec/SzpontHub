import { getAssetsData } from "@/app/actions";
import { AssetsPageClient } from "@/components/pages/AssetsPageClient";

export default async function AssetsPage() {
  const data = await getAssetsData();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <AssetsPageClient initialAssets={data.assets} />
  );
}
