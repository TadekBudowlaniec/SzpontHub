'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const monthlyData = [
  { month: 'Wrz', income: 12500, outcome: 8200 },
  { month: 'Paź', income: 14200, outcome: 9100 },
  { month: 'Lis', income: 13800, outcome: 8900 },
  { month: 'Gru', income: 15500, outcome: 11200 },
  { month: 'Sty', income: 17700, outcome: 9800 },
  { month: 'Lut', income: 12000, outcome: 5320 },
];

export function MonthlyIncomeChart() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-green-500 text-sm">
                Przychody: {payload[0].value.toLocaleString('pl-PL')} PLN
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-red-500 text-sm">
                Wydatki: {payload[1].value.toLocaleString('pl-PL')} PLN
              </p>
            </div>
            <div className="border-t border-border mt-2 pt-2">
              <p className="text-card-foreground font-medium text-sm">
                Zysk: {(payload[0].value - payload[1].value).toLocaleString('pl-PL')} PLN
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-card-foreground mb-1">Miesięczny Cashflow</h2>
        <p className="text-muted-foreground text-sm">Porównanie przychodów i wydatków</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
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
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-muted-foreground text-sm">
                {value === 'income' ? 'Przychody' : 'Wydatki'}
              </span>
            )}
          />
          <Bar
            dataKey="income"
            fill="#22c55e"
            radius={[8, 8, 0, 0]}
            name="income"
          />
          <Bar
            dataKey="outcome"
            fill="#ef4444"
            radius={[8, 8, 0, 0]}
            name="outcome"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
