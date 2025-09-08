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
import ReviewExpenseCardForm from "../../forms/ReviewExpenseCardForm.jsx";
import PlaidLinkButton from "./PlaidLink.jsx";
import {refreshTransactions} from "../../services/plaidService.jsx"
import { useAuthenticatedApi } from "../../services/hooks.js";
import { useUserPlaid } from "../../context/UserPlaidContext.jsx";


export default function TransactionsReviewPage() {
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null); // Toggle editing expense state
  const [showEditExpenseForm, setShowEditExpenseForm] = useState(false); // For editing
  const { api } = useAuthenticatedApi();
  const { plaidTransactions, setPlaidTransactions } = useUserPlaid();

  console.log("Plaid Transactions:", plaidTransactions);

  const handleEditExpense = (id) => {
    const expenseToEdit = plaidTransactions.find((expense) => expense.id === id);
    console.log(expenseToEdit)
    setEditingExpense(expenseToEdit);
    setShowEditExpenseForm(true);
  };

  const handleDeleteExpense = (id) => { // Needs to call 'delete' method for plaid/transactions DT
    setPlaidTransactions((prev) => prev.filter((x) => x.id !== id));
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
          {plaidTransactions.map((tx) => editingExpense?.id === tx.id && showEditExpenseForm ? ( // tx is transaction
            <ReviewExpenseCardForm
            key={tx.id}
            sx={{ minWidth: 0 }}
            onCancel={() => {
              setShowExpenseForm(false);
              setEditingExpense(null);
            }}
            onSubmit={(updatedExpense) => {
              setPlaidTransactions((prev) =>
                prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
              );
              setShowExpenseForm(false);
              setEditingExpense(null);
            }}
            initialData={editingExpense}
            />
            ) : (
            <StreamCard
              key={tx.id}
              id={tx.id}
              name={tx.merchant_name}
              amount={tx.amount}
              category={tx.category} // Displaying the category
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense} // Should delete from the useState and from plaid/transactions DT
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