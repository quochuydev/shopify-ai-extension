"use client";

import { useState, useEffect, useCallback } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  "data-cy"?: string;
}

export function Typewriter({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = "",
  "data-cy": dataCy 
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startTyping = useCallback(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        startTyping();
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      startTyping();
    }
  }, [delay, startTyping]);

  useEffect(() => {
    if (currentIndex > 0 && currentIndex <= text.length) {
      startTyping();
    }
  }, [currentIndex, startTyping, text.length]);

  return (
    <span className={className} data-cy={dataCy}>
      {displayText}
      {!isComplete && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}