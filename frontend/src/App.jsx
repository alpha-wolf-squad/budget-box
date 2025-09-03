import "./App.css";
import HomePage from "./features/homepage/HomePage";
import { Route, Routes, Navigate } from "react-router-dom";
import { UserPlaidProvider } from "./context/UserPlaidContext.jsx";

function App() {
  return (
    <>
      <UserPlaidProvider>
        <HomePage />
      </UserPlaidProvider>
    </>
  );
}

export default App;
