import { useRef, useEffect, useState, type ReactNode } from "react";

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  easing?: string;
  delay?: number;
  threshold?: number; // uso: proporción mínima visible (0..1)
  initialOpacity?: number;
  className?: string;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  blur = false,
  duration = 1000,
  easing = "ease-out",
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  className = "",
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // util: calcula si el elemento está visible según threshold (porcentaje de su altura)
  const isElementVisible = (el: HTMLElement | null) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const h = rect.height || 1;
    const intersection = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    const visibleRatio = intersection > 0 ? intersection / h : 0;
    return visibleRatio >= threshold;
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let canceled = false;
    let rafId: number | null = null;
    let startTime = performance.now();

    // Fallback check inmediato (si ya está visible al montar)
    if (isElementVisible(element)) {
      setTimeout(() => setInView(true), delay);
      return; // ya visible, no necesitamos observar
    }

    // IntersectionObserver normal
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(element);
          if (!canceled) setTimeout(() => setInView(true), delay);
        }
      },
      { threshold }
    );

    observer.observe(element);

    // Poll por RAF durante los primeros 1000ms por si IO no se disparó (Lenis/transform/mediciones tardías)
    const poll = () => {
      if (canceled) return;
      if (isElementVisible(element)) {
        observer.unobserve(element);
        setTimeout(() => setInView(true), delay);
        return;
      }
      // stop after 1000ms to avoid infinite loops
      if (performance.now() - startTime < 1000) {
        rafId = requestAnimationFrame(poll);
      }
    };
    rafId = requestAnimationFrame(poll);

    // Re-evalúa cuando cargan recursos o hay resize (por si cambian medidas)
    const onLoadOrResize = () => {
      if (isElementVisible(element)) {
        observer.unobserve(element);
        setTimeout(() => setInView(true), delay);
      }
    };
    window.addEventListener("load", onLoadOrResize);
    window.addEventListener("resize", onLoadOrResize);

    // (Opcional) escucha un evento custom si usas Lenis y quieres notificar manualmente
    // window.dispatchEvent(new Event('lenis:refresh'))

    return () => {
      canceled = true;
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("load", onLoadOrResize);
      window.removeEventListener("resize", onLoadOrResize);
    };
  }, [threshold, delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : initialOpacity,
        transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
        filter: blur ? (inView ? "blur(0px)" : "blur(10px)") : "none",
        willChange: "opacity, filter",
      }}
    >
      {children}
    </div>
  );
};

export default FadeContent;
