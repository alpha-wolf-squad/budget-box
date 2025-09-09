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
import {refreshTransactions} from "../../services/plaidService.jsx"
import { useAuthenticatedApi } from "../../services/hooks.js";
import { useUserPlaid } from "../../context/UserPlaidContext.jsx";
// IMPORT DELETE CALL
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
    // Add to entries DT
    // Remove from plaid DT
  };

  const handleDeleteExpense = (id) => { // Needs to call 'delete' method for plaid/transactions DT
    setPlaidTransactions((prev) => prev.filter((x) => x.id !== id));
    // Remove from plaid DT
  };

  return (
  <>
    {plaidConnected ? ( // Make is !plaidConnected after completing the dev
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
      <Button onClick={() => refreshTransactions(api)}>Refresh</Button>
      </>
    )}
  </>
  );
}