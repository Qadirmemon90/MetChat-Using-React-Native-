import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="auth-page">
  <div className="auth-container">
    <h1>Met Chat 2026</h1>
    <p className="subtitle">Welcome to your application</p>

    <div className="auth-card">
      <SignedOut >
        <SignInButton className="signin-btn" mode="modal"/>

        <p className="auth-message">
          Please sign in to access the app.
        </p>
      </SignedOut>

      <SignedIn>
        <div className="user-section">
          <div className="avatar-wrapper">
            <UserButton />
          </div>

          <p className="welcome">Welcome back!</p>
          <p className="auth-message">
            You are successfully signed in.
          </p>

          <SignOutButton>
            <button className="signout-btn">Sign out</button>
          </SignOutButton>
        </div>
      </SignedIn>
    </div>
  </div>
</div>
    </>
  )
}

export default App
