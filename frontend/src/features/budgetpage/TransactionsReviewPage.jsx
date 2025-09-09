import {
    Typography,
    Button,
    Box,
    Divider,
    Grid,
    Stack,
    Paper,
  } from "@mui/material";
import { useState } from "react";
import PlaidStreamCard from "./PlaidStreamCard.jsx";
import PlaidLinkButton from "./PlaidLink.jsx";
import { useAuthenticatedApi } from "../../services/hooks.js";
import { useUserPlaid } from "../../context/UserPlaidContext.jsx";
import { deleteTransactions, listTransactions, addTransactions } from "../../services/plaidService.jsx";
// IMPORT POST CALL

export default function TransactionsReviewPage() {
  const [plaidConnected, setPlaidConnected] = useState(false);
  const { api } = useAuthenticatedApi();
  const { plaidTransactions, setPlaidTransactions } = useUserPlaid();

  console.log("Plaid Transactions:", plaidTransactions);

  const handleApproveExpense = (id) => {
    const expenseToApprove = plaidTransactions.find((expense) => expense.id === id);
    console.log("Expense to be approved: ",expenseToApprove)
    // FINISH WITH CRUD;
    addTransactions(api, id)
    handleDeleteExpense(id)
  };

  const handleDeleteExpense = (id) => { // Needs to call 'delete' method for plaid/transactions DT
    deleteTransactions(api, id)
    setPlaidTransactions((prev) => prev.filter((x) => x.id !== id));
  };

  const handleRefreshExpense = async () => {
    let res = await listTransactions(api);
    setPlaidTransactions((prev) => [...prev, ...res]);
  }
  
  return (
  <>
    {!plaidConnected ? ( // Make is !plaidConnected after completing the dev
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            mb: 2,
          }}
        >
          <PlaidLinkButton onPlaidConnected={setPlaidConnected} />
        </Box>
      </>
    ) : (
      <>
      <Button onClick={handleRefreshExpense}>Refresh</Button>
      {/* Expenses */}
      <Box sx={{ minWidth: 0 }}>
        <Stack spacing={2}>
          {plaidTransactions.map((tx) => 
            <PlaidStreamCard
              key={tx.id}
              id={tx.id}
              name={tx.merchant_name}
              amount={-tx.amount}
              category={tx.category} // Displaying the category
              date={tx.date_paid}
              type="expense"
              onApprove={handleApproveExpense}
              onDelete={handleDeleteExpense}
            />
          )}
        </Stack>
      </Box>
      </>
    )}
  </>
  );
}