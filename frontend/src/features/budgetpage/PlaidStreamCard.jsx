import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Stack,
  Chip,
  Box,
  Divider,
  Collapse,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

export default function PlaidStreamCard({
  id,
  name,
  amount,
  description,
  category,
  date,
  type = "income",
  onApprove,
  onDelete,
  sx,
}) {
  const isIncome = type === "income";
  const hasDescription = !!description?.trim();
  const [open, setOpen] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false); // Separate state for approve button
  const [deleteLoading, setDeleteLoading] = useState(false); // Separate state for delete button

  const handleApprove = async () => {
    setApproveLoading(true);
    // console.log("APPROVE_LOADING IS SET")
    try {
      await onApprove?.(id); // Call the onApprove function
    } finally {
      setApproveLoading(false); // Reset loading state
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    // console.log("DELETE_LOADING IS SET")
    try {
      await onDelete?.(id); // Call the onDelete function
    } finally {
      setDeleteLoading(false); // Reset loading state
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        width: "100%",
        borderLeft: 4,
        borderColor: isIncome ? "success.main" : "error.main",
        ...sx,
      }}
    >
      {/* Toggle details by clicking content (buttons won't toggle) */}
      <CardContent
        onClick={() => hasDescription && setOpen((v) => !v)}
        sx={{ cursor: hasDescription ? "pointer" : "default", pb: 1.5 }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {name || (isIncome ? "Untitled Income" : "Untitled Expense")}
              </Typography>
              {hasDescription && (
                <ExpandMoreIcon
                  sx={{
                    fontSize: 18,
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    opacity: 0.6,
                  }}
                />
              )}
            </Stack>

            {category && (
              <Chip
                size="small"
                label={category}
                sx={{ alignSelf: "start" }}
                variant="outlined"
              />
            )}
          </Stack>

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: isIncome ? "success.main" : "error.main" }}
          >
            {isIncome ? "+" : "-"}$
            {Math.abs(amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>

          <Typography fontWeight={500}>{date}</Typography>
        </Stack>

        {/* Collapsible description */}
        <Collapse in={open && hasDescription} timeout="auto" unmountOnExit>
          <Box
            sx={{
              mt: 2,
              mx: { xs: 0, sm: "auto" },
              width: { xs: "100%", sm: "90%" },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {description}
            </Typography>
          </Box>
        </Collapse>

        <Divider sx={{ mt: 2 }} />
      </CardContent>

      {/* Buttons */}
      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        <IconButton
          disabled={approveLoading || deleteLoading} // Disable if either button is loading
          aria-label="approve"
          onClick={handleApprove}
        >
          <CheckIcon />
        </IconButton>
        <IconButton
          disabled={approveLoading || deleteLoading} // Disable if either button is loading
          aria-label="delete"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}