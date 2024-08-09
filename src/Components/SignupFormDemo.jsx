"use client";
import React, { useState } from "react";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { cn } from "../../lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie"; // Import js-cookie

// Import Firebase methods
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
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validator.isEmail(email)) {
      showToastMessage("Invalid email address.");
      return;
    }

    if (password !== confirmPassword) {
      showToastMessage("Passwords do not match.");
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
      navigate("/dashboard", { state: { email, firstName, lastName } });
    } catch (error) {
      showToastMessage("Sign up failed. Please try again.");
    }
  };

  const showToastMessage = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
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
      showToastMessage("Google signup failed. Please try again.");
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto p-px bg-gradient-to-r from-[#03a9f4] to-[#f441a5] rounded-2xl h-fit mt-5">
      <div className="relative bg-black p-4 rounded-2xl">
        <img src={logo} alt="logo" className="w-56 mx-auto mb-4" />
        <h2 className="font-bold text-xl text-white text-neutral-200 text-center">
          Sign up
        </h2>
        <p className="text-md mt-2 -mb-2 bg-gradient-to-r font-black from-[#03a9f4] to-[#f441a5] bg-clip-text text-transparent text-center">
          Ready to get started? Join us now!
        </p>
        <form className="my-8" onSubmit={handleSubmit} autoComplete="off">
          <div className="grid grid-cols-1 gap-4 mb-1 md:grid-cols-2">
            <LabelInputContainer className="mb-4">
              <Label htmlFor="firstName" className="text-white">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="First Name"
                type="text"
                className={cn("bg-zinc-800 text-white")}
                autoComplete="off"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="lastName" className="text-white">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                type="text"
                className={cn("bg-zinc-800 text-white")}
                autoComplete="off"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
              />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              className={cn("bg-zinc-800 text-white")}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                className={cn("bg-zinc-800 text-white")}
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
                  <Eye className="text-white w-5 h-5" />
                ) : (
                  <EyeOff className="text-white w-5 h-5" />
                )}
              </button>
            </div>
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              className={cn("bg-zinc-800 text-white")}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </LabelInputContainer>

          <button
            className="mt-7 btn2 border-gray-200 bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 to-neutral-800 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            Sign Up
            <span class="gradient-span-1"></span>
            <span class="gradient-span-2"></span>
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="flex flex-col space-y-4">
            <button
              className="relative btn2 group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 bg-zinc-900 shadow-[0px_0px_1px_1px_var(--neutral-800)]"
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
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span className="text-neutral-300 text-sm">
                Continue with Google
              </span>
              <span class="gradient-span-1"></span>
              <span class="gradient-span-2"></span>
            </button>
          </div>
          <p className="text-md -mb-5 mt-3 text-neutral-300 text-center">
            Already have an account?{" "}
            <Link className="underline font-bold text-white" to="/">
              Log in
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
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
