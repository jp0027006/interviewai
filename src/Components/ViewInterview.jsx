import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate,useParams } from "react-router-dom"; // To get interviewID from URL
import {
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db, auth } from "../../src/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "./ui/sidebar";
import MobileNavbar from "./MobileNavbar";
import { UserContext } from "../context/UserContext";
import Cookies from "js-cookie";

const ViewInterview = () => {
  const navigate = useNavigate();
  const { userData, login, logout } = useContext(UserContext);
  const hasFetchedUserData = useRef(false);
  const { interviewID } = useParams(); // Get interviewID from the URL
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 750);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

    const fetchInterviewData = async () => {
      if (!interviewID) {
        setError("No interview ID provided.");
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "feedbacks", interviewID);
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

    const fetchUserData = async (storedEmail) => {
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", storedEmail.toLowerCase().trim())
        );
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot:", querySnapshot);
    
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          console.log("User data found:", docData);
          login(docData); // Update UserContext
        } else {
          console.error("No user data found");
          setError("No user data found");
        }
      } catch (error) {
        console.error("Firestore error:", error);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };
    

    const onAuthChange = async (user) => {
      if (!user) {
        navigate("/");
      } else {
        const authToken = Cookies.get("authToken");
        const storedEmail = Cookies.get("email");

        if (!authToken || !storedEmail) {
          navigate("/");
          return;
        }

        if (!hasFetchedUserData.current) {
          await fetchUserData(storedEmail);
          await fetchInterviewData();
          hasFetchedUserData.current = true;
        } else {
          setLoading(false); 
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, onAuthChange);
    return () => unsubscribe();
  }, [interviewID, navigate, login]);

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
  
  if (error) return <p>{error}</p>;

  const { jobRole, experienceLevel, jobDescription, feedback, answers } =
    interviewData || {};

  return (
    <div className="relative flex overflow-hidden">
      {!isMobile && userData && (
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
          {interviewData ? (
            <div>
              <div
                className="card3 py-1 mt-6 mb-8 bg-transparent shadow-none"
                style={{ height: "fit-content" }}
              >
                <h2 className="font-bold text-xl ms-1 mt-4 text-neutral-800">
                  Feedback of your interview
                </h2>
                <p className="text-neutral-600 ms-1 mt-2 text-pretty">
                  Your performance has been evaluated based on your responses
                  and experience level.
                </p>
                <div className="mb-3 mt-3 flex flex-col text-pretty card shadow-md px-4 py-4 rounded-2xl">
                  <p>
                    <strong>Interview ID:</strong> <span>{interviewID}</span>
                  </p>
                  <p className="flex">
                    <strong>Job Role:</strong> {jobRole}
                  </p>
                  <p className="flex">
                    <strong>Experience Level:</strong>{" "}
                    <span className="capitalize">{experienceLevel}</span>
                  </p>
                  <p className="flex flex-col">
                    <strong>Job Description:</strong> {jobDescription}
                  </p>
                </div>

                {/* Map over feedback array */}
                {feedback && feedback.length > 0 ? (
                  feedback.map((item, index) => (
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
                        {answers && answers[index]
                          ? answers[index]
                          : "No answer provided"}
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
                  ))
                ) : (
                  <p>No feedback available for this interview.</p>
                )}
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

export default ViewInterview;
