// src/pages/Home.tsx
import React, { useEffect, useRef } from "react";
import ParticlesContainer from "../components/ParticlesContainer";
import TextType from "../components/TextType";
import AnimatedContent from "../components/AnimatedContent";
import {
  MouseParallaxContainer,
  MouseParallaxChild,
} from "react-parallax-mouse";
import FadeContent from "../components/FadeContent";
import CircularText from "../components/CircularText";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLDivElement | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);

  // refs para los 3 contenedores y sus spans de contador
  const box1Ref = useRef<HTMLDivElement | null>(null);
  const box2Ref = useRef<HTMLDivElement | null>(null);
  const box3Ref = useRef<HTMLDivElement | null>(null);
  const counter1Ref = useRef<HTMLSpanElement | null>(null);
  const counter2Ref = useRef<HTMLSpanElement | null>(null);
  const counter3Ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
  const MIN_MS = 1500;

  // guardo scroll actual para restaurar después
  const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

  // bloqueo por CSS: fijar body para impedir scroll absoluto
  const prevBodyPosition = document.body.style.position;
  const prevBodyTop = document.body.style.top;
  const prevBodyLeft = document.body.style.left;
  const prevBodyRight = document.body.style.right;
  const prevBodyWidth = document.body.style.width;
  const prevBodyOverflow = document.body.style.overflow;

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  // listeners defensivos en capture/passive:false
  const prevent = (e: Event) => {
    e.preventDefault();
  };
  const preventKey = (e: KeyboardEvent) => {
    const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", "Space"];
    if (keys.includes(e.code)) e.preventDefault();
  };

  window.addEventListener("wheel", prevent, { passive: false, capture: true });
  window.addEventListener("touchmove", prevent, { passive: false, capture: true });
  window.addEventListener("keydown", preventKey, { capture: true });

  // Si Lenis está expuesto (opcional), lo detenemos
  const lenis = (window as any).__lenis ?? null;
  try {
    if (lenis && typeof lenis.stop === "function") lenis.stop();
  } catch {
    /* ignore */
  }

  // fallback overlay (opcional, refuerzo)
  const overlay = document.createElement("div");
  overlay.id = "force-scroll-lock-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    background: "transparent",
    pointerEvents: "auto",
    touchAction: "none",
  });
  document.documentElement.appendChild(overlay);

  const restore = () => {
    // quitar listeners
    try {
      window.removeEventListener("wheel", prevent, { capture: true } as any);
      window.removeEventListener("touchmove", prevent, { capture: true } as any);
      window.removeEventListener("keydown", preventKey, { capture: true } as any);
    } catch {}
    // quitar overlay
    try {
      overlay.remove();
    } catch {}
    // restaurar body styles y volver a la posición de scroll original
    try {
      document.body.style.position = prevBodyPosition ?? "";
      document.body.style.top = prevBodyTop ?? "";
      document.body.style.left = prevBodyLeft ?? "";
      document.body.style.right = prevBodyRight ?? "";
      document.body.style.width = prevBodyWidth ?? "";
      document.body.style.overflow = prevBodyOverflow ?? "";
      // restaurar scroll
      window.scrollTo(0, scrollY);
    } catch {}
    // reanudar Lenis si existía
    try {
      if (lenis && typeof lenis.start === "function") lenis.start();
    } catch {}
  };

  const timeoutId = window.setTimeout(() => {
    restore();
  }, MIN_MS);

  return () => {
    window.clearTimeout(timeoutId);
    restore();
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



  // Ajusta este valor para controlar la velocidad global (>1 = más lento)
  const SPEED = 2;

  useEffect(() => {
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
        } catch {
          /* ignore */
        }
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
        } catch {
          /* ignore */
        }
      });
    };

    const create = async () => {
      try {
        await waitForImages();
      } catch {
        /* ignore */
      }
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

      // limpiamos transforms de ancestros temporalmente para medir bien
      lastClearedAncestors = clearAncestorTransforms(el);

      const gapShort = 0.2 * SPEED;
      const gapMedium = 0.25 * SPEED;
      const gapCenterMove = 0.15 * SPEED;
      const gapFinal = 0.05 * SPEED;

      // IMPORTANT: crear timeline CON scrollTrigger (de esta forma NO autoplay)
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${el.offsetHeight * 5 * SPEED}`,
          scrub: true, // vinculado al scroll (no autoplay)
          pin: true,
          pinSpacing: true,
          pinType: "transform", // como requieres
          markers: false,
          anticipatePin: 0.5,
          invalidateOnRefresh: true, // recalcula funciones (end) en refresh
        },
      });

      // PERF
      if (left) gsap.set(left, { willChange: "transform, opacity" });
      if (right) gsap.set(right, { willChange: "transform, opacity" });
      if (particles) gsap.set(particles, { willChange: "opacity" });
      if (center) gsap.set(center, { willChange: "opacity, transform" });

      // Todas las animaciones ANIDADAS en tl (no se llaman play)
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
          scale: 1,
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
            const targetTop = -(
              window.innerHeight / 2 -
              window.innerHeight * 0.275
            );
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

      // Restauramos transforms de ancestros ahora que el pin ya fue creado
      requestAnimationFrame(() => {
        try {
          restoreAncestorTransforms(lastClearedAncestors);
        } catch {
          /* ignore */
        }
        try {
          // forzamos refresh para asegurar cálculo correcto
          ScrollTrigger.refresh();
        } catch {
          /* ignore */
        }
      });
    }; // create

    create();

    return () => {
      mounted = false;
      try {
        if (tl) {
          // si el timeline tiene scrollTrigger, matarlo primero
          try {
            const st = (tl as any).scrollTrigger;
            if (st) st.kill && st.kill();
          } catch {
            /* ignore */
          }
          tl.kill();
          tl = null;
        }
      } catch {
        /* ignore */
      }

      // limpiar ancestros por si algo quedó
      try {
        restoreAncestorTransforms(lastClearedAncestors);
      } catch {
        /* ignore */
      }

      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SPEED]);

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

  return (
    <div ref={rootRef}>
      <div
        ref={pinRef}
        className="bg-[#111] h-screen relative"
        style={{
          willChange: "transform",
        }}
      >
        <MouseParallaxContainer
          globalFactorX={0.1}
          globalFactorY={0.2}
          resetOnLeave
        >
          <div className="w-full h-screen flex justify-end relative">
            <div className="w-[400px] grayscale mix-blend-color-dodge top-0 left-0 absolute">
              <MouseParallaxChild
                factorX={0.2}
                factorY={0.1}
                className="w-full h-full"
              >
                <FadeContent
                  blur={true}
                  duration={1000}
                  easing="ease-out"
                  initialOpacity={0}
                  className="w-full h-full"
                >
                  <img
                    src="../../public/Home/top-left-img.png"
                    alt=""
                    className="w-full h-full object-contain object-left-top"
                  />
                </FadeContent>
              </MouseParallaxChild>
            </div>

            <div
              ref={leftRef}
              className="container mx-auto h-screen flex flex-col justify-center absolute left-1/2 -translate-x-1/2  z-[1] mt-10 door-left"
            >
              <AnimatedContent
                distance={100}
                direction="vertical"
                reverse={false}
                duration={1.2}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                scale={1}
                threshold={0.2}
                delay={0}
              >
                <span className="text-white font-bold text-[60px] leading-17">
                  Me llamo <br />{" "}
                  <span className="text-[#555]">Cristian Rojas,</span> soy
                </span>
                <div className="h-[100px]">
                  <TextType
                    text={[
                      "Desarrollador Frontend",
                      "Desarrollador Backend",
                      "Desarrollador Full Stack",
                      "Diseñador UI/UX",
                      "Programador",
                    ]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={false}
                    className=" text-[80px] font-crimson italic"
                  />
                </div>

                <div className="w-[150px] h-[150px] relative flex justify-center items-center p-2 mt-20">
                  <div className="w-full h-full absolute">
                    <img
                      src="/public/Home/circle-star.svg"
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <CircularText
                    text="SCROLL • SCROLL • SCROLL • "
                    onHover="slowDown"
                    spinDuration={20}
                    className="font-medium !w-full !h-full circular-text-home"
                  />
                </div>
              </AnimatedContent>
            </div>

            <div className="relative w-[1200px]">
              <div ref={particlesRef} className="absolute w-full h-full">
                <FadeContent
                  blur={true}
                  duration={1000}
                  easing="ease-out"
                  initialOpacity={0}
                  className="w-full h-full"
                >
                  <ParticlesContainer />
                </FadeContent>
              </div>
              <div className="w-full h-full grayscale mix-blend-color-dodge ">
                <MouseParallaxChild
                  factorX={0.2}
                  factorY={0.1}
                  className="w-full h-full"
                >
                  <FadeContent
                    blur={true}
                    duration={1000}
                    easing="ease-out"
                    initialOpacity={0}
                    className="w-full h-full"
                  >
                    <img
                      src="../../public/Home/bg-explosion.png"
                      alt=""
                      className="w-full h-full object-cover object-right"
                    />
                  </FadeContent>
                </MouseParallaxChild>
              </div>
              <div
                ref={rightRef}
                className="xl:absolute xl:bottom-0 xl:left-1/2 xl:-translate-x-1/2 xl:w-[650px] door-right"
              >
                <AnimatedContent
                  distance={100}
                  direction="vertical"
                  reverse={false}
                  duration={1.2}
                  ease="power3.out"
                  initialOpacity={0}
                  animateOpacity
                  scale={1}
                  threshold={0.2}
                  delay={0}
                >
                  <img
                    src={"/Home/hero-img.png"}
                    width={737}
                    height={678}
                    alt="hero"
                    className="translate-z-0 w-full h-full "
                  />
                </AnimatedContent>
              </div>
            </div>

            {/* CENTRO: aparece después de la salida; dentro del mismo pin */}
            <div
              ref={centerRef}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none px-6 opacity-0"
            >
              <div className="max-w-[900px] text-center">
                <p className="text-white font-crimson italic font-normal text-[2.55rem] leading-12">
                  Desarrollador de aplicaciones web full stack, con amplio
                  conocimiento y solida experiencia, trabajando con tecnologías
                  modernas de diseño frontend y arquitectura backend,
                  escribiendo código limpio y entregando un trabajo de calidad.
                </p>
              </div>
            </div>

            {/* CONTENEDORES HORIZONTALES QUE APARECEN DESDE ABAJO */}
            <div className="absolute inset-x-0 bottom-[30vh] z-30 flex flex-row items-center justify-center gap-6 pointer-events-none px-6">
              {cards.map((card) => {
                return (
                  <div
                    ref={card.contentRef}
                    className="size-[220px] bg-white/6 backdrop-blur-md border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-white opacity-0 pointer-events-auto"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-5xl">+</span>
                      <span
                        ref={card.counterRef}
                        className="text-6xl font-crimson font-light"
                      >
                        0
                      </span>
                    </div>
                    <span className="mt-3 font-semibold leading-5 w-[125px]">
                      {card.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </MouseParallaxContainer>
      </div>
    </div>
  );
};

export default Home;
