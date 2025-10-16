// src/contexts/TransitionProvider.tsx
import React, { useRef } from "react";
import { TransitionContext, type ExitFn } from "./transition-core";

export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const exitsRef = useRef<Set<ExitFn>>(new Set());

  const registerExit = (fn: ExitFn) => {
    exitsRef.current.add(fn);
    return () => exitsRef.current.delete(fn);
  };

  async function runExitAnimations(timeoutMs = 900) {
    const fns = Array.from(exitsRef.current);
    if (!fns.length) return;

    const promises = fns.map((fn) =>
      Promise.race([
        (async () => {
          await fn();
        })(),
        new Promise<void>((res) => setTimeout(res, timeoutMs)), // fallback
      ])
    );

    // espera todas (con safety timeout global)
    await Promise.race([Promise.all(promises), new Promise<void>((res) => setTimeout(res, timeoutMs + 500))]);
  }

  return (
    <TransitionContext.Provider value={{ registerExit, runExitAnimations }}>
      {children}
    </TransitionContext.Provider>
  );
};

export default TransitionProvider;
