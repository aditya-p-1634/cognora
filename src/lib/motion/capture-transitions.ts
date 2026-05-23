import { design } from "@/config/design";

/** Slower dissolve — memory stabilization, not UI transition. */
const dissolve = {
  duration: design.motion.linger + 0.14,
  ease: design.motion.calm,
};

const emerge = {
  duration: design.motion.linger,
  ease: design.motion.calm,
};

export const captureOverlayMotion = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: { ...dissolve, delay: 0.08 },
    },
    transition: dissolve,
  },
  shell: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: dissolve },
    transition: dissolve,
  },
  focus: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: emerge,
    },
    exit: {
      opacity: 0,
      transition: {
        duration: design.motion.linger,
        ease: design.motion.calm,
      },
    },
  },
  header: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.1, duration: dissolve.duration, ease: design.motion.calm },
    },
  },
  thinking: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.16, duration: dissolve.duration, ease: design.motion.calm },
    },
  },
  whisper: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.06, duration: design.motion.normal, ease: design.motion.calm },
    },
    exit: {
      opacity: 0,
      transition: { duration: design.motion.normal, ease: design.motion.calm },
    },
  },
  actions: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.22, duration: design.motion.normal, ease: design.motion.calm },
    },
  },
} as const;

export const captureThreadEmergence = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: design.motion.linger,
    ease: design.motion.calm,
  },
};
