// src/hooks/usePageExit.ts
import { useEffect, useRef } from "react";
import { useTransition } from "../context/transition-core";

/** usePageExit: register an async exit function that will be awaited before navigation */
export function usePageExit(exitFn: () => Promise<void> | void) {
  const { registerExit } = useTransition();
  const saved = useRef(exitFn);
  saved.current = exitFn;

  useEffect(() => {
    const unregister = registerExit(() => saved.current());
    return unregister;
  }, [registerExit]);
}
