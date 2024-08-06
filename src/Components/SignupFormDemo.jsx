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
} from "firebase/auth";
import { auth, db, collection, doc, setDoc } from "../../src/config/firebase"; // Import Firestore methods

export function SignupFormDemo() {
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [firstnameError, setFirstNameError] = useState("");
  const [lastnameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
        "Password must be 8+ chars with letters, numbers, and symbols"
      );
    } else {
      setPasswordError("");
    }

    return isStrong;
  };

  const validateName = (name) => /^[A-Za-z]+$/.test(name);

  const handleFirstNameChange = (e) => {
    const newFirstName = e.target.value;
    setFirstName(newFirstName);
    if (!newFirstName) {
      setFirstNameError("First name cannot be empty");
    } else if (!validateName(newFirstName)) {
      setFirstNameError("Invalid first name");
    } else {
      setFirstNameError("");
    }
  };

  const handleLastNameChange = (e) => {
    const newLastName = e.target.value;
    setLastName(newLastName);
    if (!newLastName) {
      setLastNameError("Last name cannot be empty");
    } else if (!validateName(newLastName)) {
      setLastNameError("Invalid last name");
    } else {
      setLastNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!validateEmail(newEmail)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password !== newConfirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    let hasError = false;

    // Validate first name
    if (!firstname) {
      setFirstNameError("First name can't be empty");
      hasError = true;
    } else if (!validateName(firstname)) {
      setFirstNameError("Invalid first name");
      hasError = true;
    } else {
      setFirstNameError("");
    }

    // Validate last name
    if (!lastname) {
      setLastNameError("Last name cannot be empty");
      hasError = true;
    } else if (!validateName(lastname)) {
      setLastNameError("Invalid last name");
      hasError = true;
    } else {
      setLastNameError("");
    }

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    // Validate password
    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be 8+ chars with letters, numbers, and symbols"
      );
      hasError = true;
    } else {
      setPasswordError("");
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    // Check if there were any errors
    if (hasError) {
      return; // Prevent sign-up if there are validation errors
    }

    // Store form values in cookies
    Cookies.set("firstname", firstname);
    Cookies.set("lastname", lastname);
    Cookies.set("email", email);

    // Proceed with sign-up if no errors
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstname,
        lastname,
        email
      });

      // Navigate to dashboard
      navigate("/dashboard"); // Adjust the path as needed
    } catch (error) {
      showToastMessage();
    }
  };

  const showToastMessage = () => {
    toast.error("Sign up failed", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      navigate("/dashboard"); // Adjust the path as needed
    } catch (error) {
      showToastMessage();
    }
  };

  return (
    <>
      <div className="relative max-w-md w-full mx-auto p-px bg-gradient-to-r from-[#03a9f4] to-[#f441a5] rounded-2xl">
        <div className="relative bg-black p-4 rounded-2xl">
          <h2 className="font-bold text-xl text-white text-neutral-200 text-center">
            Sign up
          </h2>
          <p className="text-md mt-2 -mb-2 bg-gradient-to-r font-black from-[#03a9f4] to-[#f441a5] bg-clip-text text-transparent text-center">
            Conquer your next interview with confidence
          </p>
          <form className="my-8" onSubmit={handleSignUp} autoComplete="off">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer>
                <Label htmlFor="firstname" className="text-white">
                  First Name
                </Label>
                <Input
                  id="firstname"
                  placeholder="Enter your first name"
                  type="text"
                  className={cn(
                    "bg-zinc-800 text-white",
                    firstnameError ? "border-red-500" : "border-gray-500"
                  )}
                  autoComplete="text"
                  onChange={handleFirstNameChange}
                  value={firstname}
                />
                {firstnameError && (
                  <p className="text-red-500">{firstnameError}</p>
                )}
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname" className="text-white">
                  Last Name
                </Label>
                <Input
                  id="lastname"
                  placeholder="Enter your last name"
                  type="text"
                  className={cn(
                    "bg-zinc-800 text-white",
                    lastnameError ? "border-red-500" : "border-gray-500"
                  )}
                  autoComplete="text"
                  onChange={handleLastNameChange}
                  value={lastname}
                />
                {lastnameError && <p className="text-red-500">{lastnameError}</p>}
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
                className={cn(
                  "bg-zinc-800 text-white",
                  emailError ? "border-red-500" : "border-gray-500"
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
                  "bg-zinc-800 text-white",
                  passwordError ? "border-red-500" : "border-gray-500"
                )}
                autoComplete="off"
                onChange={handlePasswordChange}
                value={password}
              />
              {passwordError && <p className="text-red-500">{passwordError}</p>}
            </LabelInputContainer>
            <LabelInputContainer className="mb-8">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                className={cn(
                  "bg-zinc-800 text-white",
                  confirmPasswordError ? "border-red-500" : "border-gray-500"
                )}
                autoComplete="off"
                onChange={handleConfirmPasswordChange}
                value={confirmPassword}
              />
              {confirmPasswordError && (
                <p className="text-red-500">{confirmPasswordError}</p>
              )}
            </LabelInputContainer>

            <button
              className="border-gray-200 bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 to-neutral-800 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="submit"
            >
              Get started
              <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></span>
              <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></span>
            </button>

            <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

            <div className="flex flex-col space-y-4">
              <button
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 bg-zinc-900 shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                type="button"
                onClick={handleGoogleSignUp}
              >
                <IconBrandGoogle className="h-4 w-4 text-neutral-300" />
                <span className="text-neutral-300 text-sm">
                  Sign up with Google
                </span>
                <BottomGradient />
              </button>
            </div>
            <p className="text-md -mb-5 mt-5 text-neutral-300 text-center">
              Already have an account?{" "}
              <Link className="underline font-bold" to="/">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
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
