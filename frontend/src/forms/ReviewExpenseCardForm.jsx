import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  InputAdornment, // Added InputAdornment import
} from "@mui/material";
import { useState, useEffect } from "react";

export default function ExpenseCardForm({ onCancel, onSubmit, sx, initialData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(""); // Default category
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({});

  // Populate form fields with initial data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.merchant_name || "");
      setAmount(String(Math.abs(initialData.amount)) || ""); // Convert amount to positive string
      setCategory(initialData.category || "");
      setDate(initialData.date_paid || "");
    }
  }, [initialData]);

  const COMPACT_INPUT_SX = {
    "& .MuiInputBase-input": { fontSize: 14, paddingTop: "6px", paddingBottom: "6px" },
    "& .MuiInputLabel-root": { fontSize: 13 },
    "& .MuiFormHelperText-root": { fontSize: 11 },
  };

  const NAME_W = 100;
  const AMOUNT_W = 100;
  const CATEGORY_W = 90;

  const handleSubmit = () => {
    const next = {};
    const raw = amount.trim().replace(",", ".");
    const amtNum = Number(raw);

    if (!raw || Number.isNaN(amtNum)) next.amount = "Valid amount is required.";
    else if (amtNum <= 0) next.amount = "Amount must be greater than 0.";

    if (!name.trim()) next.name = "Please enter a valid name.";

    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({
      id: (initialData?.id || crypto?.randomUUID?.()) ?? String(Date.now()), // Keep the same ID if editing
      name: name.trim(),
      amount: -Math.abs(amtNum), // Always store as a negative value
      date: date.trim() || undefined,
      type: "expense",
      category: category,
    });
  };

  return (
    <Card
      sx={{
        width: "100%",
        minWidth: 0,
        borderLeft: 4,
        borderColor: "error.main",
        ...sx,
      }}
    >
      <CardContent sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          {initialData ? "Edit expense:" : "Add a new expense:"}
        </Typography>

        <Box
          sx={{
            display: "grid",
            alignItems: "center",
            columnGap: 2,
            rowGap: 2,
            minWidth: 0,
            gridTemplateColumns: {
              xs: "1fr",
              md: `${NAME_W}px ${AMOUNT_W}px ${CATEGORY_W}px`,
            },
            gridTemplateAreas: {
              xs: `"name" "amount" "category"`,
              md: `"name amount category"`,
            },
          }}
        >
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            size="small"
            sx={{ gridArea: "name", minWidth: 0, ...COMPACT_INPUT_SX }}
          />

          <TextField
            label="Amount *"
            value={amount}
            onChange={(e) => {
              let v = e.target.value.replace(/[^\d.,]/g, "");
              const parts = v.split(/[.,]/);
              if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
              setAmount(v);
            }}
            error={!!errors.amount}
            helperText={errors.amount}
            type="text"
            size="small"
            fullWidth
            sx={{ gridArea: "amount", minWidth: 0, width: 1, ...COMPACT_INPUT_SX }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">−</InputAdornment>,
              },
              htmlInput: {
                inputMode: "decimal",
                pattern: "[0-9]*[.,]?[0-9]*",
              },
            }}
          />

          <TextField
            label="Category"
            select
            value={category} // Correctly set the value to the category state
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            size="small"
            type="text"
            sx={{ gridArea: "category", minWidth: 0, width: 1, ...COMPACT_INPUT_SX }}
          >
            <MenuItem value="ENTERTAINMENT">Entertainment</MenuItem>
            <MenuItem value="FOOD_AND_DRINK">Food&Drink</MenuItem>
            <MenuItem value="TRANSPORTATION">Transportation</MenuItem>
            <MenuItem value="HOME_IMPROVEMENT">Home</MenuItem>
            <MenuItem value="MEDICAL">Medical</MenuItem>
            <MenuItem value="PERSONAL_CARE">Personal Care</MenuItem>
            <MenuItem value="RENT_AND_UTILITIES">Utilities</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem> {/* Added 'Other' category */}
          </TextField>
        </Box>

        <TextField
          label="Transaction Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          size="small"
          type="text"
          sx={{ mt: 2, ...COMPACT_INPUT_SX }}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
}