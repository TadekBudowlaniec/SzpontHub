'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const profitData = [
  { month: 'Wrz', profit: 4300 },
  { month: 'Paź', profit: 9400 },
  { month: 'Lis', profit: 14300 },
  { month: 'Gru', profit: 18600 },
  { month: 'Sty', profit: 26500 },
  { month: 'Lut', profit: 33180 },
];

export function ProfitChart() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const previousValue = payload[0].payload.previous || 0;
      const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

      return (
        <div className="bg-card border border-primary/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm mb-1">{payload[0].payload.month}</p>
          <p className="text-card-foreground font-bold text-lg mb-1">
            {value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </p>
          {change !== 0 && (
            <p className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}% vs poprzedni
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-card-foreground mb-1">Skumulowany Zysk</h2>
        <p className="text-muted-foreground text-sm">Trend zysków w czasie</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={profitData}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Całkowity Zysk</span>
          <span className="text-2xl font-bold text-primary">
            {profitData[profitData.length - 1].profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
          </span>
        </div>
      </div>
    </div>
  );
}
