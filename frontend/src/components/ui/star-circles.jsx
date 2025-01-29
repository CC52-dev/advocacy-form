import { cn } from "@/lib/utils";
import React from "react";

export function StarCircles({
  className,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  color = "currentColor",
  speed = 1,
  ...props
}) {
  const calculatedDuration = duration / speed;
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
          role="presentation"
          aria-hidden="true"
        >
          <circle
            className="stroke-black/20 dark:stroke-white/10 stroke-1"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      <div
        style={{
          "--duration": calculatedDuration,
          "--radius": radius,
          "--angle": 0,
        }}
        className={cn(
          "absolute flex transform-gpu animate-orbit items-center justify-center rounded-full",
          { "[animation-direction:reverse]": reverse },
          className
        )}
        {...props}
      >
        <div className={`star-border-container ${className}`} {...props}>
          <div
            className="border-gradient-bottom animate-spin"
            style={{
              background: "radial-gradient(circle, rgba(0, 0, 0, 0.3) 0%, transparent 10%)",
              animationDuration: `${calculatedDuration}s`,
            }}
          />
          <div
            className="border-gradient-top animate-spin"
            style={{
              background: "radial-gradient(circle, rgba(0, 0, 0, 0.3) 0%, transparent 10%)",
              animationDuration: `${calculatedDuration}s`,
            }}
          />
          <div className="inner-content" />
        </div>
      </div>
    </>
  );
}