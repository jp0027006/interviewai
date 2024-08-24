import { cn } from "../../../lib/utils";
import React from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);

  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-500 rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: 0, // Random vertical position for better coverage
            left: Math.floor(Math.random() * 100) + "%", // Random horizontal position for better coverage
            animationDelay: `${Math.random() * 2}s`, // Animation delay between 0 and 2 seconds
            animationDuration: `${Math.random() * 6 + 4}s`, // Animation duration between 4 and 10 seconds
            animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", // Smooth cubic-bezier easing function
          }}
          
        ></span>
      ))}
    </>
  );
};
