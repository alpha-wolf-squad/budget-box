import { Box, Button, Container, Typography } from "@mui/material";

import SignedOutPage from "./SignedOutPage";
import SignedInPage from "./SignedInPage";



export default function HomePage() {
  return (
    <>
      {/* everything inside of container */}
      <Container
        maxWidth="md"
        sx={{
          mt: 5,
          position: "relative",
          height: "auto",
          border: "1px solid #ccc",
          padding: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <SignedInPage />
        <SignedOutPage />
      </Container>
    </>
  );
}
