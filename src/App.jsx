import React from "react";
import { BackgroundBeamsDemoSignup } from "./Components/BackgroundBeamsSignup";
import { BackgroundBeamsDemoSignin } from "./Components/BackgroundBeamsSignin";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./Components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BackgroundBeamsDemoSignin />} />
        <Route path="/signup" element={<BackgroundBeamsDemoSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
