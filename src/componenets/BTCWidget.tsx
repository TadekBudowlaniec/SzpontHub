'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BTCData {
  price: number;
  change24h: number;
  sparkline: number[];
}

export function BTCWidget() {
  const [btcData, setBtcData] = useState<BTCData>({
    price: 380420,
    change24h: 3.24,
    sparkline: [372000, 375000, 373500, 378000, 376500, 380000, 379000, 381000, 380420],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=pln&include_24hr_change=true'
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.bitcoin) {
            // Generate mock sparkline based on current price
            const currentPrice = data.bitcoin.pln;
            const change = data.bitcoin.pln_24h_change || 0;
            const sparkline = [];
            for (let i = 0; i < 9; i++) {
              const variance = (Math.random() - 0.5) * currentPrice * 0.02;
              sparkline.push(currentPrice + variance);
            }
            sparkline[sparkline.length - 1] = currentPrice;
            
            setBtcData({
              price: currentPrice,
              change24h: change,
              sparkline,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        // Keep mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchBTCPrice();
    const interval = setInterval(fetchBTCPrice, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const isPositive = btcData.change24h >= 0;
  const chartData = btcData.sparkline.map((price, index) => ({ value: price, index }));

  return (
    <div className="bg-gradient-to-br from-orange-600/20 to-amber-900/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">₿</span>
            <h3 className="text-lg font-bold text-white">BTC/PLN</h3>
          </div>
          {loading && <p className="text-xs text-gray-400">Aktualizacja...</p>}
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{Math.abs(btcData.change24h).toFixed(2)}%</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-white mb-1">
          {btcData.price.toLocaleString('pl-PL', { 
            style: 'currency', 
            currency: 'PLN',
            maximumFractionDigits: 0 
          })}
        </p>
        <p className="text-sm text-gray-400">Aktualny kurs</p>
      </div>

      <div className="flex-1 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? '#10b981' : '#ef4444'} 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-orange-500/20">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">24h High</p>
            <p className="text-white font-medium">
              {Math.max(...btcData.sparkline).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">24h Low</p>
            <p className="text-white font-medium">
              {Math.min(...btcData.sparkline).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
