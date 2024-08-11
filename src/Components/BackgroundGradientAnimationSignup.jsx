import React from "react";
import { BackgroundGradientAnimation } from "../Components/ui/background-gradient-animation2";
import { SignupFormDemo } from "./SignupFormDemo";

export function BackgroundGradientAnimationSignup() {
  return (
    <BackgroundGradientAnimation>
      <div className="absolute w-full flex items-center justify-center">
        <div className="relative z-10 w-full max-w-lg p-4">
          <SignupFormDemo />
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
}
