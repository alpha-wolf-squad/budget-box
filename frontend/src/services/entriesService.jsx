export const listExpenses = async (api, date='2025-08') => {
    const response = await api.get("http://localhost:8000/api/entries/budget/", {params: date}
    );
    console.log("listExpenses call: ", response.data.budget)
    return response.data.streams;
};