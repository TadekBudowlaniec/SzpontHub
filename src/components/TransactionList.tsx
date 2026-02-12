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
    <div className="p-6">
      <h3 className="text-xl font-bold text-card-foreground mb-4">Ostatnie transakcje</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Brak transakcji</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{transaction.category}</p>
                  <p className="text-sm text-muted-foreground">{transaction.description} • {format(new Date(transaction.date), 'dd MMM', { locale: pl })}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-card-foreground'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                  </p>
                  <p className="text-xs text-muted-foreground">{transaction.walletName}</p>
                </div>

                <div className="flex gap-1 opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition-colors"
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
