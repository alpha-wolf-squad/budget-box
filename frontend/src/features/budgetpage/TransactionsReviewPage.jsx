import {
    Typography,
    Button,
    Box,
    Divider,
    Grid,
    Stack,
    Paper,
  } from "@mui/material";
  import { useEffect, useMemo, useState } from "react";
  import StreamCard from "./StreamCard.jsx";
  import AddExpenseCard from "./AddExpenseCard.jsx";
  import ReviewExpenseCardForm from "../../forms/ReviewExpenseCardForm.jsx";
  import PlaidLinkButton from "./PlaidLink.jsx";
  import useRefreshTransactions from "../../services/RefreshTransactions.jsx"; // fetch method to refresh transactions


export default function TransactionsReviewPage() {
  const [plaidConnected, setPlaidConnected] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const addIncome = (item) => {
    setIncomes((prev) => [item, ...prev]);
    setShowIncomeForm(false);
  };

  const addExpense = (item) => {
    setExpenses((prev) => [item, ...prev]);
    setShowExpenseForm(false);
  };


  const handleDeleteIncome = (id) => {
    setIncomes((prev) => prev.filter((x) => x.id !== id));
  };

  const handleEditExpense = (id) => {
    // TODO: open edit form and load this item’s data
    console.log("edit expense", id);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  };


  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const incomeTotal = useMemo(
    () => incomes.reduce((s, x) => s + x.amount, 0),
    [incomes]
  );

  const expenseTotal = useMemo(
    () => expenses.reduce((s, x) => s + x.amount, 0),
    [expenses]
  );

  const net = useMemo(
    () => incomeTotal - expenseTotal,
    [incomeTotal, expenseTotal]
  );

  const totalColor =
  net > 0 ? "success.main" : net < 0 ? "error.main" : "text.primary";

  return (
  <>
    {!plaidConnected ? (
      <Box
        sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        mb: 2,
        }}
        >
          <PlaidLinkButton />
      </Box>
    ): <Button>Refresh</Button> }

    {/*  summary header */}
    <Box
      sx={{
      p: 2,
      mb: 2,
      borderRadius: 2,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      textAlign: "center",
      }}
    >
      
    </Box>




    {/* Expenses */}
    <Box sx={{ minWidth: 0 }}>
      <Stack spacing={2}>
        {showExpenseForm ? (
        <ReviewExpenseCardForm
        sx={{ minWidth: 0 }}
        onCancel={() => setShowExpenseForm(false)}
        onSubmit={addExpense}
        />
        ) : (
        <AddExpenseCard onClick={() => setShowExpenseForm(true)} />
        )}
        {expenses.map((e) => (
          <StreamCard
          key={e.id}
          id={e.id}
          name={e.name}
          amount={e.amount}
          description={e.description}
          type="expense"
          onDelete={handleDeleteExpense}
          onEdit={handleEditExpense}
          />
        ))}
      </Stack>
    </Box>
  </>
  );
}