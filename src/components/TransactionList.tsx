import { Transaction } from '@/hooks/useFinanceStore';
import { ArrowUpRight, ArrowDownRight, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4">Ostatnie transakcje</h3>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Brak transakcji</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-white">{transaction.category}</p>
                  <p className="text-sm text-gray-400">{transaction.description} • {format(new Date(transaction.date), 'dd MMM', { locale: pl })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.walletName}</p>
                </div>
                
                {/* Akcje - widoczne po najechaniu (group-hover) na desktopie, zawsze na mobile */}
                <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(transaction)}
                    className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(transaction.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}