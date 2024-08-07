"use client";
import React, { useState } from "react";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../src/config/firebase";
import { query, where, getDocs, collection } from "firebase/firestore";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const showsuccessToastMessage = () => {
    toast.success("Password reset email has been sent.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };
  const showerrorToastMessage = () => {
    toast.error("Error sending password reset email.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };
  const clearFormFields = () => {
    setEmail("");
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await sendPasswordResetEmail(auth, email);
        showsuccessToastMessage();
        setTimeout(() => {
          navigate("/");
        }, 6000);
      } else {
        showerrorToastMessage();
        clearFormFields();
      }
    } catch (error) {
      clearFormFields();
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto p-px bg-gradient-to-r from-[#03a9f4] to-[#f441a5] rounded-2xl">
      <div className="relative bg-black p-4 rounded-2xl">
        <h2 className="font-bold text-xl text-white text-neutral-200 text-center">
          Forgot your password?
        </h2>
        <p className="text-md mt-2 -mb-2 bg-gradient-to-r font-black from-[#03a9f4] to-[#f441a5] bg-clip-text text-transparent text-center">
          Don’t worry, it happens.
        </p>
        <form className="my-8" onSubmit={handleSubmit} autoComplete="off">
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              className="bg-zinc-800 text-white border border-gray-500"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </LabelInputContainer>
          <button
            className="mt-7 border-gray-200 bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 to-neutral-800 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            Send Reset Email
          </button>
          <p className="text-md -mb-5 mt-5 text-neutral-300 text-center">
            <Link className="font-bold" to="/">
              Go Back
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
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      {children}
    </div>
  );
};
