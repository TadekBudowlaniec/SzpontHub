import { Transaction } from '@/hooks/useFinanceStore';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Ostatnie Transakcje</h2>
          <p className="text-gray-400 text-sm">Najnowsze wpływy i wydatki</p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'income';
          const amount = Math.abs(transaction.amount);
          
          return (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isIncome 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {isIncome ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>
                
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{transaction.category}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleDateString('pl-PL', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold ${
                  isIncome ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isIncome ? '+' : '-'}
                  {amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                </p>
                <p className="text-xs text-gray-400 mt-1">{transaction.wallet}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg border border-gray-700/50 transition-colors">
        Zobacz wszystkie transakcje
      </button>
    </div>
  );
}
