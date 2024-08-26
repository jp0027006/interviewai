// src/pages/Dashboard.jsx
import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { query, where, getDocs, collection } from "firebase/firestore";
import { db } from "../../src/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../src/config/firebase";
import Cookies from "js-cookie";
import Sidebar from "./ui/sidebar";
import MobileNavbar from "./MobileNavbar";
import { UserContext } from "../context/UserContext";
import { useQuestions } from "../context/QuestionsContext";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import CustomSelect from "../Components/ui/CustomSelect";
import { Textarea } from "../Components/ui/textarea";
import { cn } from "../../lib/utils";
import Interview from './Interview';

export function Dashboard() {
  const navigate = useNavigate();
  const { userData, login, logout } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);

  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const { questions, setQuestions } = useQuestions();


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
          setError("No user data found");
        }
      } catch (error) {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      } else {
        fetchUserData();
      }
    });
  }, [navigate, login]);

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("email");
    logout();
    navigate("/");
  };

  const handleReset = () => {
    setJobRole("");
    setExperienceLevel("");
    setJobDescription("");
  };

  const generateInterviewQuestions = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobRole,
          experienceLevel,
          jobDescription,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        const questions = data.questions;
        setQuestions(questions);
        console.log("Generated Questions:", questions);
        // Display or process questions as needed
      } else {
        console.error("Error generating questions:", data.error);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
    }
  };
    
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Job Role:", jobRole);
    console.log("Experience Level:", experienceLevel);
    console.log("Job Description:", jobDescription);

    await generateInterviewQuestions();
    navigate("/interview");
    handleReset();
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
    return <div>Error: {error}</div>;
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
          {userData ? (
            <div>
              <div
                className={`${
                  isMobile ? "px-6" : "px-12"
                } card3 py-1 mt-6 mb-8`}
                style={{ height: "fit-content" }}
              >
                <h2
                  className="font-bold text-xl mt-4 text-neutral-800"
                  style={{ textAlign: "left" }}
                >
                  Generate Custom Interview
                </h2>
                <p className="text-neutral-600 mt-2 text-pretty">
                  Effortlessly create customized interview questions for various
                  roles and experience levels.
                </p>
                <form
                  className="my-8"
                  autoComplete="off"
                  onSubmit={handleSubmit}
                >
                  <div
                    className={`${
                      isMobile ? "gap-0" : "gap-4"
                    } grid grid-cols-1 mb-1 md:grid-cols-2 lg:grid-cols-2`}
                  >
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="jobRole">Select Job Role</Label>
                      <CustomSelect
                        options={[
                          { value: "Software Engineer", label: "Software Engineer" },
                          { value: "Data Scientist", label: "Data Scientist" },
                          { value: "Product Manager", label: "Product Manager" },
                          { value: "UI/UX Designer", label: "UI/UX Designer" },
                          { value: "Marketing Manager", label: "Marketing Manager" },
                          { value: "Sales Representative", label: "Sales Representative" },
                          { value: "Project Manager", label: "Project Manager" },
                          { value: "Graphic Designer", label: "Graphic Designer" },
                          { value: "Business Analyst", label: "Business Analyst" },
                          { value: "Front-End Developer", label: "Front-End Developer" },
                          { value: "Back-End Developer", label: "Back-End Developer" },
                          { value: "Full-Stack Developer", label: "Full-Stack Developer" },
                          { value: "DevOps Engineer", label: "DevOps Engineer" },
                          { value: "Content Writer", label: "Content Writer" },
                          { value: "HR Specialist", label: "HR Specialist" },
                          {
                            value: "Customer Support Specialist",
                            label: "Customer Support Specialist",
                          },
                          { value: "Quality Assurance Analyst", label: "Quality Assurance Analyst" },
                          { value: "Network Administrator", label: "Network Administrator" },
                          { value: "Database Administrator", label: "Database Administrator" },
                          { value: "Systems Analyst", label: "Systems Analyst" },
                        ]}
                        value={jobRole}
                        onChange={(value) => setJobRole(value)}
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="experienceLevel">Experience Level</Label>
                      <div className="container2">
                        <div className="radio-tile-group gap-3">
                          <div className="input-container">
                            <input
                              id="beginner"
                              className="radio-button"
                              type="radio"
                              name="experienceLevel"
                              value="beginner"
                              checked={experienceLevel === "beginner"}
                              onChange={(e) =>
                                setExperienceLevel(e.target.value)
                              }
                            />
                            <div className="radio-tile">
                              <label
                                htmlFor="beginner"
                                className="radio-tile-label text-sm font-medium"
                              >
                                Beginner
                              </label>
                            </div>
                          </div>
                          <div className="input-container">
                            <input
                              id="intermediate"
                              className="radio-button"
                              type="radio"
                              name="experienceLevel"
                              value="intermediate"
                              checked={experienceLevel === "intermediate"}
                              onChange={(e) =>
                                setExperienceLevel(e.target.value)
                              }
                            />
                            <div className="radio-tile">
                              <label
                                htmlFor="intermediate"
                                className="radio-tile-label text-sm font-medium"
                              >
                                Intermediate
                              </label>
                            </div>
                          </div>
                          <div className="input-container">
                            <input
                              id="expert"
                              className="radio-button"
                              type="radio"
                              name="experienceLevel"
                              value="expert"
                              checked={experienceLevel === "expert"}
                              onChange={(e) =>
                                setExperienceLevel(e.target.value)
                              }
                            />
                            <div className="radio-tile">
                              <label
                                htmlFor="expert"
                                className="radio-tile-label text-sm font-medium"
                              >
                                Expert
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </LabelInputContainer>
                  </div>
                  <div
                    className={`${
                      isMobile ? "gap-0" : "gap-4"
                    } grid grid-cols-1 mb-1 md:grid-cols-1 lg:grid-cols-1`}
                  >
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <Textarea
                        id="jobDescription"
                        rows="10"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Provide a brief job description, highlighting key responsibilities and required skills..."
                      ></Textarea>
                    </LabelInputContainer>
                  </div>
                  <div
                    className={`${
                      isMobile
                        ? "gap-2 items-center justify-center"
                        : "gap-3 justify-between"
                    } flex`}
                  >
                    <button
                      className={`${
                        isMobile ? "w-full" : "w-24"
                      } hover:bg-gray-300 bg-gray-200 relative group/btn block rounded-md h-10 font-medium shadow-md`}
                      type="button"
                      onClick={handleReset}
                    >
                      Clear
                    </button>
                    <button
                      className={`${
                        isMobile ? "w-full" : "w-40"
                      } hover:bg-indigo-800 bg-indigo-700 relative text-white rounded-md h-10 font-medium shadow-md flex items-center justify-center`}
                      type="submit"
                    >
                      <svg
                        height="18"
                        width="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
                      </svg>
                      Generate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <p>Your profile is on its way, just a moment..</p>
          )}
        </div>
      </div>
      {isMobile && <MobileNavbar onLogout={handleLogout} />}
      {questions && <Interview questions={questions} />}
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
