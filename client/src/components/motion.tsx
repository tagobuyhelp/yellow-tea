import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function PageTransition({
  routeKey,
  children,
  className,
}: {
  routeKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, delay, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

