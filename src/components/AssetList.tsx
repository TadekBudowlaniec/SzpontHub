import { Asset } from '@/hooks/useFinanceStore';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import {
  TokenBTC,
  TokenETH,
  TokenSOL,
  TokenBNB,
  TokenXRP,
  TokenADA,
  TokenDOGE,
  TokenDOT,
  TokenMATIC,
  TokenLTC,
  TokenAVAX,
  TokenLINK,
  TokenUNI,
  TokenATOM,
  TokenXLM,
  TokenUSDT,
  TokenUSDC,
} from '@token-icons/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoIconMap: Record<string, React.ComponentType<any>> = {
  BTC: TokenBTC,
  ETH: TokenETH,
  SOL: TokenSOL,
  BNB: TokenBNB,
  XRP: TokenXRP,
  ADA: TokenADA,
  DOGE: TokenDOGE,
  DOT: TokenDOT,
  MATIC: TokenMATIC,
  LTC: TokenLTC,
  AVAX: TokenAVAX,
  LINK: TokenLINK,
  UNI: TokenUNI,
  ATOM: TokenATOM,
  XLM: TokenXLM,
  USDT: TokenUSDT,
  USDC: TokenUSDC,
};

interface AssetListProps {
  assets: Asset[];
}

export function AssetList({ assets }: AssetListProps) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.total_value, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-card-foreground mb-1">Aktywa</h2>
          <p className="text-muted-foreground text-sm">Portfel inwestycyjny</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Całkowita wartość</p>
          <p className="text-2xl font-bold text-card-foreground">
            {totalValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {assets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Brak aktywów</p>
        ) : (
          assets.map((asset) => {
            const isPositive = asset.change_24h >= 0;

            return (
              <div
                key={asset.id}
                className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      {(() => {
                        const IconComponent = cryptoIconMap[asset.symbol.toUpperCase()];
                        if (IconComponent) {
                          return <IconComponent size={24} variant="branded" />;
                        }
                        return <Coins className="w-5 h-5 text-muted-foreground" />;
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-card-foreground font-medium">{asset.name}</h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          {asset.symbol}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {asset.quantity} × {asset.current_price.toLocaleString('pl-PL')} PLN
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-card-foreground">
                      {asset.total_value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="text-sm font-medium">
                        {isPositive ? '+' : ''}{asset.change_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isPositive
                        ? 'bg-gradient-to-r from-green-600 to-green-400'
                        : 'bg-gradient-to-r from-red-600 to-red-400'
                    }`}
                    style={{ width: `${Math.min((asset.total_value / totalValue) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="w-full mt-4 py-3 text-sm text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-lg border border-border transition-colors">
        Zarządzaj aktywami
      </button>
    </div>
  );
}
