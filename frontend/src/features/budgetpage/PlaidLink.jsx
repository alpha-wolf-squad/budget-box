import { useCallback, useState, useEffect } from "react";

import { usePlaidLink } from "react-plaid-link";
import { useAuthenticatedApi } from "../../services/hooks.js";

const PlaidLinkButton = () => {
  const [token, setToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const api = useAuthenticatedApi();
  // get link_token from your server when component mounts
  useEffect(() => {
    const createLinkToken = async () => {
      const response = await api.post(
        "http://localhost:8000/api/plaid/create-link-token/",
      );
      const { link_token } = await response.data;
      setToken(link_token);
    };
    createLinkToken();
  }, []);

  const onSuccess = useCallback((publicToken, metadata) => {
    // send public_token to your server
    // https://plaid.com/docs/api/tokens/#token-exchange-flow
    const exchangePublicToken = async () => {
      const response = await api.post(
        "http://localhost:8000/api/plaid/exchange-public-token/",
        { public_token: publicToken },
      );
      const { access_token } = await response.data;
      setAccessToken(access_token);
    };
    exchangePublicToken();
  }, []);

  console.log("accessToken", accessToken);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
    // onEvent
    // onExit
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
};

export default PlaidLinkButton;
