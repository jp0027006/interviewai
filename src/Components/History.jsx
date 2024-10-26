import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db, auth } from "../../src/config/firebase";
import {
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Cookies from "js-cookie";
import Sidebar from "./ui/sidebar";
import MobileNavbar from "./MobileNavbar";
import { UserContext } from "../context/UserContext";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { cn } from "../../lib/utils";
import { FaTrash } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const History = () => {
  const navigate = useNavigate();
  const { userData, login, logout } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);
  const [interviews, setInterviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const hasFetchedUserData = useRef(false);
  const [startDate, setStartDate] = useState(""); // Start date for filter
  const [endDate, setEndDate] = useState(""); // End date for filter
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 750);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchUserInterviews = async () => {
      setLoading(true);
      try {
        const email = Cookies.get("email");
        if (!email) {
          navigate("/");
          return;
        }

        const q = query(
          collection(db, "submissions"),
          where("email", "==", email.toLowerCase().trim())
        );
        const querySnapshot = await getDocs(q);

        const interviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort interviews by date (latest first)
        interviewsData.sort((a, b) => {
          const dateA = a.timestamp?.toDate() || new Date(0); // Default to epoch time if timestamp is undefined
          const dateB = b.timestamp?.toDate() || new Date(0);
          return dateB - dateA;
        });

        setInterviews(interviewsData);
        setFilteredInterviews(interviewsData); // Initialize filteredInterviews with sorted data

        // Fetch feedback for each interview
        const feedbackPromises = interviewsData.map(async (interview) => {
          const feedback = await fetchFeedbackForInterview(interview.id);
          return { interviewId: interview.id, feedback };
        });

        const feedbackResults = await Promise.all(feedbackPromises);
        const feedbackMap = feedbackResults.reduce(
          (acc, { interviewId, feedback }) => {
            acc[interviewId] = feedback;
            return acc;
          },
          {}
        );

        setFeedback(feedbackMap);
        setIsAuthChecked(true);
      } catch (error) {
        setError("Error fetching interview data.");
      } finally {
        setLoading(false);
      }
    };

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
          login(docData); // This should update the UserContext
        } else {
          setError("No user data found");
        }
      } catch (error) {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    const onAuthChange = (user) => {
      if (!user) {
        navigate("/");
      } else if (!hasFetchedUserData.current) {
        fetchUserData();
        fetchUserInterviews();
        hasFetchedUserData.current = true; // Set the flag to true after fetching data
      } else {
        setLoading(false); // If data has already been fetched, stop loading
        setIsAuthChecked(true);
      }

      unsubscribe(); // Unsubscribe immediately after the first invocation
    };

    const unsubscribe = onAuthStateChanged(auth, onAuthChange);

    // Cleanup function to unsubscribe if the component unmounts before onAuthChange triggers
    return () => unsubscribe();
  }, [navigate, login]);

  const fetchFeedbackForInterview = async (interviewId) => {
    try {
      const feedbackQuery = query(
        collection(db, "feedbacks"),
        where("interviewID", "==", interviewId)
      );

      const feedbackSnapshot = await getDocs(feedbackQuery);

      if (!feedbackSnapshot.empty) {
        const feedbackDoc = feedbackSnapshot.docs[0];

        const feedbackData = feedbackDoc.data().feedback; // Feedback is an array of question objects

        // Calculate total and average rating
        const totalRating = feedbackData.reduce((sum, feedback) => {
          const ratingValue = parseFloat(feedback.rating) || 0;
          return sum + ratingValue;
        }, 0);

        const total = totalRating / feedbackData.length;
        const averageRating = total / 2; // Average rating

        return { feedbackData, averageRating }; // Return both feedback data and average rating
      } else {
      }

      return null;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      return null;
    }
  };

  const handleSearch = (event) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = interviews.filter((interview) => {
      // Convert timestamp to a searchable date string in DD/MM/YYYY format
      const interviewDate =
        interview.timestamp && interview.timestamp.toDate
          ? (() => {
              const date = new Date(interview.timestamp.toDate());
              const day = date.getDate().toString().padStart(2, "0");
              const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            })()
          : "";

      const matchesSearchTerm =
        interview.jobRole.toLowerCase().includes(lowerSearchTerm) ||
        interview.experienceLevel.toLowerCase().includes(lowerSearchTerm) ||
        interviewDate.includes(lowerSearchTerm);

      // Filter by date range if both dates are selected
      let matchesDateRange = true;
      if (startDate && endDate) {
        const interviewTime = interview.timestamp?.toDate();
        const start = new Date(startDate);
        const end = new Date(endDate);

        matchesDateRange =
          interviewTime && interviewTime >= start && interviewTime <= end;
      }

      // Search across multiple fields
      return (
        (interview.jobRole.toLowerCase().includes(value) ||
          interview.experienceLevel.toLowerCase().includes(value) ||
          interviewDate.includes(value) ||
          (interview.someOtherField &&
            interview.someOtherField.toLowerCase().includes(value))) &&
        matchesDateRange // Combine search term and date range
      );
    });

    setFilteredInterviews(filtered);
  };

  const deleteInterview = async (interviewId) => {
    try {
      await deleteDoc(doc(db, "submissions", interviewId)); // Delete the interview from Firestore

      // Remove the deleted interview from the state
      setFilteredInterviews((prevInterviews) =>
        prevInterviews.filter((interview) => interview.id !== interviewId)
      );
      setInterviews((prevInterviews) =>
        prevInterviews.filter((interview) => interview.id !== interviewId)
      );

      // Show success toast message
      showsuccessToastMessage("Interview deleted successfully!");
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };

  const showsuccessToastMessage = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("email");
    logout();
    navigate("/");
  };

  if (loading || !isAuthChecked) {
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
          {filteredInterviews.length > 0 ? (
            <div>
              <div
                className={`${
                  isMobile ? "" : ""
                } card3 py-1 px-12 mt-6 mb-8 bg-white`}
                style={{ height: "fit-content" }}
              >
                <h2
                  className="font-bold text-xl mb-2 mt-4 text-neutral-800"
                  style={{ textAlign: "left" }}
                >
                  History
                </h2>
                <p className="text-neutral-600 mb-4 text-pretty">
                Summary of your previous interview history.
                </p>
                <div
                  className={`${
                    isMobile ? "flex-col" : ""
                  } flex lg:flex-row md:flex-col sm:flex-col gap-2 mb-4`}
                >
                  <Label
                    className={`${
                      isMobile
                        ? "justify-start  items-start"
                        : "justify-center items-center"
                    } flex sm:justify-start  md:justify-start  lg:justify-start`}
                  >
                    Select date from:
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Label
                    className={`${
                      isMobile
                        ? "justify-start  items-start"
                        : "justify-center items-center"
                    } flex sm:justify-start  md:justify-start  lg:justify-start`}
                  >
                    to:
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    className={`${
                      isMobile ? "h-10" : ""
                    } bg-indigo-700 md:h-11 text-white w-20 p-1 rounded-md`}
                    onClick={handleSearch}
                  >
                    Apply
                  </button>
                </div>

                <div className="flex flex-col">
                  <div className="flex-1">
                    <LabelInputContainer className="mb-2">
                      <Input
                        placeholder="Search here..."
                        type="text"
                        autoComplete="off"
                        onChange={handleSearch}
                        value={searchTerm}
                      />
                    </LabelInputContainer>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-transparent">
                      <tr>
                        <th className="px-6 py-3 font-normal">
                          <strong>Sr. No.</strong>
                        </th>
                        <th className="px-6 py-3 font-normal">
                          <strong>Job Role</strong>
                        </th>
                        <th className="px-6 py-3 font-normal">
                          <strong>Experience Level</strong>
                        </th>
                        <th className="px-6 py-3 font-normal">
                          <strong>Date</strong>
                        </th>
                        <th className="px-6 py-3 font-normal">
                          <strong>Time</strong>
                        </th>
                        <th className="px-6 py-3 font-normal">
                          <strong className="">Rating</strong>
                        </th>
                        <th className="px-6 py-3">
                          <strong></strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-200">
                      {filteredInterviews.map((interview, index) => (
                        <tr
                          key={interview.id}
                          className="rounded-md cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            (window.location.href = `/viewinterview/${interview.id}`)
                          }
                        >
                          <td className="px-6 py-3 whitespace-nowrap">
                            {index + 1}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap capitalize">
                            {interview.jobRole}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap capitalize">
                            {interview.experienceLevel}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            {new Date(
                              interview.timestamp.toDate()
                            ).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-6 uppercase py-3 whitespace-nowrap">
                            {new Date(
                              interview.timestamp.toDate()
                            ).toLocaleString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                              date: "Sun",
                            })}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            {/* {feedback[interview.id] && feedback[interview.id].averageRating
                              ? feedback[interview.id].averageRating // Display average rating
                              : "N/A"} */}
                            <div className="rating flex flex-row-reverse  -ml-4">
                              {[5, 4, 3, 2, 1].map((star) => (
                                <>
                                  <input
                                    type="radio"
                                    id={`star${star}-${interview.id}`}
                                    name={`rate-${interview.id}`}
                                    defaultValue={star}
                                    checked={
                                      feedback[interview.id] &&
                                      Math.round(
                                        feedback[interview.id].averageRating
                                      ) === star
                                    }
                                    readOnly
                                  />
                                  <label
                                    htmlFor={`star${star}-${interview.id}`}
                                    title={`${star} stars`}
                                  >
                                    <svg
                                      viewBox="0 0 576 512"
                                      height="0.7em"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className={`star ${
                                        feedback[interview.id] &&
                                        Math.round(
                                          feedback[interview.id].averageRating
                                        ) >= star
                                          ? "filled"
                                          : ""
                                      }`}
                                    >
                                      <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                                    </svg>
                                  </label>
                                </>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className="flex items-center justify-center">
                              <span
                                className="p-2 rounded-full btn text-white bg-red-500 hover:bg-red-700 cursor-pointer"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent the row click event from firing
                                  deleteInterview(interview.id);
                                }}
                              >
                                <FaTrash size={"18px"} />
                              </span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div
                className={`${
                  isMobile ? "" : ""
                } card3 py-1 px-12 mt-6 mb-8 bg-white`}
                style={{ height: "fit-content" }}
              >
                <h2
                  className="font-bold text-xl ms-1 mb-3 mt-4 text-neutral-800"
                  style={{ textAlign: "left" }}
                >
                  History of your interview
                </h2>

                <div
                  className={`${
                    isMobile ? "flex-col" : ""
                  } flex lg:flex-row md:flex-col sm:flex-col gap-2 mb-4`}
                >
                  <Label
                    className={`${
                      isMobile
                        ? "justify-start  items-start"
                        : "justify-center items-center"
                    } flex sm:justify-start  md:justify-start  lg:justify-start`}
                  >
                    Select date from:
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Label
                    className={`${
                      isMobile
                        ? "justify-start  items-start"
                        : "justify-center items-center"
                    } flex sm:justify-start  md:justify-start  lg:justify-start`}
                  >
                    to:
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    className={`${
                      isMobile ? "h-10" : ""
                    } bg-indigo-700 md:h-11 text-white w-20 p-1 rounded-md`}
                    onClick={handleSearch}
                  >
                    Apply
                  </button>
                </div>

                <div className="flex flex-col">
                  <div className="flex-1">
                    <LabelInputContainer className="mb-2">
                      <Input
                        placeholder="Search here..."
                        type="text"
                        autoComplete="off"
                        onChange={handleSearch}
                        value={searchTerm}
                      />
                    </LabelInputContainer>
                  </div>
                </div>
                <p className="flex items-center justify-center mt-4 mb-4 font-light">
                  <strong>No match found for search.</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {isMobile && <MobileNavbar onLogout={handleLogout} />}
      <ToastContainer />
    </div>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default History;
