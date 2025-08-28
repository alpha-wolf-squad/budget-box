import './App.css'
import HomePage from './features/HomePage'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import HeroPage from './features/HeroPage'
import NavBar from './features/components/NavBar'

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <HeroPage />;
  }

  return children; // Return the children if the user is signed in
}


function App() {

  const { isSignedIn } = useAuth();

  return (
    <>
    <NavBar />
    <Routes>
      <Route path='/home' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path='/' element={ isSignedIn ? <Navigate to="/home" replace /> : <HeroPage /> }/>
    </Routes>
    </>
  )
}

export default App
