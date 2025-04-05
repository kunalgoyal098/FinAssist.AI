"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

export function FadeIn({
  children,
  className = "",
  direction = "up", // up, down, left, right
  duration = "1000ms",
  delay = "0ms",
}) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const baseStyles = "opacity-0 transition-all duration-1000";
  const directionStyles = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
  };

  const activeStyles = "opacity-100 translate-y-0 translate-x-0";

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        directionStyles[direction],
        inView && activeStyles,
        className
      )}
      style={{
        transitionDuration: duration,
        transitionDelay: delay,
      }}
    >
      {children}
    </div>
  );
} 