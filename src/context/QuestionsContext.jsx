import React, { createContext, useState, useContext } from "react";

const QuestionsContext = createContext();

export const useQuestions = () => useContext(QuestionsContext);

export const QuestionsProvider = ({ children }) => {
  const [questions, setQuestions] = useState(null);

  return (
    <QuestionsContext.Provider value={{ questions, setQuestions }}>
      {children}
    </QuestionsContext.Provider>
  );
};
