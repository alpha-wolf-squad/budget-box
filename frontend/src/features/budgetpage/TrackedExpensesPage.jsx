//TrackedExpensesPage.jsx
import {
    Typography,
    Button,
    Box,
    Divider,
    Grid,
    Stack,
    Paper,
  } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import StreamCard from "./StreamCard.jsx";
import AddExpenseCard from "./AddExpenseCard.jsx";
import ExpenseCardForm from "../../forms/ExpenseCardForm.jsx";
import useBudget from "../../services/BudgetCall.jsx";


export default function TrackedExpensesPage() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false); // For new entries
  const [editingExpense, setEditingExpense] = useState(null); // Toggle editing expense state
  const [showEditExpenseForm, setShowEditExpenseForm] = useState(false); // For editing
    
  const handleEditExpense = (id) => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    setEditingExpense(expenseToEdit);
    setShowEditExpenseForm(true);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  };

  const incomeTotal = useMemo(
    () => incomes.reduce((s, x) => s + parseFloat(x.amount), 0),
    [incomes]
  );
  const expenseTotal = useMemo(
    () => expenses.reduce((s, x) => s + parseFloat(x.amount), 0),
    [expenses]
  );
  const net = useMemo(
    () => incomeTotal + expenseTotal,
    [incomeTotal, expenseTotal]
  );

  const totalColor =
    net > 0 ? "success.main" : net < 0 ? "error.main" : "text.primary";

  // fetches Budget from the backend
  const { getBudget } = useBudget();
  useEffect(() => {
    const normalizeData = (data) => {
      let extractedData = data.streams

      if (!extractedData){
        extractedData = [];
      }
       console.log("Extracted Data: ",extractedData)
      return extractedData
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await getBudget("2025-09");
        // console.log(typeof data.streams.amount)
        if (!cancelled) {
          let normData = normalizeData(data);
          // console.log("Normalized Data:", normData); // Debugging log for normalized data
          for (const object of normData) {
            // console.log("Processing object:", object); // Debugging log for each object
            if (object.category === 'income') {
              // console.log("Updating incomes with amount:", object.amount); // Debugging log for income
              setIncomes(prev => [...prev, { ...object }]); // Update incomes useState
              // console.log("New incomes: ", incomes)
            } else {
              // console.log("Updating expenses with amount:", object.amount); // Debugging log for expense
              setExpenses(prev => [...prev, { ...object }]); // Update expenses useState
            }
          }
        };
            } catch (e) {
        console.error("Error fetching budget:", e); // Log error if fetching fails
      }
    })();
    return () => { cancelled = true; };
  }, []);
  
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
          textAlign: "center",
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
  
      
  
  
      {/* RIGHT: Expenses */}
      <Box sx={{ minWidth: 0 }}>
        <Stack spacing={2}>
          {/* Add Expense Button */}
          {!showExpenseForm && (
            <AddExpenseCard onClick={() => setShowExpenseForm(true)} />
          )}

          {/* Add Expense Form */}
          {showExpenseForm && (
            <ExpenseCardForm
              sx={{ minWidth: 0 }}
              onCancel={() => {
                setShowExpenseForm(false);
              }}
              onSubmit={(newExpense) => {
                setExpenses((prev) => [...prev, { ...newExpense, id: Date.now() }]);
                setShowExpenseForm(false);
              }}
            />
          )}

          {/* Render Existing Expenses */}
          {expenses.map((expense) =>
            editingExpense?.id === expense.id && showEditExpenseForm ? (
              <ExpenseCardForm
                key={expense.id}
                sx={{ minWidth: 0 }}
                onCancel={() => {
                  setShowExpenseForm(false);
                  setEditingExpense(null);
                }}
                onSubmit={(updatedExpense) => {
                  setExpenses((prev) =>
                    prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
                  );
                  setShowExpenseForm(false);
                  setEditingExpense(null);
                }}
                initialData={editingExpense}
              />
            ) : (
              <StreamCard
                key={expense.id}
                id={expense.id}
                name={expense.name}
                amount={expense.amount}
                recurrence={expense.recurrence}
                description={expense.description}
                type="expense"
                onDelete={handleDeleteExpense}
                onEdit={handleEditExpense}
              />
            )
          )}
        </Stack>
      </Box>
      
    </>
  );
}