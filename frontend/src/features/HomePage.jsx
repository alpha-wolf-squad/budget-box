import { Container, Button, Typography, Box } from "@mui/material";
import BudgetForm from "./budgetform/BudgetForm";

export default function HomePage() {
  return (
    <Container
      maxWidth="md"
      sx={{
        position: "relative",
        height: 300, // demo height
        border: "1px solid #ccc",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Top-right login button */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        <Button variant="contained" color="primary">
          Login/Register
        </Button>
      </Box>

      {/* Welcome message */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        Welcome to BudgetBox
      </Typography>

      {/* TODO: Budget Form */}
      <BudgetForm/>
    </Container>
  );
}
