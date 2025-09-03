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
    InputAdornment,
  } from "@mui/material";
  import { useState } from "react";
  
  export default function ReviewExpenseCardForm({ onCancel, onSubmit, sx }) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({});
  
    // Compact input styling
    const COMPACT_INPUT_SX = {
      "& .MuiInputBase-input": { fontSize: 14, paddingTop: "6px", paddingBottom: "6px" },
      "& .MuiInputLabel-root": { fontSize: 13 },
      "& .MuiFormHelperText-root": { fontSize: 11 },
    };
  

    const NAME_W = 100;        
    const AMOUNT_W = 100;      
    const RECURRENCE_W = 90;
  
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
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        name: name.trim(),
        amount: Math.abs(amtNum),     
        description: description.trim() || undefined,
        type: "expense",
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
            Add a new recurring expense:
          </Typography>
  
          {/* Top row */}
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
            {/* Name */}
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
  
            {/* Amount (visual minus, no spinners) */}
            <TextField
              label="Amount *"
              value={amount}
              onChange={(e) => {
                // Keep digits and one decimal separator (dot or comma)
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
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </CardActions>
      </Card>
    );
  }
  