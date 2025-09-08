import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthenticatedApi } from "../services/hooks.js";
import { listTransactions } from "../services/plaidService.jsx";

// Create a context for UserPlaid
const UserPlaidContext = createContext();
let didFetch = false

// Provider component for UserPlaidContext
export const UserPlaidProvider = ({ children }) => {
  // Get authenticated API and sign-in status
  const { api, isSignedIn } = useAuthenticatedApi();
  
  // State to hold transactions and loading status
  const [plaidTransactions, setPlaidTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Function to fetch transactions from the API
  const fetchTransactions = useCallback(async () => {
    try {
      // Set loading state to true before fetching
      setLoadingTransactions(true);
      
      // Fetch new transactions using the API
      const newTransactions = await listTransactions(api);
      
      // Update the state with unique transactions
      setPlaidTransactions((prev) => {
        // Create a set of existing transaction IDs for uniqueness check
        const existingIds = new Set(prev.map((tx) => tx.id));
        
        // Filter out transactions that already exist
        const uniqueTransactions = newTransactions.filter((tx) => !existingIds.has(tx.id));
        
        // Return the updated list of transactions
        return [...prev, ...uniqueTransactions];
      });
    } catch (error) {
      // Log any errors that occur during fetching
      console.error("Error fetching transactions:", error);
    } finally {
      // Set loading state to false after fetching is complete
      setLoadingTransactions(false);
    }
  }, [api]);

  // Effect to fetch transactions when the user is signed in
  useEffect(() => {
    if (!isSignedIn) return;
    if (!didFetch) {
      fetchTransactions();
      didFetch = true;
    }
  }, [fetchTransactions, isSignedIn]);
  console.log(plaidTransactions)
  // Provide the context value to children components
  return (
    <UserPlaidContext.Provider
      value={{
        plaidTransactions,
        setPlaidTransactions,
        fetchTransactions,
        loadingTransactions,
      }}
    >
      {children}
    </UserPlaidContext.Provider>
  );
};

// Custom hook to use UserPlaidContext
export const useUserPlaid = () => useContext(UserPlaidContext);