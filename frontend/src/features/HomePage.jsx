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
        <h1>Welcome to budgetbox</h1>
      </SignedOut>

      <SignedIn>
        <UserButton />
        {/* budget form here */}
      </SignedIn>
        </>

    )
}
