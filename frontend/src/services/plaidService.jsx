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
    const response = await api.get("http://localhost:8000/api/plaid/transactions/"
    );
    return response.data.transactions;
};

// export const addTransactions = async (api, transaction_id) => {
//     const response = await api.post("http://localhost:8000/api/plaid/transactions/", {data: {transaction_id}});
//     return response.data.transactions;
// };
export const addTransactions = async (api, transaction_id, description = '') => {
    const payload = {
        transaction_id: parseInt(transaction_id, 10), // Ensure it's an integer
        description: description
    };
    
    console.log("Sending payload:", payload); // Debug logging
    
    try {
        const response = await api.post("http://localhost:8000/api/plaid/transactions/", payload);
        return response.data; // Remove .transactions since your view doesn't return that structure
    } catch (error) {
        console.error("API Error:", error.response?.data);
        throw error;
    }
};

export const deleteTransactions = async (api, id) => {
    console.log("TX_ID: ", id)
    const response = await api.delete("http://localhost:8000/api/plaid/transactions/", {data: {id}});
    return response.data.transactions;
};

export const refreshTransactions = async (api) => {
    console.log("Refreshing the transactions...")
    const res = await api.get(`http://localhost:8000/api/plaid/refresh-transactions/`);
    console.log("Refreshed transactions: ", res.data);
}