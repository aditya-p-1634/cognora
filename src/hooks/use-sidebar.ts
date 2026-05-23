"use client";

import { useCallback, useEffect, useState } from "react";
import { breakpoints, useMediaQuery } from "./use-media-query";

export function useSidebar() {
  const isDesktop = useMediaQuery(breakpoints.lg);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isDesktop) {
      setCollapsed(true);
      setMobileOpen(false);
    }
  }, [isDesktop]);

  const toggle = useCallback(() => {
    if (isDesktop) {
      setCollapsed((c) => !c);
    } else {
      setMobileOpen((o) => !o);
    }
  }, [isDesktop]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return {
    collapsed: isDesktop ? collapsed : true,
    mobileOpen,
    isDesktop,
    toggle,
    closeMobile,
    expand: useCallback(() => {
      if (isDesktop) setCollapsed(false);
      else setMobileOpen(true);
    }, [isDesktop]),
    collapse: useCallback(() => {
      setCollapsed(true);
      setMobileOpen(false);
    }, []),
  };
}
