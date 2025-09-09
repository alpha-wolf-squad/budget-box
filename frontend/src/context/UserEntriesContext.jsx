import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthenticatedApi } from "../services/hooks.js";
import { listExpenses } from "../services/entriesService.jsx";

// Create a context for UserEntries
const UserEntriesContext = createContext();
let didFetch = false

// Provider component for UserEntriesContext
export const UserEntriesProvider = ({ children }) => {
  // Get authenticated API and sign-in status
  const { api, isSignedIn } = useAuthenticatedApi();
  
  // State to hold transactions and loading status
  const [entriesExpenses, setEntriesExpenses] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Function to fetch transactions from the API
  const fetchEntries = useCallback(async () => {
    try {
      // Set loading state to true before fetching
      setLoadingEntries(true);
      
      // Fetch new transactions using the API
      const newTransactions = await listExpenses(api);
      console.log("NEW_TRANSACTIONS", newTransactions)
      // Update the state with unique transactions
      setEntriesExpenses((prev) => {
        // Create a set of existing transaction IDs for uniqueness check
        const existingIds = new Set(prev.map((tx) => tx.id));
        
        // Filter out transactions that already exist
        const uniqueTransactions = newTransactions.filter((tx) => !existingIds.has(tx.id));
        
        // Return the updated list of transactions
        return [...prev, ...uniqueTransactions];
      });
    } catch (error) {
      // Log any errors that occur during fetching
      console.error("Error fetching entries_expenses:", error);
    } finally {
      // Set loading state to false after fetching is complete
      setLoadingEntries(false);
    }
  }, [api]);

  // Effect to fetch transactions when the user is signed in
  useEffect(() => {
    if (!isSignedIn) return;
    if (!didFetch) {
      fetchEntries();
      didFetch = true;
    }
  }, [fetchEntries, isSignedIn]);
  console.log(entriesExpenses)
  // Provide the context value to children components
  return (
    <UserEntriesContext.Provider
      value={{
        entriesExpenses,
        setEntriesExpenses,
        fetchEntries,
        loadingEntries,
      }}
    >
      {children}
    </UserEntriesContext.Provider>
  );
};

// Custom hook to use UserEntriesContext
export const useUserEntries = () => useContext(UserEntriesContext);