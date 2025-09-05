// SignedInPage.jsx
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Box, Typography } from "@mui/material";
import BudgetTabs from "../budgetpage/BudgetTabs";
import { useNavigate } from "react-router-dom";

export default function SignedInPage() {
  const navigate = useNavigate();

  return (
    <SignedIn>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 1,
        }}
      >
        <UserButton>
          {/* Add custom items to the dropdown */}
          <UserButton.MenuItems>
            {/* <UserButton.MenuItem
              label="Connect bank account"
              onClick={() => ready && open()}
            />
            <UserButton.MenuItem
              label="Account settings"
              onClick={() => navigate("/account")}
            /> */}
          </UserButton.MenuItems>
        </UserButton>
      </Box>

      <BudgetTabs />
    </SignedIn>
  );
}
