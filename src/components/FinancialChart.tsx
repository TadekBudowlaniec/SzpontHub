'use client';

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/hooks/useFinanceStore';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface FinancialChartProps {
  transactions: Transaction[];
}

export function FinancialChart({ transactions }: FinancialChartProps) {
  const [range, setRange] = useState<'1W' | '1M' | '3M'>('1M');

  // Funkcja generująca dane do wykresu na podstawie historii transakcji
  const chartData = useMemo(() => {
    const days = range === '1W' ? 7 : range === '1M' ? 30 : 90;
    const data = [];
    let currentBalance = 0; 
    
    // Obliczamy balans startowy (total wszystkich transakcji przed analizowanym okresem)
    // To jest uproszczenie, w pełnej wersji można brać snapshoty
    
    const today = new Date();
    const startDate = subDays(today, days);

    // Generujemy dni dla osi X
    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Znajdź transakcje do tego dnia włącznie, aby obliczyć skumulowany stan
      // Uwaga: To symulacja historii portfela na podstawie transakcji
      const transactionsUntilNow = transactions.filter(t => new Date(t.date) <= date);
      
      const balance = transactionsUntilNow.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
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
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Wartość Portfela (Historia)</h3>
        <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
          {(['1W', '1M', '3M'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                range === r 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af' }} 
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af' }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${value.toLocaleString()} PLN`, 'Wartość']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}