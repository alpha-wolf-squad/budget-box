import { Box, Button, Container, Typography } from "@mui/material";

import SignedOutPage from "./SignedOutPage";
import SignedInPage from "./SignedInPage";



export default function HomePage() {
    const BG_COLOR = "#285744ff";
  return (
    <>
        <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: BG_COLOR,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 5, // space above/below the container so mint is visible
      }}
    >

      {/* everything inside of container */}
      <Container
        maxWidth="md"
        sx={{
          borderRadius: "2%",
          mt: 5,
          position: "relative",
          height: "auto",
          bgcolor: "white",
          border: "1px solid #ccc",
          padding: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        >
                <Box
          component="img"
          src="/images/budgetbox-side.webp"
          alt="BudgetBox Logo"
          sx={{
            position: "relative",             
            width: 250,             
            height: "auto",
            cursor: "pointer",
          }}
          />
        <SignedInPage />
        <SignedOutPage />
      </Container>
          </Box>
    </>
  );
}
