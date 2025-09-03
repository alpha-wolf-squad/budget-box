import { useCallback, useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useAuthenticatedApi } from "../../services/hooks.js";
import { useUserPlaid } from "../../context/UserPlaidContext.jsx";
import { Button, Box } from "@mui/material";

const PlaidLinkButton = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const {api} = useAuthenticatedApi();
  const { setPlaidTransactions } = useUserPlaid(); // <-- context

  const onSuccess = useCallback(
    (publicToken) => {
      const exchangePublicToken = async () => {
        try {
          const response = await api.post(
            "http://localhost:8000/api/plaid/exchange-public-token/",
            { public_token: publicToken },
          );
          if (response.status === 200) {
            // Step 2: Pull new transactions from Plaid and save to DB
            const newTxResponse = await api.get(
              "http://localhost:8000/api/plaid/get-transactions/",
            );

            if (newTxResponse.status === 200) {
              // Step 3: Refresh context state from DB
              setPlaidTransactions(newTxResponse.data.transactions);
            }
          }
        } catch (error) {
          console.error("Error exchanging public token:", error);
        }
      };
      exchangePublicToken();
    },
    [api, setPlaidTransactions],
  );

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
    // onEvent
    // onExit
  });

  //NOTE: User clicks "Connect a bank account".  This will create a link_token, and open the link modal.
  const handleCreateLinkToken = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        "http://localhost:8000/api/plaid/create-link-token/",
      );
      const { link_token } = await response.data;
      setToken(link_token);
    } catch (error) {
      console.error("Error creating link token:", error);
    } finally {
      setLoading(false);
    }
  };

  //Our useEffect triggers once the link_token has been successfully created
  useEffect(() => {
    if (token && ready) {
      console.log("creating link token");
      open();
      setToken(null);
    }
  }, [token, ready, open]);

  return (
      <Button
        onClick={handleCreateLinkToken}
        disabled={loading || (!ready && token)}
        variant="contained"
      >
        {loading ? "Loading..." : "Connect a bank account"}
      </Button>
  );
};

export default PlaidLinkButton;
