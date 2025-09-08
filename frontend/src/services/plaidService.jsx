// services/plaidService.jsx
export const createLinkToken = async (api) => {
    const response = await api.post("http://localhost:8000/api/plaid/create-link-token/");
    return response.data.link_token;
  };
  
export const exchangePublicToken = async (api, publicToken) => {
    const response = await api.post("http://localhost:8000/api/plaid/exchange-public-token/", {
        public_token: publicToken,
    });
    return response.status === 200;
};

export const fetchTransactionsFromApi = async (api) => {
    const response = await api.get("http://localhost:8000/api/plaid/get-transactions/");
    return response.data.transactions;
};

export const listTransactions = async (api) => {
    const response = await api.get("http://localhost:8000/api/plaid/list-transactions/");
    return response.data.transactions;
};

export const refreshTransactions = async (api) => {
    console.log("Refreshing the transactions...")
    const res = await api.get(`http://localhost:8000/api/plaid/refresh-transactions/`);
    console.log("Refreshed transactions: ", res.data);
}