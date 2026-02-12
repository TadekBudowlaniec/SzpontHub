'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Interval = '1D' | '1W' | '1M';

const generateMockData = (interval: Interval) => {
  const now = new Date();
  const data = [];
  
  if (interval === '1D') {
    // 24 hours
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
        value: 147000 + Math.random() * 4000 + (23 - i) * 100,
      });
    }
  } else if (interval === '1W') {
    // 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString('pl-PL', { weekday: 'short' }),
        value: 145000 + Math.random() * 6000 + (6 - i) * 500,
      });
    }
  } else {
    // 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
        value: 135000 + Math.random() * 15000 + (29 - i) * 400,
      });
    }
  }
  
  return data;
};

export function FinancialChart() {
  const [interval, setInterval] = useState<Interval>('1W');
  
  const data = useMemo(() => generateMockData(interval), [interval]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-gray-400 text-sm">{payload[0].payload.time}</p>
          <p className="text-white font-bold text-lg">
            {payload[0].value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Wartość Portfela</h2>
          <p className="text-gray-400 text-sm">Całkowita wartość w czasie</p>
        </div>
        
        <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
          {(['1D', '1W', '1M'] as Interval[]).map((int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                interval === int
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#9333ea" 
            strokeWidth={2}
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
