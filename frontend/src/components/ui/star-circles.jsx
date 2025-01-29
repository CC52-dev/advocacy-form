"use client"
import { cn } from "@/lib/utils";
import React from "react";

function StarCircles ({
  className = "",
  color = "black",
  speed = "6s",
  children,
  ...rest
}) {
  return (
    <div className={`relative inline-block py-[1px] overflow-hidden rounded-[20px] ${className}`} {...rest}>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-1 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px]">
        {children}
      </div>
      <div
        className="absolute inset-0 rounded-[20px] animate-border-beam"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${color} 60deg, transparent 120deg)`,
          animationDuration: speed,
        }}
      />
    </div>
  );
};

export default StarCircles;