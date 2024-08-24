"use client";
import React, { useState } from "react";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { cn } from "../../lib/utils";
import { Link, useNavigate } from "react-router-dom";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../../src/config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "react-feather";
import logo from "../../src/assets/InterviewAI_png2.png";

export function SignupFormDemo() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 750);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const customEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!customEmailRegex.test(email)) {
      showerrorToastMessage("Invalid email address format.");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
      showerrorToastMessage("Password must be at least 8 characters long, include at least 1 uppercase letter, 1 number, and 1 special character.");
      return;
    }
    
    if (password !== confirmPassword) {
      showerrorToastMessage("Passwords do not match.");
      return;
    }
    if (!firstName || !lastName) {
      showerrorToastMessage("First name and last name cannot be empty.");
      return;
    }
    if (!/^[a-zA-Z]+$/.test(firstName)) {
      showerrorToastMessage("First name must contain only alphabets.");
      return;
    }

    if (!/^[a-zA-Z]+$/.test(lastName)) {
      showerrorToastMessage("Last name must contain only alphabets.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      await setDoc(doc(db, "users", email), { firstName, lastName, email });

      Cookies.set("authToken", await user.getIdToken(), { expires: 365 });
      Cookies.set("email", email, { expires: 365 });
      showsuccessToastMessage();
      setTimeout(() => {
        navigate("/dashboard", { state: { email, firstName, lastName } });
      }, 6000);
    } catch (error) {
      showerrorToastMessage("Sign up failed. Please try again.");
    }
  };

  const showsuccessToastMessage = () => {
    toast.success("Sign up successfully.", {
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

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const displayName = user.displayName;
      const email = user.email;

      const [firstName, lastName] = displayName.split(" ");

      await setDoc(doc(db, "users", email), { firstName, lastName, email });

      Cookies.set("authToken", await user.getIdToken(), { expires: 365 });
      Cookies.set("email", email, { expires: 365 });
      navigate("/dashboard", { state: { email, firstName, lastName } });
    } catch (error) {
      showerrorToastMessage("Google signup failed. Please try again.");
    }
  };

  return (
    <div
      className="relative max-w-md w-full mx-auto p-px rounded-2xl mt-5"
      style={{
        WebkitBoxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)", // For Safari
        MozBoxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)", // For Firefox
        boxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)", // Standard
      }}
    >
      <div className="relative bg-white p-4 rounded-2xl">
        <img src={logo} alt="logo" className="w-56 mx-auto mb-1" />
        <h2 className="font-bold text-xl text-neutral-800 text-center">
          Sign up
        </h2>
        <h6 className="mt-2 -mb-2 text-indigo-700 text-center">
          Ready to get started? Join us now!
        </h6>
        <form className="my-8" onSubmit={handleSubmit} autoComplete="off">
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
                onChange={(e) => setFirstName(e.target.value)}
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
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
              />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="text"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
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
          <LabelInputContainer className="mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </LabelInputContainer>

          <button
            className="mt-7 hover:bg-indigo-800 bg-indigo-700 relative group/btn block w-full text-white rounded-md h-10 font-medium shadow-md"
            type="submit"
          >
            Sign Up
            <span class="gradient-span-1"></span>
            <span class="gradient-span-2"></span>
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="flex flex-col space-y-4">
            <button
              className="relative hover:bg-indigo-800 bg-indigo-700 group/btn flex space-x-2 items-center justify-center px-4 w-full rounded-md h-10 font-medium shadow-md"
              type="button"
              onClick={handleGoogleSignup}
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
              <span className="text-white text-sm">Continue with Google</span>
              <span class="gradient-span-1"></span>
              <span class="gradient-span-2"></span>
            </button>
          </div>
          <p className="text-md -mb-5 mt-3 text-black text-center">
            Already have an account?{" "}
            <Link className="no-underline font-bold text-indigo-700" to="/">
              Log in
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
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
