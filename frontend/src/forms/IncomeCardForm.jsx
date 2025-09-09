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
  InputAdornment, // Added InputAdornment import
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export default function ExpenseCardForm({ onCancel, onSubmit, sx, initialData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState("monthly");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const { getToken } = useAuth();

  // Populate form fields with initial data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAmount(String(Math.abs(initialData.amount)) || ""); // Convert amount to positive string
      setRecurrence(initialData.recurrence || "monthly");
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  const COMPACT_INPUT_SX = {
    "& .MuiInputBase-input": { fontSize: 14, paddingTop: "6px", paddingBottom: "6px" },
    "& .MuiInputLabel-root": { fontSize: 13 },
    "& .MuiFormHelperText-root": { fontSize: 11 },
  };

  const NAME_W = 100;
  const AMOUNT_W = 100;
  const RECURRENCE_W = 90;

  const handleSubmit = async () => {
    const next = {};
    const raw = amount.trim().replace(",", ".");
    const amtNum = Number(raw);

    if (!raw || Number.isNaN(amtNum)) next.amount = "Valid amount is required.";
    else if (amtNum <= 0) next.amount = "Amount must be greater than 0.";

    if (!name.trim()) next.name = "Please enter a valid name.";

    setErrors(next);
    if (Object.keys(next).length) return;

    const localObj = {
      id: (initialData?.id || crypto?.randomUUID?.()) ?? String(Date.now()), // Keep the same ID if editing
      name: name.trim(),
      amount: Math.abs(amtNum),
      description: description.trim() || undefined,
      type: "income",
      recurrence,
    };

    let serverId = null;
    try {
      const token =
        (typeof getToken === "function" ? await getToken() : null) ||
        (window?.Clerk?.session?.getToken ? await window.Clerk.session.getToken() : null);

      const payload = {
        merchant_name: name.trim(),
        description: description.trim() || "",
        amount: Math.abs(amtNum), // backend forces positive for income anyway
        recurrence,               // backend casts truthy to True
        // date omitted: server defaults to current month
      };

      const resp = await axios.post(
        "http://localhost:8000/api/entries/add-income-stream/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      serverId = resp?.data?.id ?? null;
    } catch (err) {
      console.error("Failed to save income to the server:", err);
    } finally {
      const finalObj = serverId ? { ...localObj, id: serverId } : localObj;
      onSubmit(finalObj);
    }
  };

  return (
    <Card
      sx={{
        width: "100%",
        minWidth: 0,
        borderLeft: 4,
        borderColor: "success.main",
        ...sx,
      }}
    >
      <CardContent sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          {initialData ? "Edit recurring expense:" : "Add a new recurring expense:"}
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
              md: `${NAME_W}px ${AMOUNT_W}px ${RECURRENCE_W}px`,
            },
            gridTemplateAreas: {
              xs: `"name" "amount" "recurrence"`,
              md: `"name amount recurrence"`,
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
            label="Recurrence"
            select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            fullWidth
            size="small"
            sx={{ gridArea: "recurrence", minWidth: 0, width: 1, ...COMPACT_INPUT_SX }}
          >
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Annual</MenuItem>
          </TextField>
        </Box>

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
