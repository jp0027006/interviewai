// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./Components/Dashboard";
import { Profile } from "./Components/Profile";
import { BackgroundGradientAnimationForgot } from "./Components/BackgroundGradientAnimationForgot";
import { BackgroundGradientAnimationSignin } from "./Components/BackgroundGradientAnimationSignin";
import { BackgroundGradientAnimationSignup } from "./Components/BackgroundGradientAnimationSignup";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BackgroundGradientAnimationSignin />} />
          <Route path="/signup" element={<BackgroundGradientAnimationSignup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgotpassword" element={<BackgroundGradientAnimationForgot />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
