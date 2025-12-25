'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProgressBarProps {
  isLoading: boolean;
}

export function NavigationProgressBar({ isLoading }: NavigationProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // Reset progress when loading stops
      setProgress(0);
      return;
    }

    // Start progress animation
    setProgress(0);
    
    // Simulate realistic progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return 90; // Stop at 90% until page actually loads
        }
        // Increment with decreasing speed for more realistic feel
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 90);
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  // Complete progress when loading finishes
  useEffect(() => {
    if (!isLoading && progress > 0) {
      // Complete to 100% when loading stops
      setProgress(100);
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-1.5"
        >
          <div className="h-full bg-background/50">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

