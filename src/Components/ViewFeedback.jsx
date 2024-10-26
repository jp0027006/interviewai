import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { db } from "../../src/config/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../src/config/firebase";
import Cookies from "js-cookie";
import Sidebar from "./ui/sidebar";
import MobileNavbar from "./MobileNavbar";
import { UserContext } from "../context/UserContext";
import "react-toastify/dist/ReactToastify.css";

const ViewFeedback = () => {
  const navigate = useNavigate();
  const { userData, login, logout } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);
  const location = useLocation();
  const {
    interviewID,
    questionList,
    answers,
    jobRole,
    experienceLevel,
    jobDescription,
  } = location.state || {};
  const [feedback, setFeedback] = useState(null);
  const hasFetchedUserData = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 750);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const generateFeedback = async () => {
      setLoading(true);
      try {
        // Check if feedback already exists
        const feedbackRef = doc(db, "feedbacks", interviewID);
        const feedbackDoc = await getDoc(feedbackRef);

        if (!feedbackDoc.exists()) {
          // Fetch feedback from the API if it doesn't exist in Firestore
          const response = await fetch(
            "http://192.168.31.127:3003/api/generate-feedback",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                questionList: Array.isArray(questionList) ? questionList : [],
                answers: Array.isArray(answers) ? answers : [],
                jobRole: jobRole || "",
                experienceLevel: experienceLevel || "",
                jobDescription: jobDescription || "",
                interviewID: interviewID || "",
              }),
            }
          );

          const data = await response.json();
          if (response.ok) {
            const feedbackData = JSON.parse(data.feedback);
            console.log(feedbackData); // Parse the feedback JSON
            const email = Cookies.get("email");
            const feedbackID = interviewID; // Use interviewID as feedbackID
            await setDoc(feedbackRef, {
              feedbackID,
              interviewID,
              jobRole,
              experienceLevel,
              jobDescription,
              email,
              feedback: feedbackData,
              timestamp: new Date(),
            });

            setFeedback(feedbackData); // Set the local state to display feedback
            console.log("Feedback saved to Firestore:", feedbackData);
          } else {
            setError(`Error: ${data.error || "Unknown error"}`);
          }
        } else {
          // If feedback exists, set it to the local state to display
          setFeedback(feedbackDoc.data().feedback);
        }
      } catch (error) {
        setError(`Error: ${error.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    if (
      questionList &&
      answers &&
      jobRole &&
      experienceLevel &&
      jobDescription &&
      interviewID
    ) {
      generateFeedback();
    } else {
      setError(
        "Incomplete data provided. Press the button below to head to the Dashboard."
      );
    }
  }, [
    questionList,
    answers,
    jobRole,
    experienceLevel,
    jobDescription,
    interviewID,
  ]);

  useEffect(() => {
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      navigate("/");
      return;
    }

    const storedEmail = Cookies.get("email");
    if (!storedEmail) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", storedEmail.toLowerCase().trim())
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          login(docData);
        } else {
          setError(
            "No user data found. Press the button below to head to the Dashboard."
          );
        }
      } catch (error) {
        setError(
          "Error fetching user data. Press the button below to head to the Dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    const onAuthChange = (user) => {
      if (!user) {
        navigate("/");
      } else if (!hasFetchedUserData.current) {
        fetchUserData();
        hasFetchedUserData.current = true; // Set the flag to true after fetching data
      } else {
        setLoading(false); // If data has already been fetched, stop loading
      }

      unsubscribe(); // Unsubscribe immediately after the first invocation
    };

    const unsubscribe = onAuthStateChanged(auth, onAuthChange);

    // Cleanup function to unsubscribe if the component unmounts before onAuthChange triggers
    return () => unsubscribe();
  }, [navigate, login]);

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("email");
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          style={{
            left: "50%",
            top: "50%",
            position: "absolute",
            transform: "translate(-50%, -50%) matrix(1, 0, 0, 1, 0, 0)",
          }}
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 187.3 93.7"
          height="300px"
          width="400px"
        >
          <path
            d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 				c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
            strokeMiterlimit="10"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="4"
            fill="none"
            id="outline"
            stroke="#4338CA"
          ></path>
          <path
            d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 				c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
            strokeMiterlimit="10"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="4"
            stroke="#4338CA"
            fill="none"
            opacity="0.05"
            id="outline-bg"
          ></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1>{error}</h1>
        <Link
          to="/dashboard"
          className={`${
            isMobile ? "w-full" : "w-40"
          } hover:bg-indigo-800 mt-3 bg-indigo-700 relative text-white p-2 rounded-md text-center font-medium shadow-md`}
        >
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex overflow-hidden">
      {!isMobile && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}
      <div
        className={`${
          isMobile ? "pt-16 t-16" : "transition-all duration-500 ease-in-out"
        }`}
        style={{
          marginLeft: isMobile ? "0" : collapsed ? "80px" : "270px",
          width: isMobile
            ? "100%"
            : collapsed
            ? "calc(100% - 80px)"
            : "calc(100% - 250px)",
        }}
      >
        <div className={`${isMobile ? "p-4" : "px-16 mt-5"}`}>
          {feedback ? (
            <div>
              <div
                className={`${
                  isMobile ? "" : ""
                } card3 py-1 mt-6 mb-8 bg-transparent shadow-none`}
                style={{ height: "fit-content" }}
              >
                <h2
                  className="font-bold text-xl ms-1 mt-4 text-neutral-800"
                  style={{ textAlign: "left" }}
                >
                  Feedback of your interview
                </h2>
                <p className="text-neutral-600 ms-1 mt-2 text-pretty">
                  Your performance has been evaluated based on your responses
                  and experience level.
                </p>
                <div className="mb-3 mt-3 flex flex-col text-pretty card shadow-md px-4 py-4 rounded-2xl">
                  <p className="">
                    <strong className="me-1">Interview ID:</strong> <span>{interviewID}</span>
                  </p>
                  <p className="flex">
                    <strong className="me-1">Job Role:</strong> {jobRole}
                  </p>
                  <p className="flex">
                    <strong className="me-1">Experience Level:</strong> <span className="capitalize">{experienceLevel}</span>
                  </p>
                  <p className="flex flex-col">
                    <strong>Job Description:</strong> {jobDescription}
                  </p>
                </div>
                {feedback.map((item, index) => (
                  <div
                    className="text-pretty gap-1 card shadow-md px-4 py-4 rounded-2xl"
                    key={index}
                    style={{ marginBottom: "1rem" }}
                  >
                    <p>
                      <strong>{item.questionno}:</strong> {item.question}
                    </p>
                    <p>
                      <strong>Your answer:</strong>{" "}
                      {answers[index] || "No answer provided"}
                    </p>
                    <p>
                      <strong>Rating:</strong> {item.rating}
                    </p>
                    <p className="flex flex-col bg-green-100 p-1 rounded-md">
                      <strong>Pros:</strong>
                      <span className="text-green-700 text-justify mr-3">
                        <ul className="list-disc ml-5">
                          {item.pros
                            ? item.pros
                                .split('.')
                                .filter(sentence => sentence.trim()) // Remove empty sentences
                                .map((sentence, index) => (
                                  <li key={index}>{sentence.trim()}.</li>
                                ))
                            : "No pros available"}
                        </ul>
                      </span>
                    </p>
                    <p className="flex flex-col bg-red-100 p-1 rounded-md">
                      <strong>Cons:</strong>
                      <span className="text-red-700 text-justify mr-3">
                        <ul className="list-disc ml-5">
                          {item.cons
                            ? item.cons
                                .split('.')
                                .filter(sentence => sentence.trim()) // Remove empty sentences
                                .map((sentence, index) => (
                                  <li key={index}>{sentence.trim()}.</li>
                                ))
                            : "No cons available"}
                        </ul>
                      </span>
                    </p>
                    <p className="flex flex-col bg-blue-100 p-1 rounded-md">
                      <strong className="">Suggestion:</strong>
                      <span className="text-blue-700 text-justify mr-3">
                        <ul className="list-disc ml-5">
                          {item.suggestion
                            ? item.suggestion
                                .split('.')
                                .filter(sentence => sentence.trim()) // Remove empty sentences
                                .map((sentence, index) => (
                                  <li key={index}>{sentence.trim()}.</li>
                                ))
                            : "No suggestion available"}
                        </ul>
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Your Feedback is on its way, just a moment..</p>
          )}
        </div>
      </div>
      {isMobile && <MobileNavbar onLogout={handleLogout} />}
    </div>
  );
};

export default ViewFeedback;
