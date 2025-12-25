'use client';

import { useState, useEffect } from 'react';

interface RotatingWordsProps {
  firstWord: string;
  rotatingWords: string[];
  className?: string;
}

// Word Rotate Component with exciting animations
const WordRotate = ({ words, className }: { words: string[]; className?: string }) => {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setAnimationDirection(prev => prev * -1); // Alternate direction
      
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsAnimating(false);
      }, 400); // Slightly longer for more dramatic effect
    }, 2500);

    return () => clearInterval(interval);
  }, [words]);

  // Find the longest word to set fixed width
  const longestWord = words.reduce((a, b) => a.length > b.length ? a : b, '');

  return (
    <div className="py-2 relative inline-block" style={{ width: `${longestWord.length * 0.8}ch` }}>
      {/* Invisible placeholder to maintain space - always visible */}
      <div className="invisible whitespace-nowrap">
        {longestWord}
      </div>
      {/* Animated word - positioned absolutely */}
      <div 
        className={`transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] transform absolute left-0 top-2 whitespace-nowrap ${
          isAnimating 
            ? 'opacity-0' 
            : 'opacity-100'
        } ${className}`}
        style={{
          transform: isAnimating 
            ? `translateY(${animationDirection * 100}%) scale(0.75) rotate(${animationDirection * 12}deg)` 
            : 'translateY(0) scale(1) rotate(0deg)'
        }}
      >
        {words[index]}
      </div>
    </div>
  );
};

export function RotatingWords({ firstWord, rotatingWords, className }: RotatingWordsProps) {
  return (
    <div className={`flex justify-center ${className || ''}`}>
      <div className="font-black flex flex-col md:flex-row items-center text-5xl md:text-6xl lg:text-7xl font-bold gap-2 drop-shadow-2xl">
        <span className="text-white text-right whitespace-nowrap mr-2">
          {firstWord}
        </span>
        <WordRotate
          words={rotatingWords}
          className="text-yellow-400 text-left"
        />
      </div>
    </div>
  );
}

