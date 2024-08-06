"use client";
import React from "react";
import "../index.css"; // Ensure Tailwind CSS is imported
import { BackgroundBeams } from "../Components/ui/background-beams";
import { SigninFormDemo } from "./SigninFormDemo";

export function BackgroundBeamsDemoSignin() {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center antialiased">
      {/* Background */}
      <BackgroundBeams className="absolute inset-0 z-0" />

      {/* Signup Card */}
      <div className="relative z-10 w-full mx-auto p-4">
        <SigninFormDemo />
      </div>
    </div>
  );
}
