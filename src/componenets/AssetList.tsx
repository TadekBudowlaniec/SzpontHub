import { Asset } from '@/hooks/useFinanceStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
}

export function AssetList({ assets }: AssetListProps) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Aktywa</h2>
          <p className="text-gray-400 text-sm">Portfel inwestycyjny</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Całkowita wartość</p>
          <p className="text-2xl font-bold text-white">
            {totalValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {assets.map((asset) => {
          const isPositive = asset.change24h >= 0;
          
          return (
            <div 
              key={asset.id}
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{asset.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded">
                      {asset.symbol}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {asset.quantity} × {asset.currentPrice.toLocaleString('pl-PL')} PLN
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {asset.totalValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                  </p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-sm font-medium">
                      {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-600 to-green-400' 
                      : 'bg-gradient-to-r from-red-600 to-red-400'
                  }`}
                  style={{ width: `${Math.min((asset.totalValue / totalValue) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg border border-gray-700/50 transition-colors">
        Zarządzaj aktywami
      </button>
    </div>
  );
}
