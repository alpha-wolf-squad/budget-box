// ExpenseCardForm.jsx
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export default function ExpenseCardForm({ onCancel, onSubmit, sx, initialData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other"); // Default category
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { getToken } = useAuth();

  // Populate form fields with initial data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAmount(String(Math.abs(initialData.amount)) || ""); // Convert amount to positive string
      setCategory(initialData.category || "monthly");
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
  const CATEGORY_W = 90;

  const handleSubmit = async () => {
    const next = {};
    const raw = amount.trim().replace(",", ".");
    const amtNum = Number(raw);

    if (!raw || Number.isNaN(amtNum)) next.amount = "Valid amount is required.";
    else if (amtNum <= 0) next.amount = "Amount must be greater than 0.";
    if (!name.trim()) next.name = "Please enter a valid name.";

    setErrors(next);
    if (Object.keys(next).length) return;

    // Prepare the local object (keeps existing logic/names)
    const localId = (initialData?.id || crypto?.randomUUID?.()) ?? String(Date.now());
    const localObj = {
      id: localId,
      name: name.trim(),
      amount: -Math.abs(amtNum), // Always store as a negative value
      description: description.trim() || undefined,
      type: "expense",
      recurrence,
    };

    // Attempt to persist to backend (minimal addition)
    setSubmitting(true);
    try {
      const token =
        (typeof getToken === "function" ? await getToken() : null) ||
        (window?.Clerk?.session?.getToken ? await window.Clerk.session.getToken() : null);

      // Map UI fields to API payload
      const payload = {
        merchant_name: name.trim(),
        description: description.trim() || "",
        amount: -Math.abs(amtNum), // API expects expense to be negative; backend enforces anyway
        recurrence: !!recurrence,   // backend treats truthy as recurring
        // date omitted: backend will default to current month
      };

      const resp = await axios.post(
        "http://localhost:8000/api/entries/add-expense-stream/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      // If the server returns an id, prefer it so edits map correctly
      const serverId = resp?.data?.id;
      const finalObj = serverId ? { ...localObj, id: serverId } : localObj;

      onSubmit(finalObj);
    } catch (err) {
      // Surface a simple server error while preserving existing validation UI
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to save expense to the server.";
      setErrors((prev) => ({ ...prev, server: detail }));

      // Still call onSubmit with local object so UI remains responsive if desired.
      // If you prefer to block on failure, comment the next line.
      onSubmit(localObj);
    } finally {
      setSubmitting(false);
    }
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

        {errors.server ? (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {errors.server}
          </Typography>
        ) : null}

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
            value={""}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            size="small"
            sx={{ gridArea: "category", minWidth: 0, width: 1, ...COMPACT_INPUT_SX }}
          >
            <MenuItem value="entertainment">Entertainment</MenuItem>
            <MenuItem value="food_and_drink">Food&Drink</MenuItem>
            <MenuItem value="transportation">Transportation</MenuItem>
            <MenuItem value="home_improvement">Home</MenuItem>
            <MenuItem value="medical">Medical</MenuItem>
            <MenuItem value="personal_care">Personal Care</MenuItem>
            <MenuItem value="rent_and_utilities">Utilities</MenuItem>
            <MenuItem value="other">Other</MenuItem> {/* Added 'Other' category */}
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
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
}
