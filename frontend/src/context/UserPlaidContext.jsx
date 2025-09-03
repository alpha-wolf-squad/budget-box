// context/UserFinanceContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuthenticatedApi } from "../services/hooks.js";
// import { useUser } from "@clerk/clerk-react";
const UserPlaidContext = createContext();

let didFetch = false;

export const UserPlaidProvider = ({ children }) => {
  const { api, isSignedIn } = useAuthenticatedApi();
  const [transactions, setPlaidTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Fetch transactions from backend
  const fetchTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const response = await api.get(
        "http://localhost:8000/api/plaid/list-transactions/",
      );
      if (response.status === 200) {
        setPlaidTransactions((prev) => {
          // Merge new transactions without duplicating
          const existingIds = new Set(prev.map((tx) => tx.id));
          const newTxs = response.data.transactions.filter(
            (tx) => !existingIds.has(tx.id),
          );
          return [...prev, ...newTxs];
        });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  }, [api]);

  // Auto-fetch on mount
  useEffect(() => {
    if (!isSignedIn) return;

    if (!didFetch) {
      fetchTransactions();
      didFetch = true;
    }
  }, [fetchTransactions, isSignedIn]);

  //Used to show transactions are fetching
  console.log(transactions);
  return (
    <UserPlaidContext.Provider
      value={{
        transactions,
        setPlaidTransactions,
        fetchTransactions,
        loadingTransactions,
      }}
    >
      {children}
    </UserPlaidContext.Provider>
  );
};

export const useUserPlaid = () => useContext(UserPlaidContext);
