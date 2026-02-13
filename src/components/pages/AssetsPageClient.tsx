'use client';

import { useEffect } from 'react';
import { AssetList } from '@/components/AssetList';
import { useFinanceStore, Asset } from '@/hooks/useFinanceStore';

interface Props {
  initialAssets: Asset[];
}

export function AssetsPageClient({ initialAssets }: Props) {
  const { assets, setAssets } = useFinanceStore();

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets, setAssets]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Aktywa</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <AssetList assets={assets} />
      </div>
    </>
  );
}
