import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/config/firebase";

const ViewInterview = () => {
  const location = useLocation();
  const { interviewID } = location.state || {};
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!interviewID) {
        setError("No interview ID provided.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "submissions", interviewID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterviewData(docSnap.data());
        } else {
          setError("No such document!");
        }
      } catch (error) {
        setError("Error fetching interview data");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [interviewID]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>View Your Interview</h1>
      {interviewData ? (
        <div>
          <h2>Interview Details</h2>
          <p><strong>Job Role:</strong> {interviewData.jobRole}</p>
          <p><strong>Experience Level:</strong> {interviewData.experienceLevel}</p>
          <p><strong>Job Description:</strong> {interviewData.jobDescription}</p>
          <p><strong>Timestamp:</strong> {new Date(interviewData.timestamp.toDate()).toLocaleString()}</p>
          <h3>Questions and Answers</h3>
          {interviewData.questions.map((question, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <p><strong>{question.questionno}:</strong> {question.question}</p>
              <p><strong>Your answer:</strong> {interviewData.answers[index] || "No answer provided"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No interview data available.</p>
      )}
    </div>
  );
};

export default ViewInterview;
