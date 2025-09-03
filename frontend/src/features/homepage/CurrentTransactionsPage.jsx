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
  import StreamCard from "../budgetpage/StreamCard.jsx";
  import AddIncomeCard from "../budgetpage/AddIncomeCard.jsx";
  import AddExpenseCard from "../budgetpage/AddExpenseCard.jsx";
  import ExpenseCardForm from "../../forms/ExpenseCardForm.jsx";


export default function CurrentTransactionsPage() {
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
            
        </>
      );
}