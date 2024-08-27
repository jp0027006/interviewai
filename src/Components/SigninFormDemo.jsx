"use client";
import React, { useState, useEffect } from "react";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { cn } from "../../lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import { auth, db } from "../../src/config/firebase";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "react-feather";
import logo from "../../src/assets/InterviewAI_png2.png";
import "../../src/index.css";

export function SigninFormDemo() {
  const [customToken, setCustomToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (authToken) {
      // Attempt to sign in with the custom token
      signInWithCustomToken(auth, authToken).then(() => {
        navigate("/dashboard");
      });
    } else {
      // Check if the user is already authenticated
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          navigate("/", {
            state: {
              email: user.email,
              firstName: user.displayName?.split(" ")[0],
              lastName: user.displayName?.split(" ")[1],
            },
          });
        }
      });

      return () => unsubscribe(); // Clean up the subscription
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      Cookies.set("email", email, { expires: 365 });
      Cookies.set("authToken", await user.getIdToken(), { expires: 365 }); // Correct the expiration setting
      navigate("/dashboard");
    } catch (error) {
      showToastMessage();
      clearFormFields();
    }
  };

  const clearFormFields = () => {
    setEmail("");
    setPassword("");
  };

  const showToastMessage = () => {
    toast.error("Log in failed. Please check your credentials and try again.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const displayName = user.displayName;
      const email = user.email;

      // Split the displayName into first name and last name
      const [firstName, lastName] = displayName.split(" ");

      // Check if the user already exists in Firestore
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // User does not exist, create a new document
        await setDoc(userDocRef, { firstName, lastName, email });
      }

      Cookies.set("authToken", await user.getIdToken(), { expires: 365 });
      Cookies.set("email", email, { expires: 365 });
      navigate("/dashboard", { state: { email, firstName, lastName } });
    } catch (error) {
      showToastMessage();
      clearFormFields();
    }
  };

  return (
    <div className="relative max-w-lg w-full mx-auto p-px rounded-2xl">
      <div
        className="relative bg-white p-4 rounded-2xl"
        style={{
          WebkitBoxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)", // For Safari
          MozBoxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)", // For Firefox
          boxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)", // Standard
        }}
      >
        <img src={logo} alt="logo" className="w-56 mx-auto mb-2" />
        {/* <h2 className="font-bold text-xl text-neutral-800 text-center">
          Log in
        </h2> */}
        <h6 className="mt-2 -mb-2 text-pretty text-indigo-700 text-center">
          Welcome back! Ready to tackle some practice?
        </h6>
        <form className="my-8" onSubmit={handleLogin} autoComplete="off">
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
          <p className="text-md font-normal text-black mb-0 mr-1">
            Forget your password?{" "}
            <Link className="no-underline text-indigo-700 font-bold" to="/forgotpassword">
              Reset here
            </Link>
          </p>
          <button
            className="relative shadow-md mt-7 hover:bg-indigo-800 bg-indigo-700 group/btn block w-full text-white rounded-md h-10 font-medium"
            type="submit"
          >
            Login
            <span class="gradient-span-1"></span>
            <span class="gradient-span-2"></span>
          </button>
          <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="flex flex-col space-y-4">
            <button
              className="relative hover:bg-indigo-800 bg-indigo-700 group/btn shadow-md flex space-x-2 items-center justify-center px-4 w-full rounded-md h-10 font-medium"
              type="button"
              onClick={handleGoogleLogin}
            >
              <svg
                style={{ height: "20px" }}
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#fff"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#fff"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#fff"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                ></path>
                <path
                  fill="#fff"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span className="text-white text-sm">
                Continue with Google
              </span>
              <span class="gradient-span-1"></span>
              <span class="gradient-span-2"></span>
            </button>
          </div>
          <p className="text-md -mb-5 mt-3 text-black font-normal text-center">
            New here?{" "}
            <Link className="no-underline font-bold text-indigo-700" to="/signup">
              Sign up
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>{children}</div>
  );
};
