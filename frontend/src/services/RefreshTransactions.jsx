import { useCallback } from "react";
import { useAuthenticatedApi } from "./hooks";

export default function useRefreshTransactions() {
    const { api } = useAuthenticatedApi();
    const BASE = import.meta.env.VITE_BASE_API_URL;

    const refreshTransactions = useCallback(
        async () => {
            console.log("Refreshing the transactions...")
            const res = await api.get(`${BASE}/plaid/refresh-transactions/`);
            console.log("Refreshed transactions: ", res.data);
        },
        [api, BASE]
    );
    return { refreshTransactions };
}