import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PinExample() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = pinRef.current;
      if (!el) return;

      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=100%",          // duración: 100% viewport
          scrub: true,
          pin: true,
          pinSpacing: true,
          markers: true,
          pinType: "transform",   // importante si usas Lenis / transforms en ancestros
          anticipatePin: 1        // suaviza el "salto" del pin
        }
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>
      <section
        ref={pinRef}
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          background: "#f5e6ff",
          // mejora perf: evita repaints durante transform
          willChange: "transform"
        }}
      >
        <div className="inner">Este elemento queda <strong>pinned</strong> mientras scrolleas</div>
      </section>

      <section style={{ height: "150vh" }}>Contenido de abajo</section>
    </div>
  );
}
