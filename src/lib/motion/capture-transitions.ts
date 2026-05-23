import { design } from "@/config/design";

const dissolve = {
  duration: design.motion.linger,
  ease: design.motion.calm,
};

const emerge = {
  duration: design.motion.spatial,
  ease: design.motion.enter,
};

/** Staggered dissolve — content fades before fog fully lifts. */
export const captureOverlayMotion = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: { ...dissolve, delay: 0.05 },
    },
    transition: dissolve,
  },
  shell: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: dissolve },
    transition: { duration: design.motion.spatial, ease: design.motion.calm },
  },
  focus: {
    initial: { opacity: 0, y: 6 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        ...emerge,
        opacity: { duration: design.motion.linger, ease: design.motion.calm },
      },
    },
    exit: {
      opacity: 0,
      y: 3,
      transition: {
        duration: design.motion.normal,
        ease: design.motion.calm,
      },
    },
  },
  header: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.06, duration: design.motion.normal, ease: design.motion.calm },
    },
  },
  thinking: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.12, duration: design.motion.linger, ease: design.motion.calm },
    },
  },
  whisper: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.08, duration: design.motion.normal, ease: design.motion.calm },
    },
    exit: { opacity: 0, transition: { duration: design.motion.fast, ease: design.motion.calm } },
  },
  actions: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.18, duration: design.motion.normal, ease: design.motion.calm },
    },
  },
} as const;

export const captureThreadEmergence = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: design.motion.linger,
    ease: design.motion.calm,
  },
};
