import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Box, Button, Typography } from "@mui/material";
import BudgetPage from "../budgetpage/BudgetPage";
import BudgetTabs from "../budgetpage/BudgetTabs";
import PlaidLinkButton from "../budgetpage/PlaidLink";
import { useState } from "react";

export default function SignedInPage() {
  const handleConnectionSuccess = (publicToken) => {
    console.log("Received public token:", publicToken);
  };

  return (
    <>
      {/* page that populates when user is signed in */}
      <SignedIn>
        <UserButton />
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <Button variant="contained" color="primary">
            Account Settings
          </Button>
          <div>
            <PlaidLinkButton onConnectionSuccess={handleConnectionSuccess} />{" "}
          </div>
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

        {/*  Budget Tabs: Allows user to change between 'Planned Budget', 'Tracked Expenses', and 'Transaction Review' */}
        <BudgetTabs />
      </SignedIn>
    </>
  );
}
