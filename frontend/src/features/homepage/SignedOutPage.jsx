import { SignedOut, SignInButton } from "@clerk/clerk-react";
import { Box, Button, Typography } from "@mui/material";


export default function SignedOutPage() {

    return (
        <>
        {/* page that appears when user is signed out */}
        <SignedOut>
          <SignInButton mode="modal">
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
          </SignInButton>

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
        </SignedOut>
        </>


    )

}