"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "aie-wf-2026:saved-sessions";

/** Persisted set of saved session ids (titles, since sessions have no id from server). */
export function useSavedSessions() {
  // Lazy initializer — runs once on the client during the first render.
  // Safe with SSR because localStorage is only touched inside the initializer,
  // and the component using this hook is a client component.
  const [saved, setSaved] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        return new Set(arr);
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  // Persist on change. The first run after mount will write the same data we
  // just read — harmless, and keeps the effect logic simple.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
    } catch {
      // ignore
    }
  }, [saved]);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  const clearAll = useCallback(() => setSaved(new Set()), []);

  return { saved, toggle, isSaved, hydrated: true, clearAll };
}
