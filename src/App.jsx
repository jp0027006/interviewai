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
import { FeedbackProvider } from "./context/FeedbackContext";
import Interview from "./Components/Interview";
import ViewInterview from "./Components/ViewInterview";
import ViewFeedback from "./Components/ViewFeedback";
import History from "./Components/History";

function App() {
  return (
    <UserProvider>
      <QuestionsProvider>
        <FeedbackProvider>
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
              <Route path="/viewinterview/:interviewID" element={<ViewInterview />} />
              <Route path="/viewfeedback" element={<ViewFeedback />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Router>
        </FeedbackProvider>
      </QuestionsProvider>
    </UserProvider>
  );
}

export default App;
