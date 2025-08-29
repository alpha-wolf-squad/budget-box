import {
  Typography,
  Button,
  Box,
  Divider,
  Grid,
  Stack,
  Paper,
} from "@mui/material";
import { useMemo, useState } from "react";
import StreamCard from "./StreamCard.jsx";
import AddIncomeCard from "./AddIncomeCard.jsx";
import IncomeCardForm from "../../forms/IncomeCardForm.jsx";
import AddExpenseCard from "./AddExpenseCard.jsx";
import ExpenseCardForm from "../../forms/ExpenseCardForm.jsx";

export default function BudgetPage() {
  const [incomes, setIncomes] = useState([
    {
      id: "inc-1",
      name: "Salary",
      amount: 4200,
      recurrence: "monthly",
      type: "income",
    },
  ]);

  const [expenses, setExpenses] = useState([
    {
      id: "exp-1",
      name: "Rent",
      amount: 1500,
      recurrence: "monthly",
      type: "expense",
    },
  ]);
  
  const addIncome = (item) => {
    setIncomes((prev) => [item, ...prev]);
    setShowIncomeForm(false);
  };

  const addExpense = (item) => {
    setExpenses((prev) => [item, ...prev]);
    setShowExpenseForm(false);
  };


  const handleEditIncome = (id) => {
  // TODO: open edit form and load this item’s data
  console.log("edit income", id);
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
      {/*  summary header */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1}>
          <Stack justifyContent="space-between">
            <Typography sx={{ color: "green", fontWeight: 700 }}>
              Income: $
              {incomeTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Typography>
            <Typography sx={{ color: "red", fontWeight: 700 }}>
              Expenses: $
              {expenseTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Stack>
          <Divider />
          <Typography sx={{fontWeight: 600, color: totalColor}}>
            Total: $
            {net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "grid" },
          gridTemplateColumns: { md: "1fr 1px 1fr" }, 
          columnGap: { md: 6 },
          alignItems: "start",
        }}
      >
        {/* LEFT: Income */}
        <Box sx={{ minWidth: 0 }}>
          <Stack spacing={2}>
            {showIncomeForm ? (
              <IncomeCardForm
                sx={{ minWidth: 0 }}
                onCancel={() => setShowIncomeForm(false)}
                onSubmit={addIncome}
              />
            ) : (
              <AddIncomeCard onClick={() => setShowIncomeForm(true)} />
            )}

            {incomes.map((i) => (
              <StreamCard
                key={i.id}
                id={i.id}
                name={i.name}
                amount={i.amount}
                recurrence={i.recurrence}
                description={i.description}
                type="income"
                onDelete={handleDeleteIncome}
                onEdit={handleEditIncome}
              />
            ))}
          </Stack>
        </Box>

        {/* Center divider */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: "none", md: "block" },
            justifySelf: "center",
            height: "100%",
          }}
        />

        {/* RIGHT: Expenses */}
        <Box sx={{ minWidth: 0 }}>
          <Stack spacing={2}>

                        {showExpenseForm ? (
              <ExpenseCardForm
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
                recurrence={e.recurrence}
                description={e.description}
                type="expense"
                onDelete={handleDeleteExpense}
                onEdit={handleEditExpense}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </>
  );
}
