import {
    Typography,
    Button,
    Box,
    Divider,
    Grid,
    Stack,
    Paper,
  } from "@mui/material";
import { useMemo, useState, useContext } from "react";
import StreamCard from "./StreamCard.jsx";
import AddExpenseCard from "./AddExpenseCard.jsx";
import ReviewExpenseCardForm from "../../forms/ReviewExpenseCardForm.jsx";
import PlaidLinkButton from "./PlaidLink.jsx";
import {refreshTransactions} from "../../services/plaidService.jsx"
import { useAuthenticatedApi } from "../../services/hooks.js";
import { useUserPlaid } from "../../context/UserPlaidContext.jsx";


export default function TransactionsReviewPage() {
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { api } = useAuthenticatedApi();
  const { plaidTransactions } = useUserPlaid();

  console.log("Plaid Transactions:", plaidTransactions);

  const handleEditExpense = (id) => {
    // TODO: open edit form and load this item’s data
    console.log("edit expense", id);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
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
          {plaidTransactions.map((tx) => ( // tx is transaction
            <StreamCard
              key={tx.id}
              id={tx.id}
              name={tx.merchant_name}
              amount={tx.amount}
              // description={e.description}
              // type="expense"
              // category:{e.category}
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense}
            />
          ))}
        </Stack>
      </Box>
      <Button onClick={() => refreshTransactions(api)}>Refresh</Button>
      </>
    )}
  </>
  );
}