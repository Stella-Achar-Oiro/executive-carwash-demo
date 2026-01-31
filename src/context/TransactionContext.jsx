import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateDemoTransactions, generateSingleTransaction } from '../data/generateTransactions';

const TransactionContext = createContext();

const STORAGE_KEY = 'executive-carwash-transactions';

function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveTransactions(txns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch {
    // ignore
  }
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    return loadTransactions() || generateDemoTransactions(50);
  });
  const [latestTransaction, setLatestTransaction] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Auto-generate new transaction every 2-3 minutes
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 120000 + Math.random() * 60000; // 2-3 minutes
      intervalRef.current = setTimeout(() => {
        const newTxn = generateSingleTransaction(transactions.length);
        setTransactions((prev) => {
          const updated = [...prev, newTxn];
          return updated;
        });
        setLatestTransaction(newTxn);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(intervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addTransaction = useCallback((txn) => {
    setTransactions((prev) => {
      const updated = [...prev, txn];
      return updated;
    });
    setLatestTransaction(txn);
  }, []);

  const resetData = useCallback(() => {
    const fresh = generateDemoTransactions(50);
    setTransactions(fresh);
    setLatestTransaction(null);
  }, []);

  const dismissNotification = useCallback(() => {
    setLatestTransaction(null);
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        resetData,
        latestTransaction,
        dismissNotification,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be inside TransactionProvider');
  return ctx;
}
