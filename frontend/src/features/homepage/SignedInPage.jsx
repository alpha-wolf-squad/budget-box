import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Box, Button, Typography } from "@mui/material";
import BudgetPage from "../budgetpage/BudgetPage";
import BudgetTabs from "../budgetpage/BudgetTabs";

export default function SignedInPage() {
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
