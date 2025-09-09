// useBudget.js
import { useCallback } from "react";
import { useAuthenticatedApi } from "./hooks"; // assumes it returns { api }

export default function useBudget() {
    const { api } = useAuthenticatedApi();
    const BASE = "http://127.0.0.1:8000/api"//import.meta.env.VITE_BASE_API_URL;
    // console.log("BASE API URL: ", BASE)

    // stable function reference for useEffect deps
    const getBudget = useCallback(
        async (date) => {
            // console.log(`Fetching budget for date: ${date}`); // Debugging log
            const res = await api.get(`${BASE}/entries/budget/`, {
                params: { date }, // e.g. "2025-04" or "2025-04-01"
            });
            // console.log(`Response received:`, res.data); // Debugging log
            return res.data;   // { budget, streams }
        },
        [api, BASE]
    );

    return { getBudget };
}