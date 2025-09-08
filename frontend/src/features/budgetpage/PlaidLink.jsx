import { useCallback, useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useAuthenticatedApi } from "../../services/hooks.js";
import { useUserPlaid } from "../../context/UserPlaidContext.jsx";
import { Button } from "@mui/material";
import { createLinkToken, exchangePublicToken, fetchTransactionsFromApi } from "../../services/plaidService.jsx";

const PlaidLinkButton = ({ onPlaidConnected }) => {
  // State to hold the link token and loading status
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Hook to access authenticated API
  const { api } = useAuthenticatedApi();
  
  // Hook to manage user's Plaid transactions
  const { setPlaidTransactions } = useUserPlaid();

  // Callback function to handle successful link connection
  const onSuccess = useCallback(
    async (publicToken) => {
      try {
        // Exchange the public token for an access token
        const tokenExchanged = await exchangePublicToken(api, publicToken);
        if (tokenExchanged) {
          onPlaidConnected(true); // Notify parent that Plaid is connected
          // Fetch transactions from the API after successful token exchange
          const transactions = await fetchTransactionsFromApi(api);
          setPlaidTransactions(transactions); // Update the context with fetched transactions
        }
      } catch (error) {
        console.error("Error during Plaid link process:", error);
        onPlaidConnected(false); // Notify parent fo failure
      }
    },
    [api, setPlaidTransactions, onPlaidConnected]
  );

  // Initialize Plaid Link with the token and success handler
  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
  });

  // Function to create a new link token
  const handleCreateLinkToken = async () => {
    setLoading(true); // Set loading state to true
    try {
      // Create a link token using the authenticated API
      const linkToken = await createLinkToken(api);
      setToken(linkToken); // Store the link token in state
    } catch (error) {
      console.error("Error creating link token:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Effect to open the Plaid Link when the token is ready
  useEffect(() => {
    if (token && ready) {
      open(); // Open the Plaid Link
      setToken(null); // Reset the token after opening
    }
  }, [token, ready, open]);

  return (
    <Button
      onClick={handleCreateLinkToken} // Trigger token creation on button click
      disabled={loading || (!ready && token)} // Disable button if loading or not ready
      variant="contained"
    >
      {loading ? "Loading..." : "Connect a bank account"} // Button text based on loading state
    </Button>
  );
};

export default PlaidLinkButton;