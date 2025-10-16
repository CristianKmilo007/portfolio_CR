// src/contexts/curtain-core.ts
import { createContext, useContext } from "react";

export type CurtainAPI = {
  coverThenNavigate: (cbAfterCover: () => void) => Promise<void>;
};

export const CurtainContext = createContext<CurtainAPI | null>(null);

export function useCurtain() {
  const ctx = useContext(CurtainContext);
  if (!ctx) throw new Error("useCurtain must be inside CurtainProvider");
  return ctx;
}
