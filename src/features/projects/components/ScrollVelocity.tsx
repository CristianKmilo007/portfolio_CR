// ScrollVelocity.tsx (sin rebotes — usa lerp en lugar de springs)
import React, { useRef, useLayoutEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from "motion/react";

interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
  texts: string[];
  velocity?: number; // base px/sec (ej. 5 inicialmente)
  className?: string;
  damping?: number; // (no usado aquí, pero kept for compat)
  stiffness?: number; // (no usado)
  numCopies?: number;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
  virtualProgressRef?: React.RefObject<number>;
  verticalTravel?: number;
  speedMultiplier?: number;
  activeBoost?: number; // cuánto aumentar cuando hay actividad
  followAlpha?: number; // 0..1 -> 1 = sin suavizado, 0.12 = suave, sin rebote
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    function update() { if (ref.current) setWidth(ref.current.offsetWidth); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
  return width;
}

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

export const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = "",
  numCopies = 6,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
  virtualProgressRef,
  verticalTravel = 420,
  speedMultiplier = 1,
  activeBoost = 80,
  followAlpha = 0.12 // <--- controla delay; 1 = 0 delay, 0.12 = ligero smoothing sin rebote
}) => {

  // ---------------- VelocityText ----------------
  function VelocityText({
    children,
    baseVelocity = velocity,
    scrollContainerRef,
    className = "",
    numCopies
  }: {
    children: React.ReactNode;
    baseVelocity?: number;
    scrollContainerRef?: React.RefObject<HTMLElement>;
    className?: string;
    numCopies?: number;
  }) {
    const baseX = useMotionValue(0);
    const copyRef = useRef<HTMLSpanElement | null>(null);
    const copyWidth = useElementWidth(copyRef);
    const x = useTransform(baseX, (v) => {
      if (!copyWidth) return "0px";
      return `${wrap(-copyWidth, 0, v)}px`;
    });

    // scroll real
    const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
    const { scrollY } = useScroll((scrollOptions as any) || undefined);
    const scrollVel = useVelocity(scrollY);

    // detectamos actividad combinando scrollVel y cambios en virtualProgressRef
    // NO usamos springs aquí: usamos lerp para suavizar sin overshoot
    const prevProgRef = useRef<number>(virtualProgressRef?.current ?? 0);
    const smoothActivityRef = useRef<number>(0); // 0..1 smoothed activity

    // sensibilities
    const VELOCITY_SCALE = 1000;    // mayor = menos sensible al wheel
    const PROG_DELTA_SCALE = 400;   // mayor = cambios pequeños de prog dan mayor actividad

    useAnimationFrame((_, delta) => {
      const dt = delta / 1000;
      const v = scrollVel.get(); // px/sec-ish, puede ser grande (positivo/negativo)
      const scrollDerived = clamp(Math.abs(v) / VELOCITY_SCALE, 0, 1);

      // prog delta: leemos ref directo (actualizado por container loop)
      const currentProg = clamp(virtualProgressRef?.current ?? 0, 0, 1);
      const deltaProg = currentProg - prevProgRef.current;
      // NOTA: usamos deltaProg para detectar dirección de "virtual scroll"
      prevProgRef.current = currentProg;
      const progDerived = clamp(Math.abs(deltaProg) * PROG_DELTA_SCALE, 0, 1);

      const activity = Math.max(scrollDerived, progDerived); // 0..1

      // suavizado con lerp (no rebote)
      smoothActivityRef.current = lerp(smoothActivityRef.current, activity, 0.18);

      // extra multiplier = smoothActivity * activeBoost
      const extraMultiplier = smoothActivityRef.current * (activeBoost ?? 80);

      const pxPerFrame = Math.abs(baseVelocity) * dt;

      // ---------- NUEVO: cálculo de dirección que respeta el baseVelocity y el scroll invertido ----------
      // wheelDir: dirección detectada por la velocidad del wheel (signo de v)
      const wheelDir = Math.sign(v); // -1, 0, 1

      // progDir: dirección detectada por el cambio en virtualProgressRef
      const progDir = Math.sign(deltaProg); // -1, 0, 1

      // preferimos progDir (virtual progress) si disponible, si no usamos wheelDir
      const userDir = progDir !== 0 ? progDir : (wheelDir !== 0 ? wheelDir : 0);

      // dirección base (según tu baseVelocity por item)
      const baseDir = Math.sign(baseVelocity) === 0 ? 1 : Math.sign(baseVelocity);

      // Si userDir === 0, usamos la dirección base. Si userDir es -1 al devolverse,
      // invertimos la dirección base multiplicando por userDir.
      const effectiveDir = userDir === 0 ? baseDir : userDir * baseDir;
      // ----------------------------------------------------------------------------------------------

      const moveBy = effectiveDir * pxPerFrame * (1 + extraMultiplier * (speedMultiplier ?? 1));

      baseX.set(baseX.get() + moveBy);
    });

    // spans
    const spans = [];
    for (let i = 0; i < (numCopies ?? 6); i++) {
      spans.push(
        <span key={i} ref={i === 0 ? copyRef : null} className={`flex-shrink-0 ${className}`} aria-hidden>
          {children}
        </span>
      );
    }

    return (
      <motion.div className={`${scrollerClassName ?? "flex whitespace-nowrap"}`} style={{ x, ...(scrollerStyle || {}) }}>
        {spans}
      </motion.div>
    );
  }

  // ---------------- Container Y (sin rebote) ----------------
  // Usamos un motionValue que sigue el virtualProgressRef con LERP (o sin LERP si followAlpha=1)
  const containerProgMV = useMotionValue(virtualProgressRef?.current ?? 0);
  const containerProgRef = useRef<number>(containerProgMV.get());

  useLayoutEffect(() => {
    if (!virtualProgressRef) return;
    let raf = 0;
    const tick = () => {
      const target = clamp(virtualProgressRef.current ?? 0, 0, 1);
      // lerp hacia target; si followAlpha===1 será inmediato (sin suavizado)
      containerProgRef.current = lerp(containerProgRef.current, target, followAlpha);
      containerProgMV.set(containerProgRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [virtualProgressRef, followAlpha, containerProgMV]);

  const containerY = useTransform(containerProgMV, (p) => -p * (verticalTravel ?? 420));

  return (
    <motion.section aria-hidden style={{ pointerEvents: "none", y: containerY, ...(parallaxStyle || {}) }} className={`relative overflow-hidden ${parallaxClassName ?? ""}`}>
      {texts.map((text, index) => (
        <VelocityText key={index} className={className} baseVelocity={index % 2 !== 0 ? -velocity : velocity} scrollContainerRef={scrollContainerRef} numCopies={numCopies}>
          {text}&nbsp;
        </VelocityText>
      ))}
    </motion.section>
  );
};

export default ScrollVelocity;
