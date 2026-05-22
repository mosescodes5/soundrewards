// useBreakpoints.js
import { useState, useEffect } from "react";

export function useBreakpoints() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return { isMobile: w < 640, isTablet: w < 1024, w };
}