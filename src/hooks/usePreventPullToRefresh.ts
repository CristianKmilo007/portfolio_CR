import { useEffect, useRef } from "react";

/**
 * Evita pull-to-refresh / overscroll cuando `active` es true.
 * Solo previene el gesto cuando detecta un "pull down" desde el tope (scrollY <= 0).
 */
export function usePreventPullToRefresh(active: boolean) {
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const onTouchStart = (e: TouchEvent) => {
      startY.current = e.touches?.[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const curY = e.touches?.[0]?.clientY ?? 0;
      const delta = curY - startY.current;

      // Si estamos en el tope del documento y tiran hacia abajo -> prevenir pull-to-refresh
      const scrolly = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      if (scrolly <= 0 && delta > 0) {
        // preventDefault solo tiene efecto si el listener NO es passive
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      startY.current = null;
    };
  }, [active]);
}
