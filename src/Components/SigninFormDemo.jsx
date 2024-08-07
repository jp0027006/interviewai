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
      Cookies.set("email", email, { expires: 1 });
      Cookies.set("authToken", await user.getIdToken());
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
      theme: "dark",
    });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
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

      Cookies.set("authToken", await user.getIdToken());
      Cookies.set("email", email, { expires: 1 });
      navigate("/dashboard", { state: { email, firstName, lastName } });
    } catch (error) {
      showToastMessage();
      clearFormFields();
    }
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
              className={cn("bg-zinc-800 text-white border border-gray-500")}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <p className="text-md text-neutral-300 mb-0 mr-1">
                Forget your password?{" "}
                <Link className="text-white font-bold" to="/forgotpassword">
                  Reset here
                </Link>
              </p>
            </div>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                className={cn("bg-zinc-800 text-white border border-gray-500")}
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
