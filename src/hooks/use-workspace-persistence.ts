"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hydrateWorkspaceFromStorage, saveWorkspacePersistence } from "@/lib/persistence";
import type { WorkspacePersistencePayload } from "@/types/persistence";

const SAVE_DEBOUNCE_MS = 400;

/**
 * Hydrates workspace state from localStorage and persists changes.
 * `flush` writes immediately — use after thought capture before navigation/refresh.
 */
export function useWorkspacePersistence() {
  const [isHydrated, setIsHydrated] = useState(false);
  const payloadRef = useRef<WorkspacePersistencePayload | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    const payload = payloadRef.current;
    if (!payload) return false;
    return saveWorkspacePersistence(payload);
  }, []);

  const scheduleSave = useCallback((payload: WorkspacePersistencePayload) => {
    payloadRef.current = payload;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveWorkspacePersistence(payload);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const persistNow = useCallback((payload: WorkspacePersistencePayload) => {
    payloadRef.current = payload;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    return saveWorkspacePersistence(payload);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const onPageHide = () => flush();
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
    };
  }, [isHydrated, flush]);

  const hydrate = useCallback(() => {
    const result = hydrateWorkspaceFromStorage();
    return result?.state ?? null;
  }, []);

  const completeHydration = useCallback(() => {
    setIsHydrated(true);
  }, []);

  return {
    isHydrated,
    hydrate,
    completeHydration,
    scheduleSave,
    persistNow,
    flush,
    setPayloadRef: (payload: WorkspacePersistencePayload) => {
      payloadRef.current = payload;
    },
  };
}
