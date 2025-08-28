import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'


const HeroPage = () => {
  return (
    <>
        <div>
        Hello from the HeroPage
        </div>
        <header>
        {/* <SignedOut>
        <SignInButton />
        </SignedOut> */}
        <SignedIn>
        <UserButton />
        </SignedIn>
        </header>
    </>
  )
}

export default HeroPage
