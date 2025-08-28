import {
  SignedIn,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/clerk-react";
import { SignedOut } from "@clerk/clerk-react";
import { Box, Button, Container, Typography } from "@mui/material";
import BudgetForm from "../budgetform/BudgetForm";
import SignedOutPage from "./SignedOutPage";
import SignedInPage from "./SignedInPage";



export default function HomePage() {
  return (
    <>
      {/* everything inside of container */}
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
        <SignedInPage />
        <SignedOutPage />
      </Container>
    </>
  );
}
