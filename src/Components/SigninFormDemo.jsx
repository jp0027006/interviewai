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

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../src/config/firebase";

export function SigninFormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (emailError || passwordError) {
      return; // Prevent submission if there are errors
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { state: { email } });
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
      theme: "dark",
    });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      showToastMessage();
      clearFormFields();
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!validateEmail(newEmail)) {
      setEmailError("Enter a valid email");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (password) => {
    const isStrong = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isStrong) {
      setPasswordError(
        "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol"
      );
    } else {
      setPasswordError("");
    }
    return isStrong;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  return (
    <div className="relative max-w-md w-full mx-auto p-px bg-gradient-to-r from-[#03a9f4] to-[#f441a5] rounded-2xl">
      <div className="relative bg-black p-4 rounded-2xl">
        <h2 className="font-bold text-xl text-white text-neutral-200 text-center">
          Log in
        </h2>
        <p className="text-md mt-2 -mb-2 bg-gradient-to-r font-black from-[#03a9f4] to-[#f441a5] bg-clip-text text-transparent text-center">
          Welcome back! Ready to tackle some practice?
        </p>
        <form className="my-8" onSubmit={handleLogin} autoComplete="off">
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              className={cn(
                "bg-zinc-800 text-white border",
                emailError
                  ? "border-red-500 focus-visible:ring-[0px]"
                  : "border-gray-500"
              )}
              autoComplete="off"
              onChange={handleEmailChange}
              value={email}
            />
            {emailError && <p className="text-red-500">{emailError}</p>}
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              className={cn(
                "bg-zinc-800 text-white border",
                passwordError
                  ? "border-red-500 focus-visible:ring-[0px]"
                  : "border-gray-500"
              )}
              autoComplete="current-password"
              onChange={handlePasswordChange}
              value={password}
            />
            {passwordError && <p className="text-red-500">{passwordError}</p>}
          </LabelInputContainer>

          <button
            className="mt-7 border-gray-200 bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 to-neutral-800 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            Login
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></span>
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></span>
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="flex flex-col space-y-4">
            <button
              className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 bg-zinc-900 shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              type="button"
              onClick={handleGoogleLogin}
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-300" />
              <span className="text-neutral-300 text-sm">
                Log in with Google
              </span>
              <BottomGradient />
            </button>
          </div>
          <p className="text-md -mb-5 mt-5 text-neutral-300 text-center">
            New here?{" "}
            <Link className="underline font-bold" to="/signup">
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
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
