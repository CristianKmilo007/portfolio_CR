// src/hooks/useHome.ts
import { useEffect, useRef } from "react";
import { useResponsive } from "../../../hooks/useMediaQuery";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface useHomeProps {
  ready: boolean;
}

export const useHome = ({ ready }: useHomeProps) => {
  const { isLaptop, isTablet, isMobile } = useResponsive();

  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLDivElement | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);

  // refs para contenedores y contadores
  const box1Ref = useRef<HTMLDivElement | null>(null);
  const box2Ref = useRef<HTMLDivElement | null>(null);
  const box3Ref = useRef<HTMLDivElement | null>(null);
  const counter1Ref = useRef<HTMLSpanElement | null>(null);
  const counter2Ref = useRef<HTMLSpanElement | null>(null);
  const counter3Ref = useRef<HTMLSpanElement | null>(null);

  // ---- BLOQUEO INICIAL (más robusto) ----
  useEffect(() => {
    const MIN_MS = 1500;
    const OVERLAY_ID = "force-scroll-lock-overlay";
    const scrollY =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // guardar prev inline styles
    const prev = {
      bodyPosition: document.body.style.position || "",
      bodyTop: document.body.style.top || "",
      bodyLeft: document.body.style.left || "",
      bodyRight: document.body.style.right || "",
      bodyWidth: document.body.style.width || "",
      bodyOverflow: document.body.style.overflow || "",
      htmlOverflow: document.documentElement.style.overflow || "",
    };

    // handlers y opts estables
    const opts: AddEventListenerOptions = { passive: false, capture: true };
    const prevent = (e: Event) => {
      try {
        e.preventDefault();
      } catch {}
    };
    const preventKey = (e: KeyboardEvent) => {
      try {
        const blocked = [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          "Space",
        ];
        if (blocked.includes(e.code)) e.preventDefault();
      } catch {}
    };

    // detener lenis si existe (intento)
    const lenis = (window as any).__lenis ?? (window as any).lenis ?? null;
    try {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
    } catch {}

    // remover overlays previos por si acaso
    try {
      const existing = document.getElementById(OVERLAY_ID);
      if (existing && existing.parentNode)
        existing.parentNode.removeChild(existing);
    } catch {}

    // crear overlay
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: String(2147483647 - 1),
      background: "transparent",
      pointerEvents: "auto",
      touchAction: "none",
    });
    try {
      (document.body || document.documentElement).appendChild(overlay);
    } catch {
      try {
        document.documentElement.appendChild(overlay);
      } catch {}
    }

    // bloquear inline
    try {
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } catch {}

    // add listeners
    try {
      window.addEventListener("wheel", prevent, opts);
      window.addEventListener("touchmove", prevent, opts);
      window.addEventListener("keydown", preventKey, { capture: true });
    } catch {}

    // restored flag para idempotencia
    let restored = false;
    const removeOverlaysByPattern = () => {
      try {
        // elementos con id conocido
        const ids = [OVERLAY_ID, "force-scroll-lock-overlay-2"];
        ids.forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.parentNode) el.parentNode.removeChild(el);
        });

        // buscar overlays que ocupen pantalla y tengan z-index alto (precaución)
        document.querySelectorAll("body > div, html > div").forEach((el) => {
          try {
            const st = window.getComputedStyle(el as Element);
            if (
              st.position === "fixed" &&
              parseInt(st.zIndex || "0", 10) > 1000000000
            ) {
              (el as Element).remove();
            }
          } catch {}
        });
      } catch {}
    };

    const restore = () => {
      if (restored) return;
      restored = true;

      // remover listeners
      try {
        window.removeEventListener("wheel", prevent, opts as any);
        window.removeEventListener("touchmove", prevent, opts as any);
        window.removeEventListener(
          "keydown",
          preventKey as any,
          { capture: true } as any
        );
      } catch {}

      // remove overlays
      try {
        removeOverlaysByPattern();
      } catch {}

      // restaurar estilos inline
      try {
        document.documentElement.style.overflow = prev.htmlOverflow;
        document.body.style.overflow = prev.bodyOverflow;
        document.body.style.position = prev.bodyPosition;
        document.body.style.top = prev.bodyTop;
        document.body.style.left = prev.bodyLeft;
        document.body.style.right = prev.bodyRight;
        document.body.style.width = prev.bodyWidth;
        window.scrollTo(0, scrollY);
      } catch {}

      // reanudar lenis si existe
      try {
        if (lenis && typeof lenis.start === "function") lenis.start();
      } catch {}

      // try to cleanup GSAP ScrollTrigger leftovers
      try {
        if ((gsap as any).ScrollTrigger) {
          const ST = (gsap as any).ScrollTrigger;
          ST.getAll &&
            ST.getAll().forEach((t: any) => {
              try {
                t.kill && t.kill();
              } catch {}
            });
          ST.refresh && ST.refresh();
        }
      } catch {}
    };

    // Exponer restore para debugging manual: window.__home_restore()
    try {
      (window as any).__home_restore = restore;
    } catch {}

    // aseguramos restore en varios eventos de navegación / ciclo de vida
    const onPageHide = () => restore();
    const onVis = () => {
      if (document.visibilityState === "hidden") restore();
    };
    const onPop = () => restore();
    const onBeforeUnload = () => restore();

    try {
      window.addEventListener("pagehide", onPageHide, { capture: true });
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("popstate", onPop);
      window.addEventListener("beforeunload", onBeforeUnload, {
        capture: true,
      });
    } catch {}

    // fallback timeout (tu lógica original)
    const timeoutId = window.setTimeout(() => {
      restore();
    }, MIN_MS);

    // cleanup del useEffect
    return () => {
      clearTimeout(timeoutId);
      try {
        window.removeEventListener(
          "pagehide",
          onPageHide as any,
          { capture: true } as any
        );
        document.removeEventListener("visibilitychange", onVis as any);
        window.removeEventListener("popstate", onPop as any);
        window.removeEventListener(
          "beforeunload",
          onBeforeUnload as any,
          { capture: true } as any
        );
      } catch {}
      try {
        restore();
      } catch {}
      try {
        delete (window as any).__home_restore;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLaptop, isMobile]);

  // ---- Resto del hook: timeline / scrolltrigger (igual que antes) ----
  const SPEED = 2;

  useEffect(() => {

    if (!ready) return;

    let tl: gsap.core.Timeline | null = null;
    let mounted = true;
    let lastClearedAncestors: { el: HTMLElement; prev: string }[] = [];

    const waitForImages = () =>
      new Promise<void>((resolve) => {
        const imgs = Array.from(document.images);
        if (!imgs.length) return resolve();
        let remaining = imgs.length;
        imgs.forEach((img) => {
          if (img.complete) {
            remaining -= 1;
            if (remaining <= 0) resolve();
          } else {
            img.addEventListener(
              "load",
              () => {
                remaining -= 1;
                if (remaining <= 0) resolve();
              },
              { once: true }
            );
            img.addEventListener(
              "error",
              () => {
                remaining -= 1;
                if (remaining <= 0) resolve();
              },
              { once: true }
            );
          }
        });
      });

    const clearAncestorTransforms = (startEl: HTMLElement | null) => {
      const cleared: { el: HTMLElement; prev: string }[] = [];
      if (!startEl) return cleared;
      let node: HTMLElement | null = startEl.parentElement;
      while (node && node !== document.body) {
        try {
          const cs = window.getComputedStyle(node);
          if (cs && cs.transform && cs.transform !== "none") {
            cleared.push({ el: node, prev: node.style.transform || "" });
            node.style.transform = "none";
          }
        } catch {}
        node = node.parentElement;
      }
      return cleared;
    };

    const restoreAncestorTransforms = (
      cleared: { el: HTMLElement; prev: string }[]
    ) => {
      cleared.forEach((item) => {
        try {
          item.el.style.transform = item.prev || "";
        } catch {}
      });
    };

    const create = async () => {
      try {
        await waitForImages();
      } catch {}
      if (!mounted) return;

      const el = pinRef.current;
      const left = leftRef.current;
      const right = rightRef.current;
      const particles = particlesRef.current;
      const center = centerRef.current;
      const box1 = box1Ref.current;
      const box2 = box2Ref.current;
      const box3 = box3Ref.current;
      const c1 = counter1Ref.current;
      const c2 = counter2Ref.current;
      const c3 = counter3Ref.current;

      if (!el || !center) return;

      lastClearedAncestors = clearAncestorTransforms(el);

      const gapShort = 0.2 * SPEED;
      const gapMedium = 0.25 * SPEED;
      const gapCenterMove = 0.15 * SPEED;
      const gapFinal = 0.05 * SPEED;

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${el.offsetHeight * 5 * SPEED}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          pinType: isMobile ? "fixed" : "transform",
          markers: false,
          anticipatePin: 0.5,
          invalidateOnRefresh: true,
        },
      });

      if (left) gsap.set(left, { willChange: "transform, opacity" });
      if (right) gsap.set(right, { willChange: "transform, opacity" });
      if (particles) gsap.set(particles, { willChange: "opacity" });
      if (center) gsap.set(center, { willChange: "opacity, transform" });

      try {
        if (el)
          (el as HTMLElement).style.transform =
            (el as HTMLElement).style.transform || "translateZ(0)";
        if (left)
          (left as HTMLElement).style.transform =
            (left as HTMLElement).style.transform || "translateZ(0)";
        if (right)
          (right as HTMLElement).style.transform =
            (right as HTMLElement).style.transform || "translateZ(0)";
        if (center)
          (center as HTMLElement).style.transform =
            (center as HTMLElement).style.transform || "translateZ(0)";
      } catch {}

      if (left)
        tl.to(
          left,
          {
            x: "-100px",
            opacity: 0,
            ease: "power1.out",
            duration: 1.2 * SPEED,
          },
          0
        );
      if (right)
        tl.to(
          right,
          { x: "400px", opacity: 0, ease: "power1.out", duration: 1.2 * SPEED },
          0.05 * SPEED
        );
      if (particles)
        tl.to(
          particles,
          { opacity: 0, ease: "power1.out", duration: 1.2 * SPEED },
          0
        );

      gsap.set(center, {
        opacity: 0,
        scale: 0.85,
        y: 20,
        pointerEvents: "none",
      });

      tl.to(
        center,
        {
          opacity: 1,
          scale: isMobile ? 0.9 : 1,
          y: 0,
          duration: 1.6 * SPEED,
          ease: "power1.out",
          pointerEvents: "auto",
        },
        ">"
      );
      tl.to(
        center,
        {
          y: () => {
            const vh = window.innerHeight;
            const offset = isMobile ? 0.3 : isLaptop ? 0.35 : 0.275;
            const targetTop = -(vh / 2 - vh * offset);
            return targetTop;
          },
          duration: 1.4 * SPEED,
          scale: 0.8,
          ease: "power1.out",
        },
        "+=" + gapCenterMove
      );

      [box1, box2, box3].forEach((b) => {
        if (b) gsap.set(b, { y: 120, opacity: 0, pointerEvents: "auto" });
      });

      const count1 = { val: 0 };
      const count2 = { val: 0 };
      const count3 = { val: 0 };
      const update1 = () => {
        if (!c1) return;
        c1.innerText = `${Math.round(count1.val)}`;
      };
      const update2 = () => {
        if (!c2) return;
        c2.innerText = `${Math.round(count2.val)}`;
      };
      const update3 = () => {
        if (!c3) return;
        c3.innerText = `${Math.round(count3.val)}`;
      };

      tl.to(
        box1,
        { y: 0, opacity: 1, duration: 1 * SPEED, ease: "power3.out" },
        "+=" + gapShort
      );
      tl.to(
        count1,
        { val: 5, duration: 1 * SPEED, ease: "none", onUpdate: update1 },
        "<"
      );

      tl.to(
        box2,
        { y: 0, opacity: 1, duration: 1 * SPEED, ease: "power3.out" },
        "+=" + gapMedium
      );
      tl.to(
        count2,
        { val: 10, duration: 1.5 * SPEED, ease: "none", onUpdate: update2 },
        "<"
      );

      tl.to(
        box3,
        { y: 0, opacity: 1, duration: 1 * SPEED, ease: "power3.out" },
        "+=" + gapMedium
      );
      tl.to(
        count3,
        { val: 3, duration: 1 * SPEED, ease: "none", onUpdate: update3 },
        "<"
      );

      tl.to(
        [c1, c2, c3],
        {
          scale: 1.05,
          duration: 0.3 * SPEED,
          yoyo: true,
          repeat: 1,
          transformOrigin: "center",
        },
        "+=" + gapFinal
      );

      requestAnimationFrame(() => {
        try {
          restoreAncestorTransforms(lastClearedAncestors);
        } catch {}
        try {
          ScrollTrigger.refresh && ScrollTrigger.refresh();
        } catch {}
      });
    };

    create();

    return () => {
      mounted = false;
      try {
        if (tl) {
          try {
            const st = (tl as any).scrollTrigger;
            if (st) st.kill && st.kill();
          } catch {}
          tl.kill();
          tl = null;
        }
      } catch {}
      try {
        restoreAncestorTransforms(lastClearedAncestors);
      } catch {}
      try {
        ScrollTrigger.refresh && ScrollTrigger.refresh();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SPEED, isLaptop, isMobile, ready]);

  const cards = [
    {
      contentRef: box1Ref,
      counterRef: counter1Ref,
      text: "Años de experiencia",
    },
    {
      contentRef: box2Ref,
      counterRef: counter2Ref,
      text: "Proyectos completados",
    },
    {
      contentRef: box3Ref,
      counterRef: counter3Ref,
      text: "Compañías de desarrollo",
    },
  ];

  return {
    rootRef,
    pinRef,
    leftRef,
    particlesRef,
    rightRef,
    isTablet,
    isLaptop,
    centerRef,
    cards,
  };
};
