export const design = {
  layout: {
    sidebarExpanded: 256,
    sidebarCollapsed: 72,
    contextPanel: 384,
    topbar: 56,
  },
  motion: {
    calm: [0.22, 1, 0.36, 1] as const,
    enter: [0.16, 1, 0.3, 1] as const,
    fast: 0.14,
    normal: 0.26,
    spatial: 0.36,
    /** Lingering fade for context dissolution — overlaps with next enter. */
    linger: 0.42,
  },
  zIndex: {
    captureOverlay: 60,
    sidebarMobile: 50,
    contextMobile: 45,
    backdrop: 40,
    topbar: 30,
  },
} as const;
