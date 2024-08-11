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
import logo from "../../src/assets/InterviewAI_png2.png";

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
      theme: "light",
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
      theme: "light",
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
    <div className="relative max-w-xl w-full mx-auto p-px rounded-2xl">
      <div
        className="relative bg-white p-4 rounded-2xl"
        style={{
          WebkitBoxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)", // For Safari
          MozBoxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)",    // For Firefox
          boxShadow: "0px 0px 221px -75px rgba(0,0,0,0.89)"         // Standard
        }}
      >
        <img src={logo} alt="logo" className="w-56 mx-auto mb-2" />
        <h2 className="font-bold text-xl text-neutral-800 text-center">
          Forgot your password?
        </h2>
        <h6 className="mt-2 -mb-2 text-indigo-700 text-center">
          Don't worry, it happens.
        </h6>
        <form className="my-8" onSubmit={handleSubmit} autoComplete="off">
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </LabelInputContainer>
          <button
            className="mt-7 hover:bg-indigo-800 bg-indigo-700 relative group/btn block w-full text-white rounded-md h-10 font-medium shadow-md"
            type="submit"
          >
            Send Reset Email
            <span class="gradient-span-1"></span>
            <span class="gradient-span-2"></span>
          </button>
          <p className="text-md -mb-5 mt-3 text-center">
            <Link className="font-bold text-indigo-700 no-underline" to="/">
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
