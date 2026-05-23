import { design } from "@/config/design";

/** Panel body — enter overlaps exit for continuity-preserving dissolve. */
export const contextPanelContent = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: design.motion.normal + 0.06,
      ease: design.motion.enter,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: design.motion.linger,
      ease: design.motion.calm,
    },
  },
} as const;

export const contextSectionReveal = (delay: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.14 + delay,
      duration: design.motion.normal,
      ease: design.motion.enter,
    },
  },
});

export const contextItemReveal = (index: number, baseDelay = 0) => ({
  initial: { opacity: 0, x: 5 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.16 + baseDelay + index * 0.045,
      duration: design.motion.fast + 0.04,
      ease: design.motion.enter,
    },
  },
});

export const contextHeaderTransition = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06,
      duration: design.motion.normal,
      ease: design.motion.enter,
    },
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: {
      duration: design.motion.linger * 0.85,
      ease: design.motion.calm,
    },
  },
} as const;

export const contextAwakeningDurationMs =
  design.motion.linger * 1000 + design.motion.normal * 1000;
