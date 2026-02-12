'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BTCData {
  price: number;
  change24h: number;
  sparkline: number[];
  high24h: number;
  low24h: number;
}

export function BTCWidget() {
  const [btcData, setBtcData] = useState<BTCData>({
    price: 0,
    change24h: 0,
    sparkline: [],
    high24h: 0,
    low24h: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        setLoading(true);

        // Fetch market chart data for last 24h (real sparkline)
        const chartResponse = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=pln&days=1'
        );

        if (chartResponse.ok) {
          const chartData = await chartResponse.json();
          const prices = chartData.prices as [number, number][];

          if (prices && prices.length > 0) {
            // Get sparkline - sample every ~2 hours (24 points from ~288)
            const step = Math.floor(prices.length / 24);
            const sparkline = prices
              .filter((_, i) => i % step === 0 || i === prices.length - 1)
              .map(p => p[1]);

            const currentPrice = prices[prices.length - 1][1];
            const price24hAgo = prices[0][1];
            const change24h = ((currentPrice - price24hAgo) / price24hAgo) * 100;

            const allPrices = prices.map(p => p[1]);
            const high24h = Math.max(...allPrices);
            const low24h = Math.min(...allPrices);

            setBtcData({
              price: currentPrice,
              change24h,
              sparkline,
              high24h,
              low24h,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching BTC price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBTCPrice();
    const interval = setInterval(fetchBTCPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  const isPositive = btcData.change24h >= 0;
  const chartData = btcData.sparkline.map((price, index) => ({ value: price, index }));

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-card-foreground mb-1">BTC/PLN</h3>
          {loading && <p className="text-xs text-muted-foreground">Aktualizacja...</p>}
        </div>

        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{Math.abs(btcData.change24h).toFixed(2)}%</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-card-foreground mb-1">
          {btcData.price.toLocaleString('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            maximumFractionDigits: 0
          })}
        </p>
        <p className="text-sm text-muted-foreground">Aktualny kurs</p>
      </div>

      <div className="flex-1 min-h-[120px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Ładowanie wykresu...
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">24h High</p>
            <p className="text-card-foreground font-medium">
              {btcData.high24h.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">24h Low</p>
            <p className="text-card-foreground font-medium">
              {btcData.low24h.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
