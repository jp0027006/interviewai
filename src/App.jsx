// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./Components/Dashboard";
import { Profile } from "./Components/Profile";
import { BackgroundGradientAnimationForgot } from "./Components/BackgroundGradientAnimationForgot";
import { BackgroundGradientAnimationSignin } from "./Components/BackgroundGradientAnimationSignin";
import { BackgroundGradientAnimationSignup } from "./Components/BackgroundGradientAnimationSignup";
import ScrollToTop from "./Components/ui/ScrollToTop";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserProvider } from "./context/UserContext";
import { QuestionsProvider } from "./context/QuestionsContext";
import Interview from "./Components/Interview";
import ViewInterview from "./Components/ViewInterview";

function App() {
  return (
    <UserProvider>
      <QuestionsProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<BackgroundGradientAnimationSignin />} />
            <Route
              path="/signup"
              element={<BackgroundGradientAnimationSignup />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/forgotpassword"
              element={<BackgroundGradientAnimationForgot />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/viewinterview" element={<ViewInterview />} />
          </Routes>
        </Router>
      </QuestionsProvider>
    </UserProvider>
  );
}

export default App;
