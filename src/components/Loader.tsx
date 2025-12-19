// PageLoader.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import DynamicSVGVariant from "../assets/icons/DynamicLogo";

interface PageLoaderProps {
  onComplete: () => void;
  segments?: number[]; // e.g. [0, 42, 79, 100]
}

/* timing tunables */
const EXIT_DUR = 0.25;
const ENTER_DUR = 0.3;
const STAGGER = 60; // ms between column animations (visual offset)
const BREATHING = 0.12;
const INITIAL_SHOW_MS = 250;
const LINE_LEAD_MS = 200; // ms before line animation to hide counter parent

export default function PageLoader({
  onComplete,
  segments = [0, 42, 79, 100],
}: PageLoaderProps) {
  // Always two columns: tens (0..10) and units (0..9)
  const tensValues = Array.from({ length: 11 }, (_, i) => String(i)); // 0..10
  const unitsValues = Array.from({ length: 10 }, (_, i) => String(i)); // 0..9

  const [index, setIndex] = useState(0);
  const [suppressInitialAnim, setSuppressInitialAnim] = useState(true);

  const tensListRef = useRef<HTMLDivElement | null>(null);
  const unitsListRef = useRef<HTMLDivElement | null>(null);
  const counterWrapperRef = useRef<HTMLDivElement | null>(null);

  // NEW: logo refs + pulse tween ref (aquí usamos timeline para blink)
  const logoRef = useRef<HTMLDivElement | null>(null);
  const logoPulseRef = useRef<gsap.core.Tween | null>(null);

  // RAF scheduler refs
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const hideScheduledRef = useRef(false);
  const gsapTlRef = useRef<gsap.core.Timeline | null>(null);
  const fadeTweenRef = useRef<gsap.core.Tween | null>(null);

  const digitsForValue = (n: number) => {
    const capped = Math.max(0, Math.round(n));
    const tens = Math.floor(capped / 10); // 0..10
    const units = capped % 10;
    return { tens, units };
  };

  useEffect(() => {
    const id = window.requestAnimationFrame(() =>
      setSuppressInitialAnim(false)
    );
    return () => window.cancelAnimationFrame(id);
  }, []);

  const animateColumnsTo = (
    tensIndex: number,
    unitsIndex: number,
    animate = true
  ) => {
    const tensList = tensListRef.current;
    const unitsList = unitsListRef.current;
    if (!tensList || !unitsList) return;

    const tensItem = tensList.querySelector<HTMLElement>("[data-digit]");
    const unitsItem = unitsList.querySelector<HTMLElement>("[data-digit]");
    if (!tensItem || !unitsItem) return;

    const tensH = tensItem.getBoundingClientRect().height;
    const unitsH = unitsItem.getBoundingClientRect().height;

    const targetYt = -tensIndex * tensH;
    const targetYu = -unitsIndex * unitsH;

    gsap.killTweensOf(tensList);
    gsap.killTweensOf(unitsList);

    if (!animate) {
      gsap.set(tensList, { y: targetYt });
      gsap.set(unitsList, { y: targetYu });
      return;
    }

    const baseDur = 0.35;
    gsap.to(tensList, { y: targetYt, duration: baseDur, ease: "power2.out" });
    gsap.to(unitsList, {
      y: targetYu,
      duration: baseDur * 0.85,
      ease: "power2.out",
      delay: STAGGER / 1000,
    });
  };

  // NEW: blink effect (apagarse/encenderse/apagarse/encenderse) y repetir.
  // Cuando la carga termina, lo matamos y hacemos un fade final lento a 0.
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    // --- Parámetros (ajusta si quieres) ---
    const PULSE_DUR = 1.8; // ciclo completo en segundos (sube -> baja -> sube)
    const OP_UP = 0.05; // opacidad "encendido"
    const OP_DOWN = 0.02; // opacidad "apagado tenue" (no 0 para que siga visible)
    // ---------------------------------------

    // estado inicial (sin tocar scale)
    gsap.set(el, {
      opacity: OP_UP,
      transformOrigin: "center center",
      willChange: "opacity",
    });

    // abrir limpieza por si hay tweens previos
    gsap.killTweensOf(el);
    if (logoPulseRef.current) {
      try {
        (logoPulseRef.current as any).kill();
      } catch {
        /* ignore */
      }
      logoPulseRef.current = null;
    }

    // animación lineal simple: de OP_UP -> OP_DOWN y yoyo para volver.
    // duration = PULSE_DUR / 2 porque con yoyo el ciclo completo será PULSE_DUR.
    const half = PULSE_DUR / 2;
    const pulse = gsap.to(el, {
      opacity: OP_DOWN,
      duration: half,
      ease: "none", // movimiento lineal
      repeat: -1,
      yoyo: true,
      immediateRender: false,
    });

    logoPulseRef.current = pulse as unknown as gsap.core.Tween;

    return () => {
      if (logoPulseRef.current) {
        try {
          (logoPulseRef.current as any).kill();
        } catch {
          /* ignore */
        }
        logoPulseRef.current = null;
      }
      gsap.killTweensOf(el);
    };
  }, []);

  useEffect(() => {
    const cols = 2;
    const exitPhase = EXIT_DUR + (STAGGER / 1000) * Math.max(0, cols - 1);
    const enterPhase = ENTER_DUR + (STAGGER / 1000) * Math.max(0, cols - 1);
    const perSegmentMs = Math.round(
      (exitPhase + enterPhase + BREATHING) * 1000
    );
    const startAt = INITIAL_SHOW_MS;

    const totalRunMs =
      startAt +
      perSegmentMs * Math.max(0, segments.length - 1) +
      perSegmentMs +
      300;

    const tick = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;

      if (elapsed < startAt) {
        setIndex(0);
      } else {
        const sinceStart = elapsed - startAt;
        const step = Math.min(
          segments.length - 1,
          1 + Math.floor(sinceStart / perSegmentMs)
        );
        setIndex(step);
      }

      // schedule hide of counter parent slightly before line animation
      const timeUntilLine = totalRunMs - elapsed;
      if (timeUntilLine <= LINE_LEAD_MS && !hideScheduledRef.current) {
        hideScheduledRef.current = true;
      }

      // finish: animate logo out (fade lento), luego linea, luego onComplete
      if (elapsed >= totalRunMs) {
        if (!completedRef.current) {
          completedRef.current = true;
          setIndex(segments.length - 1);
          const line = document.getElementById("page-loader-line");

          // stop blink/repeat cleanly
          if (logoPulseRef.current) {
            try {
              (logoPulseRef.current as any).kill();
            } catch {
              /* ignore */
            }
            logoPulseRef.current = null;
          }
          // asegurar que no haya tweens colisionando en logo
          if (logoRef.current) gsap.killTweensOf(logoRef.current);

          // timeline: fade final lento del logo, luego linea
          const tl = gsap.timeline({
            onComplete: () => onComplete(),
          });
          gsapTlRef.current = tl;

          // fade final lento (quede apagado)
          if (logoRef.current || counterWrapperRef.current) {
            const finalFadeDur = 0.8; // segundos, ajustable
            tl.to([logoRef.current, counterWrapperRef.current], {
              opacity: 0,
              duration: finalFadeDur,
              ease: "power2.out",
            });
          }

          if (line) {
            // ensure initial state
            gsap.set(line, { scaleX: 0, transformOrigin: "center center" });
            tl.to(
              line,
              { scaleX: 1, duration: 0.5, ease: "power3.inOut" },
              "+=0.05"
            );
            tl.to(
              line,
              { height: "100vh", duration: 0.6, ease: "power4.inOut" },
              "+=0.08"
            );
            tl.to(
              line,
              { background: '#111', duration: 0.6, ease: "power4.inOut" },

            );
          } else {
            // if no line element, still call onComplete (tl will call it)
          }
        }
        rafRef.current = null;
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    // reset flags & start
    startTimeRef.current = null;
    completedRef.current = false;
    hideScheduledRef.current = false;
    if (fadeTweenRef.current) {
      fadeTweenRef.current.kill();
      fadeTweenRef.current = null;
    }
    if (gsapTlRef.current) {
      gsapTlRef.current.kill();
      gsapTlRef.current = null;
    }

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
      completedRef.current = false;
      hideScheduledRef.current = false;
      if (fadeTweenRef.current) {
        fadeTweenRef.current.kill();
        fadeTweenRef.current = null;
      }
      if (gsapTlRef.current) {
        gsapTlRef.current.kill();
        gsapTlRef.current = null;
      }
      if (logoPulseRef.current) {
        logoPulseRef.current.kill();
        logoPulseRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(segments), onComplete]);

  useLayoutEffect(() => {
    const seg = segments[index];
    const { tens, units } = digitsForValue(seg);
    const animate = !suppressInitialAnim;
    animateColumnsTo(tens, units, animate);
  }, [index, suppressInitialAnim, segments]);

  return (
    <div className="fixed inset-0 z-60 bg-[#111] flex items-center justify-center overflow-hidden">
      {/* Counter wrapper: overflow-hidden so digits slide cleanly */}
      {/* NEW: logo wrapper ref -> GSAP controla opacity */}
      <div
        ref={logoRef}
        className="absolute top-1/2 -translate-y-1/2 -left-40 grayscale"
      >
        <DynamicSVGVariant width={1200} height={1200} />
      </div>

      <div
        ref={counterWrapperRef}
        className="relative overflow-hidden flex items-center justify-center w-full h-full pointer-events-none"
        aria-hidden
      >
        <div className="absolute right-16 bottom-12 flex items-end gap-1 h-[125px] overflow-hidden font-crimson">
          {/* Tens column */}
          <div
            className="overflow-hidden h-[9rem] leading-none"
            style={{ lineHeight: 1 }}
          >
            <div ref={tensListRef}>
              {tensValues.map((v, i) => (
                <div
                  key={v + i}
                  data-digit
                  className="text-[10rem] font-normal text-white text-end"
                  style={{
                    height: "10rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Units column */}
          <div
            className="overflow-hidden h-[9rem] leading-none"
            style={{ lineHeight: 1 }}
          >
            <div ref={unitsListRef}>
              {unitsValues.map((v, i) => (
                <div
                  key={v + i}
                  data-digit
                  className="text-[10rem] font-normal text-white text-center"
                  style={{
                    height: "10rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "start",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* percent sign */}
          <div className="text-[5rem] font-normal text-white ml-4 self-end -mb-4">
            %
          </div>
        </div>
      </div>

      {/* linea central (GSAP) */}
      <div
        id="page-loader-line"
        className="absolute left-0 right-0 top-1/2 h-[2px] bg-white origin-center scale-x-0"
        style={{ transform: "translateY(-50%)" }}
      />
    </div>
  );
}
