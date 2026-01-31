import { useEffect } from 'react';
import { Car, X } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../data/utils';

export default function Toast() {
  const { latestTransaction, dismissNotification } = useTransactions();

  useEffect(() => {
    if (latestTransaction) {
      const timer = setTimeout(dismissNotification, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestTransaction, dismissNotification]);

  if (!latestTransaction) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-bg-dark text-white rounded-xl shadow-2xl p-4 max-w-sm flex items-start gap-3">
        <div className="bg-green-500 rounded-full p-2 shrink-0">
          <Car className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">New Transaction</p>
          <p className="text-xs text-gray-300 mt-0.5">
            {latestTransaction.vehicleReg} - {formatCurrency(latestTransaction.total)}
          </p>
          <p className="text-xs text-gray-400">
            {latestTransaction.staffName} - {latestTransaction.paymentMethod}
          </p>
        </div>
        <button
          onClick={dismissNotification}
          className="text-gray-400 hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}
