import { SignedIn, SignInButton, useAuth, UserButton } from '@clerk/clerk-react'
import { SignedOut } from '@clerk/clerk-react';
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <HeroPage />;
  }

  return children; 
}


export default function HomePage() {
    const { isSignedIn } = useAuth();
  
    return (
        <>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Sign in</button>
        </SignInButton>
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
      </SignedOut>

      <SignedIn>
        <UserButton />
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
      </SignedIn>
        </>

    )
}
