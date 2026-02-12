'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/hooks/useFinanceStore';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface FinancialChartProps {
  transactions: Transaction[];
  range: '1W' | '1M' | '3M' | '1Y';
  setRange: (range: '1W' | '1M' | '3M' | '1Y') => void;
}

export function FinancialChart({ transactions, range, setRange }: FinancialChartProps) {

  const chartData = useMemo(() => {
    const days = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
    const data = [];

    const today = new Date();
    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const transactionsUntilNow = transactions.filter(t => new Date(t.date) <= date);

      const balance = transactionsUntilNow.reduce((acc, t) => {
        return acc + t.amount;
      }, 0);

      data.push({
        date: format(date, 'dd MMM', { locale: pl }),
        value: balance,
        fullDate: dateStr
      });
    }

    return data;
  }, [transactions, range]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-card-foreground">Wartość Portfela</h3>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(['1W', '1M', '3M', '1Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-card-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '0.5rem',
              color: 'var(--card-foreground)'
            }}
            itemStyle={{ color: 'var(--card-foreground)' }}
            formatter={(value: number) => [`${value.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN`, 'Wartość']}
            labelStyle={{ color: 'var(--muted-foreground)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
