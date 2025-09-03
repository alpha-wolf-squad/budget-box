import {
  Box,
  TextField,
  MenuItem,
  Stack,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useState } from "react";

export default function IncomeCardForm({ onCancel, onSubmit, sx }) {
  const [category, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState("monthly");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const COMPACT_INPUT_SX = {
    "& .MuiInputBase-input": {
      fontSize: 14,
      paddingTop: 0.75,
      paddingBottom: 0.75,
    },
    "& .MuiInputLabel-root": { fontSize: 13 },
    "& .MuiFormHelperText-root": { fontSize: 11 },
  };

  const NAME_W = 100;
  const AMOUNT_W = 100;
  const RECURRENCE_W = 90;

  const handleSubmit = () => {
    const next = {};
    const amt = Number(amount);
    if (!amount.trim() || Number.isNaN(amt))
      next.amount = "Valid amount is required.";
    else if (amt <= 0) next.amount = "Amount must be greater than 0.";
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      category: category.trim(),
      amount: amt,
      description: description.trim() || undefined,
      type: "income",
      recurrence,
    });
  };

  return (
    <Card
      sx={{
        width: "100%",
        minWidth: 0,
        ...sx,
        borderLeft: 4,
        borderColor: "success.main",
      }}
    >
      <CardContent sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Add a new income stream:
        </Typography>

        {/* Top row: identical placement at all sizes */}

        <Box
          sx={{
            display: "grid",
            alignItems: "center",
            columnGap: 2,
            rowGap: 2,
            minWidth: 0,

            // xs: stack; md: 3 columns with fixed Amount/Recurrence; lg+: same
            gridTemplateColumns: {
              xs: "1fr",
              md: `${NAME_W}px ${AMOUNT_W}px ${RECURRENCE_W}px`,
            },
            gridTemplateAreas: {
              xs: `"category" "amount" "recurrence"`,
              md: `"category amount recurrence"`,
            },
          }}
        >
          {/* Name */}
          <TextField
            label="Category"
            value={category}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.category}
            helperText={errors.category}
            fullWidth
            size="small"
            sx={{ gridArea: "category", minWidth: 0, ...COMPACT_INPUT_SX }}
          />

          {/* Amount */}
          <TextField
            label="Amount *"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
            type="text"
            size="small"
            fullWidth
            sx={{
              gridArea: "amount",
              minWidth: 0,
              width: 1,
              ...COMPACT_INPUT_SX,
            }}
            slotProps={{
              htmlInput: { step: "0.01", min: 0, inputMode: "decimal" },
            }}
          />

          {/* Recurrence */}
          <TextField
            label="Recurrence"
            select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            fullWidth
            size="small"
            sx={{
              gridArea: "recurrence",
              minWidth: 0,
              width: 1,
              ...COMPACT_INPUT_SX,
            }}
          >
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </TextField>
        </Box>

        {/* Description */}
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={3}
          fullWidth
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
