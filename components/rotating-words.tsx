'use client';

import { useState, useEffect, useRef } from 'react';

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
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTransform = () => {
      if (!wordRef.current) return;
      
      const isMobile = window.innerWidth < 768;
      const baseTransform = isAnimating 
        ? `translateY(${animationDirection * 100}%) scale(0.75) rotate(${animationDirection * 12}deg)` 
        : 'translateY(0) scale(1) rotate(0deg)';
      
      if (isMobile) {
        wordRef.current.style.transform = `translateX(-50%) ${baseTransform}`;
        wordRef.current.style.left = '50%';
      } else {
        wordRef.current.style.transform = baseTransform;
        wordRef.current.style.left = '0';
      }
    };

    updateTransform();
    window.addEventListener('resize', updateTransform);
    return () => window.removeEventListener('resize', updateTransform);
  }, [isAnimating, animationDirection]);

  return (
    <div className="py-2 relative block md:inline-block mx-auto md:mx-0" style={{ width: `${longestWord.length * 0.8}ch` }}>
      {/* Invisible placeholder to maintain space - always visible */}
      <div className="invisible whitespace-nowrap text-center md:text-left">
        {longestWord}
      </div>
      {/* Animated word - positioned absolutely */}
      <div 
        ref={wordRef}
        className={`transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] absolute top-2 whitespace-nowrap ${
          isAnimating 
            ? 'opacity-0' 
            : 'opacity-100'
        } ${className}`}
      >
        {words[index]}
      </div>
    </div>
  );
};

export function RotatingWords({ firstWord, rotatingWords, className }: RotatingWordsProps) {
  return (
    <div className={`flex justify-center ${className || ''}`}>
      <div className="font-black flex flex-col md:flex-row items-center justify-center md:justify-start text-5xl md:text-6xl lg:text-7xl font-bold gap-2 drop-shadow-2xl">
        <span className="text-white text-center md:text-right whitespace-nowrap md:mr-2">
          {firstWord}
        </span>
        <WordRotate
          words={rotatingWords}
          className="text-yellow-400 text-center md:text-left"
        />
      </div>
    </div>
  );
}

