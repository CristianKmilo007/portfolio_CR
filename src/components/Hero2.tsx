import { useEffect, useRef } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import CustomEase from "gsap/CustomEase";
import LightRays from "./LightRays";

gsap.registerPlugin(Flip, CustomEase);

interface HeroProps {
  onScrollPastHero: () => void;
  isVisible?: boolean;
}

export default function Hero2({
  onScrollPastHero,
  isVisible = true,
}: HeroProps) {
  const scrollAccumRef = useRef(0);
  const calledRef = useRef(false);
  const lastActivityRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);

  // refs para animaciones (elementos que contienen <img>)
  const overlayImagesRef = useRef<Array<HTMLDivElement | null>>([]);
  const imagesTlRef = useRef<gsap.core.Timeline | null>(null);
  const floatTweensRef = useRef<Array<gsap.core.Tween>>([]);

  // refs nuevos: overlays + texto izquierdo
  const overlayGradientRef = useRef<HTMLDivElement | null>(null);
  const lightRaysRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef<HTMLDivElement | null>(null);

  // pequeño reset al mostrar/ocultar
  useEffect(() => {
    if (isVisible) {
      calledRef.current = false;
      scrollAccumRef.current = 0;
      lastActivityRef.current = null;
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const THRESHOLD = 120;

    const resetAccum = () => {
      scrollAccumRef.current = 0;
      lastActivityRef.current = null;
    };

    const onWheel = (e: WheelEvent) => {
      try {
        e.preventDefault();
      } catch {}

      if (calledRef.current) return;
      if (e.deltaY <= 0) {
        if (scrollAccumRef.current > 0) resetAccum();
        return;
      }

      scrollAccumRef.current += e.deltaY;
      lastActivityRef.current = performance.now();

      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = window.setTimeout(() => {
        resetAccum();
        resetTimeoutRef.current = null;
      }, 350);

      if (scrollAccumRef.current >= THRESHOLD) {
        calledRef.current = true;
        if (resetTimeoutRef.current) {
          window.clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = null;
        }
        onScrollPastHero();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      try {
        e.preventDefault();
      } catch {}

      if (touchStartYRef.current == null) return;
      const currentY = e.touches[0].clientY;
      const delta = touchStartYRef.current - currentY;

      if (delta > 0) {
        scrollAccumRef.current += delta;
        lastActivityRef.current = performance.now();

        if (resetTimeoutRef.current)
          window.clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = window.setTimeout(() => {
          scrollAccumRef.current = 0;
          resetTimeoutRef.current = null;
        }, 350);
      } else {
        scrollAccumRef.current = 0;
      }

      if (scrollAccumRef.current >= THRESHOLD) {
        calledRef.current = true;
        if (resetTimeoutRef.current) {
          window.clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = null;
        }
        onScrollPastHero();
      }

      touchStartYRef.current = currentY;
    };

    window.addEventListener("wheel", onWheel, {
      passive: false,
    } as AddEventListenerOptions);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, {
      passive: false,
    } as AddEventListenerOptions);

    return () => {
      window.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("touchstart", onTouchStart as EventListener);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, [isVisible, onScrollPastHero]);

  // ----- IMAGES (configuración declarativa de posiciones finales con clases Tailwind) -----
  const IMAGES = [
    {
      url: "/projects/eranpay/img1.png",
      className: "w-[350px] h-[200px] top-[-22px] left-[175px] rotate-8",
    },
    {
      url: "/projects/distripharmacias-del-llano/img1.png",
      className: "w-[350px] h-[200px] top-[70px] left-[-80px] rotate-[-2deg]",
    },
    {
      url: "/projects/tododomi/img1.png",
      className: "w-[350px] h-[200px] top-[173px] left-[250px] rotate-3",
    },
    {
      url: "/projects/shepwashi-dashboard/img13.png",
      className: "w-[350px] h-[200px] top-[250px] left-[0px] rotate-6",
    },
    {
      url: "/projects/eranpay/img5.png",
      className: "w-[350px] h-[200px] top-[368px] left-[215px] rotate-[-1deg]",
    },
    {
      url: "/projects/eranpay/img27.png",
      className: "w-[103px] h-[200px] top-[310px] left-[-57px] rotate-[-7deg]",
    },
    {
      url: "/projects/shepwashi/img11.png",
      className: "w-[103px] h-[200px] top-[385px] left-[40px] rotate-1",
    },
  ];

  const parsePx = (
    className: string,
    key: "top" | "left" | "w" | "h" | "rotate"
  ) => {
    try {
      if (key === "rotate") {
        const mDeg = className.match(/rotate-\[(-?\d+)deg\]/);
        if (mDeg) return parseInt(mDeg[1], 10);

        const m = className.match(/(?:^|\s)(-?rotate-?\d+)/);
        if (m) {
          const s = m[1].replace(/^rotate-?/, "").replace(/^-/, "-");
          return parseInt(s, 10);
        }
        return 0;
      }

      if (key === "w") {
        const m = className.match(/w-\[(-?\d+)px\]/);
        return m ? parseInt(m[1], 10) : null;
      }
      if (key === "h") {
        const m = className.match(/h-\[(-?\d+)px\]/);
        return m ? parseInt(m[1], 10) : null;
      }

      const m = className.match(new RegExp(`${key}-\\[(-?\\d+)px\\]`));
      return m ? parseInt(m[1], 10) : null;
    } catch (e) {
      return null;
    }
  };

  // -------------------- Animación intro -> organizar -> float --------------------
  useEffect(() => {
    let mounted = true;
    CustomEase.create(
      "hop",
      "M0,0 C0.355,0.022 0.448,0.079 0.5,0.5 0.542,0.846 0.615,1 1,1"
    );

    const run = async () => {
      const images = overlayImagesRef.current.filter(
        Boolean
      ) as HTMLDivElement[];
      const container = document.querySelector(
        ".hero-images-target"
      ) as HTMLElement | null;

      if (!images.length || !container || !mounted) {
        return;
      }

      await Promise.all(
        images.map(
          (el) =>
            new Promise<void>((resolve) => {
              const img = el?.querySelector("img");
              if (!img) return resolve();
              if ((img as HTMLImageElement).complete) return resolve();
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
        )
      );

      // ----- estado inicial: FULL-SCREEN reveal -----
      gsap.set(images, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        scale: 1.08,
        opacity: 0,
        objectFit: "cover",
        zIndex: (i: number) => 10 + i,
        border: "2px solid rgba(255,255,255,0)",
        borderRadius: "0px",
        rotate: 0,
        boxSizing: "border-box",
        visibility: "visible",
      });

      images.forEach((img) => {
        if (!img) return;
        img.style.willChange = "transform, opacity";
        img.style.backfaceVisibility = "hidden";
        (img.style as any).webkitBackfaceVisibility = "hidden";
        img.style.transformOrigin = "center center";
        img.style.pointerEvents = "none";
      });

      // aseguramos que overlays y texto izquierdo estén en estado inicial HIDDEN antes de iniciar
      if (overlayGradientRef.current) {
        overlayGradientRef.current.style.opacity = "0";
        overlayGradientRef.current.style.visibility = "hidden";
        overlayGradientRef.current.style.pointerEvents = "none";
      }
      if (lightRaysRef.current) {
        lightRaysRef.current.style.opacity = "0";
        lightRaysRef.current.style.visibility = "hidden";
        lightRaysRef.current.style.pointerEvents = "none";
      }
      if (leftTextRef.current) {
        // dejamos el texto oculto hasta que termine la organización
        gsap.set(leftTextRef.current, { x: -30, opacity: 0, force3D: true });
      }

      const tl = gsap.timeline();

      // reveal: una por una (stagger)
      tl.to(images, {
        opacity: 1,
        scale: 1,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.45,
      });

      // antes: tl.add(() => { ... Flip.from(...) }, "+=0.12");
      // reemplaza por esto:

      tl.add(() => {
        const state = Flip.getState(images);

        // --- prepara visibilidad pero sin mostrar (evita parpadeos si LightRays necesita mount) ---
        if (overlayGradientRef.current) {
          overlayGradientRef.current.style.visibility = "visible";
          overlayGradientRef.current.style.opacity = "0";
        }
        if (lightRaysRef.current) {
          lightRaysRef.current.style.visibility = "visible";
          lightRaysRef.current.style.opacity = "0";
        }

        // configuramos los estilos finales como ya los tenías
        images.forEach((el, i) => {
          const cls = IMAGES[i]?.className || "";
          const w = parsePx(cls, "w");
          const h = parsePx(cls, "h");
          const top = parsePx(cls, "top");
          const left = parsePx(cls, "left");
          const rot = parsePx(cls, "rotate") || 0;
          const finalW = w ?? 350;
          const finalH = h ?? Math.round(finalW * 0.6);

          el.style.position = "absolute";
          el.style.width = `${finalW}px`;
          el.style.height = `${finalH}px`;
          el.style.left = `${left ?? 0}px`;
          el.style.top = `${top ?? 0}px`;
          el.style.boxSizing = "border-box";
          el.style.border = "0 solid rgba(255,255,255,0)";

          el.style.borderRadius = "1rem";
          el.style.boxShadow = "0 0 30px #333";
          el.style.transform = `rotate(${rot}deg) translateZ(0)`;
          el.style.transformOrigin = "center center";
          el.style.willChange = "transform, opacity";
          el.style.backfaceVisibility = "hidden";
          (el.style as any).webkitBackfaceVisibility = "hidden";
          el.style.zIndex = `${70 + i}`;

          if (container && el.parentElement !== container) {
            container.appendChild(el);
          }
        });

        Flip.from(state, {
          duration: 1.4,
          ease: "hop",
          absolute: true,
          stagger: -0.18,

          // Cuando flip empiece, programamos la aparición 1s después
          onStart: () => {
            gsap.delayedCall(2, () => {
              const targets: Element[] = [];
              if (overlayGradientRef.current)
                targets.push(overlayGradientRef.current);
              if (lightRaysRef.current) targets.push(lightRaysRef.current);

              if (targets.length) {
                gsap.to(targets, {
                  opacity: 1,
                  duration: 3,
                  ease: "power2.out",
                });
              }
            });
          },

          onComplete: () => {
            // tu código onComplete existente (pop final, floating, animar texto, etc.)
            gsap.fromTo(
              images,
              { scale: 0.985 },
              { scale: 1, duration: 0.35, stagger: 0.02, ease: "power1.out" }
            );

            floatTweensRef.current.forEach((t) => t.kill());
            floatTweensRef.current = [];
            images.forEach((imgEl, ii) => {
              const t = gsap.to(imgEl, {
                y: "+=10",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                duration: 6 + ii,
                force3D: true,
                autoRound: false,
              });
              floatTweensRef.current.push(t);
            });

            if (leftTextRef.current) {
              gsap.to(leftTextRef.current, {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.05,
              });
            }
          },
        });
      }, "+=0.12");

      imagesTlRef.current = tl;
    };

    const raf = requestAnimationFrame(run);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      imagesTlRef.current?.kill();
      floatTweensRef.current.forEach((t) => t.kill());
      floatTweensRef.current = [];
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111]"
      style={{
        pointerEvents: isVisible ? "auto" : "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.4s ease-out",
      }}
    >
      {/* OVERLAY GRADIENT: iniciará oculto y se mostrará en el timeline justo antes de FLIP */}
      <div
        ref={overlayGradientRef}
        className="absolute inset-0 z-[1] overflow-hidden"
        style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a3a74] via-[#0a0a0a] to-[#1e3472]" />
      </div>

      {/* Lightrays: mismo comportamiento que el overlay */}
      <div
        ref={lightRaysRef}
        className="absolute inset-0 z-[2]"
        style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.5}
          followMouse
        />
      </div>

      <div className="relative z-[3] flex w-full h-full container">
        <div className="w-full h-full flex items-center justify-center">
          {/* Texto izquierdo: oculto hasta que terminen de organizar las imágenes */}
          <div ref={leftTextRef} className="w-[550px] flex flex-col gap-6 opacity-0">
            <h1 className="text-6xl font-bold text-white font-crimson italic text-end">
              Ideas que brillan en pantalla y que realmente funcionan
            </h1>
            <p className="text-[#ccc] text-xl text-end">
              Desde landing pages hasta dashboards utilizando patrones de diseño, componentes dinámicos y adaptables a cualquier pantalla para una mejor experiencia de usuario.
            </p>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          {/* CONTENEDOR objetivo: aqui se colocarán las imágenes finalizadas. */}
          <div className="relative w-[500px] h-[500px] hero-images-target">
            {IMAGES.map((img, i) => (
              <div
                key={i}
                ref={(el) => {
                  overlayImagesRef.current[i] = el;
                }}
                className={"absolute overflow-hidden"}
                style={{ visibility: "hidden" }}
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover"
                  alt={`hero-img-${i}`}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
