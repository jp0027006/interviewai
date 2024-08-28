import React, { createContext, useState, useContext } from "react";

const FeedbackContext = createContext();

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState(null);
  const clearFeedback = () => {
    setFeedback(null);
  };

  return (
    <FeedbackContext.Provider value={{ feedback, setFeedback, clearFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};
