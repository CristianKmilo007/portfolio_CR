// src/contexts/transition-core.ts
import { createContext, useContext } from "react";

export type ExitFn = () => Promise<void> | void;

export type TransitionContextType = {
  registerExit: (fn: ExitFn) => () => void; // devuelve unregister
  runExitAnimations: (timeoutMs?: number) => Promise<void>;
};

export const TransitionContext = createContext<TransitionContextType | null>(null);

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside TransitionProvider");
  return ctx;
};
