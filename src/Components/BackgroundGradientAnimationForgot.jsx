import React from "react";
import { BackgroundGradientAnimation } from "../Components/ui/background-gradient-animation";
import { ForgotPassword } from "./ForgotPassword";

export function BackgroundGradientAnimationForgot() {
  return (
    <BackgroundGradientAnimation>
      <div className="absolute w-full h-screen flex items-center justify-center">
        <div className="relative z-10 w-full max-w-lg p-4">
          <ForgotPassword />
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
}
