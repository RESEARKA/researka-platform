import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

interface AnimatedPageProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -8,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // Only enable animations after component has mounted on the client
  // This prevents hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // If not mounted yet, render children without animation to avoid hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedPage;
