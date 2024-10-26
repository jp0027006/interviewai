import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../src/config/firebase";
import {
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  getAuth,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../src/config/firebase";
import Cookies from "js-cookie";
import Sidebar from "./ui/sidebar";
import MobileNavbar from "./MobileNavbar";
import { UserContext } from "../context/UserContext";
import avatar from "../assets/boy.png";
import { BackgroundGradientAnimation } from "../Components/ui/background-gradient-animation3";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { cn } from "../../lib/utils";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Eye, EyeOff } from "react-feather";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldpassword, setOldPassword] = useState("");
  const navigate = useNavigate();
  const { userData, login, logout } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");
  const [creationTime, setCreationTime] = useState("");
  const hasFetchedUserData = useRef(false);

  const togglePasswordVisibility = () => {
    
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  // Use a ref to track if initial form state is set
  const isInitialLoad = useRef(true);

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
          if (isInitialLoad.current) {
            setFirstName(docData.firstName || "");
            setLastName(docData.lastName || "");
            setEmail(docData.email || "");
            isInitialLoad.current = false;
            const user = auth.currentUser;
            setCreationTime(user.metadata.creationTime);
          }
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
        hasFetchedUserData.current = true; // Set the flag to true after fetching data
        const lastLogin = user.metadata.lastSignInTime;
        setLastLoginTime(new Date(lastLogin).toLocaleString());
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = [];
    const validations = [
      { condition: !firstName, message: "First name cannot be empty." },
      { condition: !lastName, message: "Last name cannot be empty." },
      {
        condition: !/^[a-zA-Z]+$/.test(firstName),
        message: "First name must contain only alphabets.",
      },
      {
        condition: !/^[a-zA-Z]+$/.test(lastName),
        message: "Last name must contain only alphabets.",
      },
    ];

    validations.forEach(({ condition, message }) => {
      if (condition) errors.push(message);
    });

    if (errors.length) {
      showerrorToastMessage(errors.join(" "));
      return;
    }

    const storedEmail = Cookies.get("email");

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", storedEmail.toLowerCase().trim())
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "users", docId);

        await updateDoc(docRef, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });

        login({
          ...userData,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        showsuccessToastMessage("Profile updated successfully");
      } else {
        setError("User not found");
      }
    } catch (error) {
      showerrorToastMessage("Failed to update profile. Please try again.");
    }
  };

  const handleDeactivateAccount = async (e) => {
    e.preventDefault();

    setError(""); // Reset error before deletion

    const storedEmail = Cookies.get("email");

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", storedEmail.toLowerCase().trim())
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "users", docId);

        await deleteDoc(docRef); // Deletes user data from Firestore

        // Optionally delete the user from Firebase Authentication
        const user = auth.currentUser;
        if (user) {
          await user.delete(); // Deletes the user from Firebase Authentication
        }

        // Clear cookies and log out
        Cookies.remove("authToken");
        Cookies.remove("email");
        logout();
        navigate("/");
      } else {
        setError("User not found");
      }
    } catch (error) {
      showerrorToastMessage("Failed to delete account. Please try again.");
    }
  };

  const handleReset = () => {
    setFirstName(userData?.firstName || "");
    setLastName(userData?.lastName || "");
  };
  const handlePasswordReset = () => {
    setPassword("");
    setConfirmPassword("");
    setOldPassword("");
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      showerrorToastMessage("No user is currently signed in.");
      return;
    }
    if (
      user.providerData.some((profile) => profile.providerId === "google.com")
    ) {
      showwarningToastMessage(
        "Since you signed up using Google, you can change your password in your Google account settings."
      );
      handlePasswordReset();
    } else {
      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        showsuccessToastMessage("Password Changed successfully");
        handlePasswordReset();
      } catch (error) {
        showerrorToastMessage("Current Password Is Invalid");
      }
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

  const showerrorToastMessage = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };
  const showwarningToastMessage = (message) => {
    toast.warn(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
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
              <div className="card2 shadow-md">
                <div className="card2__img">
                  <div className="h-full">
                    <div
                      className="w-full relative"
                      style={{ height: "inherit" }}
                    >
                      <BackgroundGradientAnimation />
                    </div>
                  </div>
                </div>
                <div className="card2__avatar">
                  <img
                    height="100"
                    width="100"
                    alt="Avatar"
                    className="h-13 w-13 rounded-full"
                    src={userData?.avatar || avatar}
                    style={{ transition: "opacity 0.3s ease-in-out" }}
                  />
                </div>
                <div className="card2__title">
                  {userData.firstName} {userData.lastName}
                </div>
                <div className="card2__subtitle">{userData.email}</div>
                <div className="card2__wrapper"></div>
              </div>

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
                  Personal Information
                </h2>
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
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        type="text"
                        autoComplete="off"
                        onChange={handleFirstNameChange}
                        value={firstName}
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last Name"
                        type="text"
                        autoComplete="off"
                        onChange={handleLastNameChange}
                        value={lastName}
                      />
                    </LabelInputContainer>
                  </div>
                  <div
                    className={`${
                      isMobile ? "gap-2 items-center justify-center" : "gap-3"
                    } flex`}
                  >
                    <button
                      className={`${
                        isMobile ? "w-full" : "w-24"
                      } hover:bg-gray-300 bg-gray-200 relative group/btn block rounded-md h-10 font-medium shadow-md`}
                      type="button"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                    <button
                      className={`${
                        isMobile ? "w-full" : "w-40"
                      } hover:bg-indigo-800 bg-indigo-700 relative group/btn block text-white rounded-md h-10 font-medium shadow-md`}
                      type="submit"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              <div
                className={`${
                  isMobile ? "gap-0" : "gap-4 mb-8 -mt-1"
                } grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2`}
              >
                <div
                  className={`${isMobile ? "px-6" : "px-12"} card3 py-1`}
                  style={{ height: "fit-content" }}
                >
                  <h2
                    className="font-bold text-xl mt-4 text-neutral-800"
                    style={{ textAlign: "left" }}
                  >
                    Change Password
                  </h2>
                  <form
                    className="my-8"
                    autoComplete="off"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!validatePassword(password)) {
                        showerrorToastMessage(
                          "Password must be at least 8 characters long, include at least 1 uppercase letter, 1 number, 1 special character."
                        );
                        return;
                      }

                      if (password === confirmPassword) {
                        handleChangePassword(oldpassword, password);
                      } else {
                        showerrorToastMessage("New passwords do not match.");
                      }
                    }}
                  >
                    <div
                      className={`${
                        isMobile ? "" : ""
                      } grid grid-cols-1 mb-1 md:grid-cols-1 lg:grid-cols-1`}
                    >
                      <LabelInputContainer className="mb-4">
                        <Label htmlFor="oldPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="oldPassword"
                            placeholder="••••••••"
                            type={showOldPassword ? "text" : "password"}
                            autoComplete="current-password"
                            onChange={(e) => setOldPassword(e.target.value)}
                            value={oldpassword}
                          />
                          <button
                            type="button"
                            onClick={toggleOldPasswordVisibility}
                            className="absolute inset-y-0 right-1 flex items-center px-3"
                          >
                            {showOldPassword ? (
                              <Eye className="text-black w-5 h-5" />
                            ) : (
                              <EyeOff className="text-black w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </LabelInputContainer>

                      <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="off"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-1 flex items-center px-3"
                          >
                            {showPassword ? (
                              <Eye className="text-black w-5 h-5" />
                            ) : (
                              <EyeOff className="text-black w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </LabelInputContainer>
                      <LabelInputContainer className="mb-4">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="current-password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute inset-y-0 right-1 flex items-center px-3"
                          >
                            {showConfirmPassword ? (
                              <Eye className="text-black w-5 h-5" />
                            ) : (
                              <EyeOff className="text-black w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </LabelInputContainer>
                    </div>
                    <div
                      className={`${
                        isMobile ? "gap-2 items-center justify-center" : "gap-3"
                      } flex`}
                    >
                      <button
                        className={`${
                          isMobile ? "w-full" : "w-24"
                        } hover:bg-gray-300 bg-gray-200 relative group/btn block rounded-md h-10 font-medium shadow-md`}
                        type="button"
                        onClick={handlePasswordReset}
                      >
                        Cancel
                      </button>
                      <button
                        className={`${
                          isMobile ? "w-full" : "w-48"
                        } hover:bg-indigo-800 bg-indigo-700 relative group/btn block text-white rounded-md h-10 font-medium shadow-md`}
                        type="submit"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
                <div className="flex flex-column">
                  <div
                    className={`${
                      isMobile ? "px-6 mt-4 mb-1" : "px-12 mb-8"
                    } card3 py-1`}
                    style={{ height: "fit-content" }}
                  >
                    <h2
                      className="font-bold text-xl mt-4 text-neutral-800"
                      style={{ textAlign: "left" }}
                    >
                      Account Information
                    </h2>
                    <p className="mt-2">
                      <strong>Last Login:</strong>
                    </p>
                    <p>
                      {lastLoginTime}
                    </p>
                    <p className="mt-2">
                      <strong>Member since:</strong>
                    </p>
                    <p className="mb-4">
                      {new Intl.DateTimeFormat("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(creationTime))}
                    </p>
                  </div>

                  <div
                    className={`${
                      isMobile ? "px-6 mt-4" : "px-12"
                    } card3 py-1 mb-8`}
                    style={{ height: "fit-content" }}
                  >
                    <h2
                      className="font-bold text-xl mt-4 text-neutral-800"
                      style={{ textAlign: "left" }}
                    >
                      Delete Account
                    </h2>
                    <p className="text-pretty mt-2">
                      To permanently erase your whole InterviewAI account, click
                      the button below.
                    </p>
                    <div className="mt-3">
                      <button
                        className={`${
                          isMobile ? "w-full" : "w-40"
                        } hover:bg-red-700 mb-4 bg-red-600 relative group/btn block text-white rounded-md h-10 font-medium shadow-md`}
                        type="submit"
                        onClick={() => setShowModal(true)}
                      >
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Your profile is on its way, just a moment..</p>
          )}
        </div>
      </div>
      {isMobile && <MobileNavbar onLogout={handleLogout} />}
      <ToastContainer />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="bg-white rounded-md">
          <form
            className="my-4"
            autoComplete="off"
            onSubmit={handleDeactivateAccount}
          >
            <div className="flex flex-col items-center justify-center">
              <i
                className="text-red-500 mb-2 fa fa-circle-exclamation"
                aria-hidden="true"
                style={{ fontSize: "2rem" }}
              ></i>
              <h4
                className={cn(
                  isMobile ? "w-64 text-center bg-gray-100" : "bg-gray-200",
                  "rounded-md p-2"
                )}
              >
                This step is permanent and cannot be reversed.
              </h4>
              <div className="flex gap-2 mt-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    className="w-4 h-4"
                    type="checkbox"
                    name=""
                    id=""
                    required
                  />
                  <p className="ml-2 text-md font-medium text-black leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I confirm my account deactivation
                  </p>
                </label>
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={cn(
                    isMobile ? "w-50" : "w-20",
                    "hover:bg-gray-300 bg-gray-200 rounded-md shadow-md"
                  )}
                  type="reset"
                >
                  Cancel
                </button>
                <button
                  className={cn(
                    isMobile ? "w-60" : "w-40",
                    "hover:bg-red-700 bg-red-600 relative group/btn block text-white rounded-md h-10 font-medium shadow-md"
                  )}
                  type="submit"
                >
                  Deactivate Account
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
