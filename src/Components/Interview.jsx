import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  doc,
  query,
  where,
  getDocs,
  setDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../../src/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../src/config/firebase";
import Cookies from "js-cookie";
import Sidebar from "./ui/sidebar";
import Modal from "react-bootstrap/Modal";
import { UserContext } from "../context/UserContext";
import { useQuestions } from "../context/QuestionsContext";
import { ToastContainer, toast } from "react-toastify";
import { Textarea } from "../Components/ui/textarea";
import { cn } from "../../lib/utils";
import "react-toastify/dist/ReactToastify.css";

// Utility functions for toast messages
const showwarningToastMessage = (message) => toast.warn(message);
const showsuccessToastMessage = (message) => toast.success(message);
const showerrorToastMessage = (message) => toast.error(message);

export function Interview() {
  const [showModal1, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  const { jobRole, experienceLevel, jobDescription } = location.state || {};
  const { questions, clearQuestions } = useQuestions();
  const navigate = useNavigate();
  const { userData, login, logout } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Manage answers state here
  const parsedQuestions = questions ? JSON.parse(questions) : [];
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 750);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlequit = () => {
    navigate("/dashboard");
    clearQuestions();
  };

  const handleNextClick = () => {
    if (currentQuestionIndex < parsedQuestions.length - 1) {
      // Save the current answer before moving to the next question
      setAnswers((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentQuestionIndex] = document.getElementById(
          `answer-${currentQuestionIndex}`
        ).value;
        return updatedAnswers;
      });
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleBackClick = () => {
    if (currentQuestionIndex > 0) {
      // Save the current answer before moving to the previous question
      setAnswers((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentQuestionIndex] = document.getElementById(
          `answer-${currentQuestionIndex}`
        ).value;
        return updatedAnswers;
      });
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const generateCustomInterviewID = () => {
      const timestamp = new Date().toISOString(); // ISO string timestamp
      const randomString = Math.random().toString(36).substring(2, 15); // Random string
      return `interview-${timestamp}-${randomString}`;
    };

    const interviewID = generateCustomInterviewID();

    const filledAnswers = parsedQuestions.map((question, index) => {
      if (!answers[index] || answers[index].trim() === "") {
        return "Did not answer this question";
      }
      return answers[index];
    });
    const questionList = parsedQuestions.map(q => q.question);

    try {
      // Prepare data to be saved
      const submissionData = {
        email: Cookies.get("email"),
        questionList: questionList, // Store all questions
        answers: filledAnswers, // Store all answers
        timestamp: new Date(),
        interviewID: interviewID,
        jobRole: jobRole, // Store the job role
        experienceLevel: experienceLevel, // Store the experience level
        jobDescription: jobDescription, // Store the job description
      };
      console.log("Parsed>>>>>>>",questionList);
      if (!submissionData.email) {
        throw new Error("User Email is not available");
      }
      // Reference to the submissions collection with a custom document ID
      const submissionRef = doc(db, "submissions", interviewID);

      // Save the data to Firestore with the specified document ID
      await setDoc(submissionRef, submissionData);

      // Show success message and navigate to success page
      showsuccessToastMessage("Submission successful!");
      setShowModal2(false);
      setTimeout(() => {
        navigate("/viewfeedback", { state: { interviewID , questionList, answers, jobRole, experienceLevel, jobDescription } });
      }, 6000);
    } catch (error) {
      console.error("Error during submission:", error);
      showerrorToastMessage(
        "There was an error during submission. Please try again."
      );
    }
  };

  // Clear textarea when question changes
  useEffect(() => {
    document.getElementById(`answer-${currentQuestionIndex}`)?.focus();
  }, [currentQuestionIndex]);

  return (
    <div className="relative flex overflow-hidden">
      {pathname !== "/interview" && !isMobile && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}
      <div
        className={`${
          isMobile ? "pt-5" : "transition-all duration-500 ease-in-out"
        }`}
        style={{
          marginLeft: isMobile ? "0" : collapsed ? "0" : "0",
          width: isMobile ? "100%" : collapsed ? "100%" : "100%",
        }}
      >
        <div className={`${isMobile ? "p-4" : "px-16 mt-20"}`}>
          {userData ? (
            <div>
              <div
                className={`${
                  isMobile ? "px-6" : "px-12"
                } card3 py-1 mt-6 mb-8`}
                style={{ height: "fit-content" }}
              >
                <form className="my-8" autoComplete="off">
                  <ul>
                    {Array.isArray(parsedQuestions) &&
                    parsedQuestions.length > 0 ? (
                      <li>
                        <div className="flex flex-wrap-reverse justify-between">
                          <p className="font-bold text-xl text-neutral-800">
                            Interview Questions
                          </p>
                          <div
                            className={`${
                              isMobile ? "flex justify-end w-full" : ""
                            } `}
                          >
                            <button
                              className={`${
                                isMobile ? "w-40 mb-4" : "w-40"
                              } bg-red-600 hover:bg-red-800 text-white rounded-md h-10 font-medium shadow-md`}
                              type="button"
                              onClick={() => setShowModal(true)}
                            >
                              Quit Interview
                            </button>
                          </div>
                        </div>
                        <p
                          style={{ backgroundColor: "#edf2f7" }}
                          className="font-bold text-base w-fit p-2 rounded-md mt-2 text-neutral-800"
                        >
                          {parsedQuestions[currentQuestionIndex].questionno}
                        </p>
                        <h3 className="text-base mt-1 text-pretty text-neutral-800">
                          <span className="font-bold text-base mt-1 text-pretty text-neutral-800">
                            Question:
                          </span>{" "}
                          {parsedQuestions[currentQuestionIndex].question}
                        </h3>
                        <div
                          className={`${
                            isMobile ? "gap-0" : "gap-4"
                          } grid grid-cols-1 mb-1 md:grid-cols-1 lg:grid-cols-1`}
                        >
                          <LabelInputContainer className="mb-4">
                            <h3 className="font-bold text-base mt-1 text-pretty text-neutral-800">
                              Your Answer:{" "}
                            </h3>
                            <Textarea
                              id={`answer-${currentQuestionIndex}`}
                              rows="10"
                              placeholder="Please write your answer here..."
                              value={answers[currentQuestionIndex] || ""} // Control textarea value
                              onChange={(e) => {
                                const newAnswers = [...answers];
                                newAnswers[currentQuestionIndex] =
                                  e.target.value;
                                setAnswers(newAnswers);
                              }}
                            ></Textarea>
                          </LabelInputContainer>
                        </div>
                        <div
                          className={`${
                            isMobile ? "gap-2" : "gap-3 justify-between"
                          } flex`}
                        >
                          <button
                            className={`${isMobile ? "w-full" : "w-24"} ${
                              currentQuestionIndex === 0
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-white text-indigo-800 border border-indigo-800"
                            } relative group/btn block rounded-md h-10 font-medium`}
                            type="button"
                            onClick={handleBackClick}
                            disabled={currentQuestionIndex === 0}
                          >
                            Previous
                          </button>
                          <button
                            className={`${isMobile ? "w-full" : "w-24"} ${
                              currentQuestionIndex ===
                              parsedQuestions.length - 1
                                ? "hidden"
                                : "hover:bg-indigo-800 bg-indigo-700"
                            } relative group/btn block text-white rounded-md h-10 font-medium shadow-md`}
                            type="button"
                            onClick={handleNextClick}
                            disabled={
                              currentQuestionIndex ===
                              parsedQuestions.length - 1
                            }
                          >
                            Next
                          </button>
                          {currentQuestionIndex ===
                            parsedQuestions.length - 1 && (
                            <button
                              className={`${
                                isMobile ? "w-full" : "w-40"
                              } hover:bg-indigo-800 bg-indigo-700 text-white rounded-md h-10 font-medium shadow-md`}
                              type="button"
                              onClick={() => setShowModal2(true)}
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </li>
                    ) : (
                      <li>No questions generated yet.</li>
                    )}
                  </ul>
                </form>
              </div>
            </div>
          ) : (
              <div className="flex flex-col justify-center items-center pt-56">
                <p className={`${
                    isMobile ? "text-center" : ""
                  } text-pretty`}>Click the button below to go to the Dashboard and start generating questions!</p>
                <Link
                  to="/dashboard"
                  className={`${
                    isMobile ? "w-40" : "w-40"
                  } hover:bg-indigo-800 mt-3 bg-indigo-700 relative text-white p-2 rounded-md text-center font-medium shadow-md`}
                >
                  Dashboard
                </Link>
              </div>
          )}
        </div>
      </div>
      <ToastContainer />

      <Modal show={showModal1} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="bg-white rounded-md">
          <form className="my-4" autoComplete="off">
            <div className="flex flex-col items-center justify-center">
              <i
                className="text-red-500 mb-2 fa fa-exclamation-triangle"
                aria-hidden="true"
                style={{ fontSize: "2rem" }}
              ></i>
              <h4
                className={cn(
                  isMobile ? "w-64 text-center" : "",
                  "rounded-md p-2"
                )}
              >
                Are you sure you want to quit Interview ?
              </h4>
              <p className="text-gray-600 mb-1">
                You will return to the Dashboard.
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={cn(
                    isMobile ? "w-32" : "w-20",
                    "hover:bg-gray-300 bg-gray-200 rounded-md shadow-md"
                  )}
                  type="reset"
                >
                  No
                </button>
                <button
                  className={cn(
                    isMobile ? "w-32" : "w-20",
                    "hover:bg-red-700 bg-red-600 relative group/btn block text-white rounded-md h-10 font-medium shadow-md"
                  )}
                  type="submit"
                  onClick={handlequit}
                >
                  Yes
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showModal2} onHide={() => setShowModal2(false)} centered>
        <Modal.Body className="bg-white rounded-md">
          <form className="my-4" autoComplete="off">
            <div className="flex flex-col items-center justify-center">
              <i
                className="text-indigo-700 mb-2 fa fa-circle-exclamation"
                aria-hidden="true"
                style={{ fontSize: "2rem" }}
              ></i>
              <h4
                className={cn(
                  isMobile ? "w-64 text-center" : "",
                  "rounded-md p-2"
                )}
              >
                Are you sure you want to submit Interview ?
              </h4>
              <p className="text-gray-600 mb-1">
                You will return to the Dashboard.
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setShowModal2(false)}
                  className={cn(
                    isMobile ? "w-32" : "w-20",
                    "hover:bg-gray-300 bg-gray-200 rounded-md shadow-md"
                  )}
                  type="button"
                >
                  No
                </button>
                <button
                  className={cn(
                    isMobile ? "w-32" : "w-20",
                    "hover:bg-indigo-800 bg-indigo-700 relative group/btn block text-white rounded-md h-10 font-medium shadow-md"
                  )}
                  type="button"
                  onClick={handleSubmit}
                >
                  Yes
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default Interview;
