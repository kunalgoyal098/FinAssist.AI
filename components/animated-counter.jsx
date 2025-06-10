"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

export function AnimatedCounter({ value, duration = 2000, className = "" }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    if (!inView) return;

    // Extract numeric value and format
    let numericValue = 0;
    let prefix = "";
    let suffix = "";

    if (typeof value === "string") {
      // Handle currency
      if (value.includes("$")) {
        prefix = "$";
        numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      }
      // Handle percentage
      else if (value.includes("%")) {
        suffix = "%";
        numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      }
      // Handle K/M/B suffix
      else if (value.includes("K")) {
        suffix = "K+";
        numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      }
      else if (value.includes("M")) {
        suffix = "M+";
        numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      }
      else if (value.includes("B")) {
        suffix = "B+";
        numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      }
      // Handle rating format (e.g., 4.9/5)
      else if (value.includes("/")) {
        suffix = "/5";
        numericValue = parseFloat(value.split("/")[0]);
      }
      else {
        numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
      }
    } else {
      numericValue = value;
    }

    const increment = numericValue / (duration / 16);
    let start = 0;

    const counter = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(counter);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value, duration, inView]);

  // Format the output
  const formatCount = () => {
    if (typeof value === "string") {
      if (value.includes("/")) {
        return `${count.toFixed(1)}/5`;
      }
      if (value.includes("%")) {
        return `${count.toFixed(1)}%`;
      }
      if (value.includes("$")) {
        return `$${Math.floor(count)}B+`;
      }
      if (value.includes("K")) {
        return `${Math.floor(count)}K+`;
      }
    }
    return Math.floor(count);
  };

  return (
    <div ref={ref} className={className}>
      {formatCount()}
    </div>
  );
} 