import React from "react";
import { useQuestions } from "../context/QuestionsContext";

const Interview = () => {
  const { questions } = useQuestions();

  // Check if questions is a string and parse it if necessary
  const parsedQuestions = questions ? JSON.parse(questions) : [];

  return (
    <div>
      <h2>Generated Interview Questions</h2>
      <ul>
        {Array.isArray(parsedQuestions) && parsedQuestions.length > 0 ? (
          parsedQuestions.map((item, index) => (
            <li key={index}>
              <h2>{item.question}</h2>
              <ul>
                {Object.entries(item.options).map(([key, option]) => (
                  <li key={key}>
                    <label>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={key}
                      />
                      {option}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <li>No questions generated yet.</li>
        )}
      </ul>
    </div>
  );
};

export default Interview;
