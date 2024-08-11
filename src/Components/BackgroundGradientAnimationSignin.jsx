import React from "react";
import { BackgroundGradientAnimation } from "../Components/ui/background-gradient-animation";
import { SigninFormDemo } from "./SigninFormDemo";

export function BackgroundGradientAnimationSignin() {
  return (
    <BackgroundGradientAnimation>
      <div className="absolute w-full h-screen flex items-center justify-center">
        <div className="relative z-10 w-full max-w-lg p-4">
          <SigninFormDemo />
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
}
