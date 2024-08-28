import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFeedback } from "../context/FeedbackContext"; // Update with the correct path

const ViewFeedback = () => {
  const location = useLocation();
  const { interviewID, questions, answers, jobRole, experienceLevel, jobDescription } =
    location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { feedback, setFeedback } = useFeedback(); // Use feedback context

  useEffect(() => {
    const generateFeedback = async () => {
        setLoading(true);
        try {
          const response = await fetch("http://192.168.31.127:3003/api/generate-feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questions: Array.isArray(questions) ? questions : [],
              answers: Array.isArray(answers) ? answers : [],
              jobRole: jobRole || "",
              experienceLevel: experienceLevel || "",
              jobDescription: jobDescription || "",
              interviewID: interviewID || "",
            }),
          });
      
          const data = await response.json();
          if (response.ok) {
            const feedbackData = JSON.parse(data.feedback).feedback; // Parse the feedback data correctly
            setFeedback(feedbackData); // Store feedback in context
            console.log(feedbackData);
          } else {
            setError(`Error: ${data.error || "Unknown error"}`);
          }
        } catch (error) {
          setError(`Error: ${error.message || "Unknown error"}`);
        } finally {
          setLoading(false);
        }
      };
      

    if (questions && answers && jobRole && experienceLevel && jobDescription && interviewID) {
      generateFeedback();
    } else {
      setError("Incomplete data provided.");
    }
  }, [
    questions,
    answers,
    jobRole,
    experienceLevel,
    jobDescription,
    setFeedback,
    interviewID,
  ]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>View Feedback</h1>
      {feedback ? (
        <div>
          <h2>Interview Details</h2>
          <p>
            <strong>Interview ID:</strong> {interviewID}
          </p>
          <p>
            <strong>Job Role:</strong> {jobRole}
          </p>
          <p>
            <strong>Experience Level:</strong> {experienceLevel}
          </p>
          <p>
            <strong>Job Description:</strong> {jobDescription}
          </p>
          <h3>Feedback</h3>
          {feedback.map((item, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <p>
                <strong>{item.questionno}:</strong> {item.question}
              </p>
              <p>
                <strong>Your answer:</strong>{" "}
                {answers[index] || "No answer provided"}
              </p>
              <p>
                <strong>rating:</strong> {item.rating}
              </p>
              <p>
                <strong>Pros:</strong> {item.pros || "No pros available"}
              </p>
              <p>
                <strong>Cons:</strong> {item.cons || "No cons available"}
              </p>
              <p>
                <strong>Suggestion:</strong> {item.suggestion || "No suggestion available"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No feedback available.</p>
      )}
    </div>
  );
};

export default ViewFeedback;
