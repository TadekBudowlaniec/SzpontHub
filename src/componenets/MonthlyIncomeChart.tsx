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
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-gray-400 text-sm mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-green-400 text-sm">
                Przychody: {payload[0].value.toLocaleString('pl-PL')} PLN
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-red-400 text-sm">
                Wydatki: {payload[1].value.toLocaleString('pl-PL')} PLN
              </p>
            </div>
            <div className="border-t border-gray-700 mt-2 pt-2">
              <p className="text-white font-medium text-sm">
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
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Miesięczny Cashflow</h2>
        <p className="text-gray-400 text-sm">Porównanie przychodów i wydatków</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="month" 
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
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-gray-400 text-sm">
                {value === 'income' ? 'Przychody' : 'Wydatki'}
              </span>
            )}
          />
          <Bar 
            dataKey="income" 
            fill="#10b981" 
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
