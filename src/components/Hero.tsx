import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import CustomEase from "gsap/CustomEase";
import LightRays from "./LightRays";

gsap.registerPlugin(Flip, CustomEase);

interface HeroProps {
  onScrollPastHero: () => void;
  isVisible?: boolean;
}

export default function Hero({
  onScrollPastHero,
  isVisible = true,
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);

  const overlayGradientRef = useRef<HTMLDivElement | null>(null);
  const lightRaysRef = useRef<HTMLDivElement | null>(null);

  const overlayImagesRef = useRef<Array<HTMLDivElement | null>>([]);
  const leftTextRef = useRef<HTMLDivElement | null>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const imagesTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const floatTweensRef = useRef<Array<gsap.core.Tween>>([]);
  const isAnimatingRef = useRef(false);

  const animationsDoneRef = useRef(false);
  const [, setAnimationsDone] = useState(false);

  const scrollProgressRef = useRef<number>(0);

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
      isMobile: true,
    },
    {
      url: "/projects/shepwashi/img11.png",
      className: "w-[103px] h-[200px] top-[385px] left-[40px] rotate-1",
      isMobile: true,
    },
  ];

  const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  // ------------------------
  // SCROLL BLOCK HELPERS
  // ------------------------
  const disableScrollGlobally = () => {
    try {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      // evitar gestos touch en navegadores que respetan touch-action
      document.documentElement.style.touchAction = "none";
      document.body.style.touchAction = "none";
    } catch (e) {
      // ignore
    }
  };

  const enableScrollGlobally = () => {
    try {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.style.touchAction = "";
      document.body.style.touchAction = "";
    } catch (e) {
      // ignore
    }
  };

  // ------------------ Text timeline (scroll-driven) ------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ paused: true });

    tl.to(
      scrollIndicatorRef.current,
      { y: 30, opacity: 0, duration: 0.3, ease: "power2.inOut" },
      0.1
    );

    const overlays = overlayImagesRef.current.filter(
      Boolean
    ) as HTMLDivElement[];

    if (overlays.length > 0) {
      const overlayMoveDuration = 2.4;
      const overlayStagger = 0.09;
      const overlayY = -420;

      tl.to(
        overlays,
        {
          y: overlayY,
          scale: 0.985,
          duration: overlayMoveDuration,
          ease: "power2.out",
          stagger: overlayStagger,
          force3D: true,
          autoRound: false,
          onStart: () => {
            try {
              floatTweensRef.current.forEach((t) => t.pause && t.pause());
            } catch {}
          },
          onReverseComplete: () => {
            try {
              floatTweensRef.current.forEach((t) => t.play && t.play());
            } catch {}
          },
        },
        0.05
      );

      if (leftTextRef.current) {
        tl.to(
          leftTextRef.current,
          {
            y: -400,
            duration: overlayMoveDuration,
            ease: "power2.out",
          },
          0.05
        );
      }
    }

    timelineRef.current = tl;
    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (timelineRef.current)
        timelineRef.current.progress(scrollProgressRef.current);
    }
  }, [isVisible]);

  useEffect(() => {
    CustomEase.create(
      "hop",
      "M0,0 C0.355,0.022 0.448,0.079 0.5,0.5 0.542,0.846 0.615,1 1,1"
    );
  }, []);

  // ---------------- Images intro -> arrange -> float (fixado para no romper Flip) ----------------
  useEffect(() => {
    let mounted = true;

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
        animationsDoneRef.current = true;
        setAnimationsDone(true);
        return;
      }

      // wait images loaded
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

      // estado inicial: FULL-SCREEN reveal
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
        borderRadius: "0px",
        boxShadow: "0 0 0 rgba(0,0,0,0)",
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
        gsap.set(leftTextRef.current, { x: -30, opacity: 0, force3D: true });
      }

      // timeline maestra: bloquea scroll en onStart y restaura en onComplete (incluye flipTween)
      const tl = gsap.timeline({
        onStart: () => {
          animationsDoneRef.current = false;
          setAnimationsDone(false);
          disableScrollGlobally();
        },
        onComplete: () => {
          animationsDoneRef.current = true;
          setAnimationsDone(true);
          enableScrollGlobally();
        },
      });

      // reveal: una por una
      tl.to(images, {
        opacity: 1,
        scale: 1,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.45,
      });

      // en el punto siguiente: ejecutamos una función que
      // 1) toma el state previo con Flip.getState(images)
      // 2) aplica el layout final en DOM (styles absolute, tamaño, left/top, rot)
      // 3) crea el tween Flip.from(...) y lo añade a la timeline (flipTween)
      tl.add(() => {
        // 1) capturamos estado antes de mover al layout final
        const state = Flip.getState(images);

        // hacer visibles overlays/lightrays para animarlos luego
        if (overlayGradientRef.current) {
          overlayGradientRef.current.style.visibility = "visible";
          overlayGradientRef.current.style.opacity = "0";
        }
        if (lightRaysRef.current) {
          lightRaysRef.current.style.visibility = "visible";
          lightRaysRef.current.style.opacity = "0";
        }

        // 2) aplicamos layout final (posicionamiento absoluto y estilos)
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
          // NO tocar transform aquí más que la rotación final (Flip animará la transición)
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

        // 3) creamos flipTween ahora (estado capturado + layout final aplicados)
        const flipDuration = 1.4;
        const flipTween = Flip.from(state, {
          duration: flipDuration,
          ease: "hop",
          absolute: true,
          stagger: -0.18,
          onStart: () => {
            // después de un delay hacemos aparecer overlays/lightrays
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
            // Al terminar FLIP: arrancan los floats y mostramos el texto izquierdo
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

            // asegurarse de que las imágenes quedan visibles e interactuables (si corresponde)
            images.forEach((el) => {
              try {
                (el as HTMLElement).style.visibility = "visible";
                (el as HTMLElement).style.pointerEvents = "auto";
              } catch {}
            });
          },
        });

        // añadimos flipTween a la misma timeline para que master tl espere su finalización
        tl.add(flipTween, "+=0");
      }, "+=0.12");

      imagesTimelineRef.current = tl;
    };

    const rafId = requestAnimationFrame(run);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      imagesTimelineRef.current?.kill();
      floatTweensRef.current.forEach((t) => t.kill());
      floatTweensRef.current = [];
      enableScrollGlobally();
    };
  }, []);

  // --------- Scroll-driven progress (controla timelineRef.progress) ----------
  useEffect(() => {
    if (!timelineRef.current) return;

    const SCROLL_RANGE = 1.8;
    const SHOW_PROJECTS_RATIO = 0.5;
    const SHOW_PROJECTS_AT = SCROLL_RANGE * SHOW_PROJECTS_RATIO;

    const FADE_BEFORE_RATIO = 0.08;
    const FADE_THRESHOLD = Math.max(
      0,
      SHOW_PROJECTS_AT - SCROLL_RANGE * FADE_BEFORE_RATIO
    );

    const HYSTERESIS = SCROLL_RANGE * 0.02;

    let touchStartY = 0;
    let rafId: number | null = null;

    const targetRef = { current: scrollProgressRef.current * SCROLL_RANGE };
    let running = false;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const hasShownEarlyRef = { current: false };
    const hasFadedRef = { current: false };
    const fadeTweenRef: { current?: gsap.core.Tween | null } = {
      current: null,
    };

    const getTargets = () => {
      const overlays = overlayImagesRef.current.filter(
        Boolean
      ) as HTMLElement[];
      const targets: Element[] = [...overlays];
      if (leftTextRef.current) targets.push(leftTextRef.current);
      return targets;
    };

    const ensureFloatTweens = (images: HTMLElement[]) => {
      // si ya existen, no crear; si existen pero fueron kill(), re-crear
      if (!floatTweensRef.current || floatTweensRef.current.length === 0) {
        floatTweensRef.current = [];
        images.forEach((imgEl, ii) => {
          try {
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
          } catch (e) {}
        });
      }
    };

    const revertFade = (force = false) => {
      if (!hasFadedRef.current && !force) return;
      hasFadedRef.current = false;

      const targets = getTargets();
      const images = overlayImagesRef.current.filter(Boolean) as HTMLElement[];

      // asegurar visibilidad antes de animar (evita que el tween no haga nada si visibility=hidden)
      targets.forEach((el) => {
        try {
          const h = el as HTMLElement;
          h.style.visibility = "visible";
          h.style.pointerEvents = "auto";
          // no tocar h.style.opacity aquí; gsap se encargará de animarlo
        } catch (e) {}
      });

      try {
        fadeTweenRef.current?.kill();
      } catch (e) {}

      fadeTweenRef.current = gsap.to(targets, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
        stagger: 0.02,
        overwrite: "auto",
        onStart: () => {
          try {
            if (floatTweensRef.current && floatTweensRef.current.length) {
              floatTweensRef.current.forEach((t) => t.play && t.play());
            } else {
              ensureFloatTweens(images);
            }
          } catch (e) {}
        },
        onComplete: () => {
          targets.forEach((el) => {
            try {
              const h = el as HTMLElement;
              h.style.opacity = "1";
              h.style.visibility = "visible";
              h.style.pointerEvents = "auto";
            } catch (e) {}
          });
        },
      });
    };

    const doFadeOut = () => {
      if (hasFadedRef.current) return;
      hasFadedRef.current = true;

      const targets = getTargets();
      /* const images = overlayImagesRef.current.filter(Boolean) as HTMLElement[]; */

      // pausar floats (si existen)
      try {
        floatTweensRef.current.forEach((t) => t.pause && t.pause());
      } catch (e) {}

      try {
        fadeTweenRef.current?.kill();
      } catch (e) {}

      fadeTweenRef.current = gsap.to(targets, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.02,
        overwrite: "auto",
        onComplete: () => {
          targets.forEach((el) => {
            try {
              const h = el as HTMLElement;
              h.style.opacity = "0";
              h.style.visibility = "hidden";
              h.style.pointerEvents = "none";
            } catch (e) {}
          });
        },
      });
    };

    const tick = () => {
      const desiredNormalized = targetRef.current / SCROLL_RANGE;
      const cur = scrollProgressRef.current;
      const next = lerp(cur, desiredNormalized, 0.12);
      scrollProgressRef.current = next;
      timelineRef.current!.progress(next);

      if (Math.abs(next - desiredNormalized) > 0.0005) {
        rafId = requestAnimationFrame(tick);
        running = true;
      } else {
        scrollProgressRef.current = desiredNormalized;
        timelineRef.current!.progress(desiredNormalized);
        running = false;
        rafId = null;
      }

      if (
        targetRef.current >= FADE_THRESHOLD &&
        !hasFadedRef.current &&
        animationsDoneRef.current
      ) {
        doFadeOut();
      }

      // Aquí usamos force=true para cubrir scrolls rápidos/entradas abruptas
      if (
        hasFadedRef.current &&
        targetRef.current < FADE_THRESHOLD - HYSTERESIS
      ) {
        revertFade(true);
      }

      if (
        !hasShownEarlyRef.current &&
        targetRef.current >= SHOW_PROJECTS_AT &&
        animationsDoneRef.current
      ) {
        hasShownEarlyRef.current = true;
        try {
          onScrollPastHero();
        } catch (e) {
          console.warn("onScrollPastHero early call failed", e);
        }
      }

      if (
        hasShownEarlyRef.current &&
        targetRef.current < SHOW_PROJECTS_AT - HYSTERESIS
      ) {
        hasShownEarlyRef.current = false;
      }

      if (
        targetRef.current >= SCROLL_RANGE - 0.0001 &&
        scrollProgressRef.current >= 0.995 &&
        !isAnimatingRef.current &&
        animationsDoneRef.current
      ) {
        if (!hasShownEarlyRef.current) {
          hasShownEarlyRef.current = true;
          isAnimatingRef.current = true;
          setTimeout(() => {
            onScrollPastHero();
            isAnimatingRef.current = false;
          }, 80);
        } else {
          isAnimatingRef.current = false;
        }
      }
    };

    // HANDLE WHEEL
    const handleWheel = (e: WheelEvent) => {
      if (!isVisible) return;
      if (!animationsDoneRef.current) {
        // bloquear completamente mientras arranca intro
        e.preventDefault?.();
        return;
      }

      const sensitivity = 0.00035;
      const deltaVirtual = e.deltaY * sensitivity;
      targetRef.current = clamp(
        targetRef.current + deltaVirtual,
        0,
        SCROLL_RANGE
      );

      if (!running) {
        rafId = requestAnimationFrame(tick);
        running = true;
      }
    };

    // HANDLE TOUCH
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isVisible) return;
      if (!animationsDoneRef.current) {
        // bloquear desplazamiento táctil mientras la intro no termine
        e.preventDefault();
        return;
      }

      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      const deltaVirtual = deltaY * 0.0009;
      targetRef.current = clamp(
        targetRef.current + deltaVirtual,
        0,
        SCROLL_RANGE
      );

      if (!running) {
        rafId = requestAnimationFrame(tick);
        running = true;
      }
    };

    // -------------------------
    // KEYBOARD BLOCK (SPACE/ARROWS/PgUp/PgDown/Home/End)
    // -------------------------
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (!animationsDoneRef.current) {
        const keysToBlock = [
          " ",
          "Spacebar", // legacy
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
        ];
        if (keysToBlock.includes(ev.key)) {
          ev.preventDefault();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      if (rafId) cancelAnimationFrame(rafId);
      try {
        fadeTweenRef.current?.kill();
      } catch {}
    };
  }, [isVisible, onScrollPastHero]);

  // ---------------- Text entry animation (intro) ----------------

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111]"
      style={{
        pointerEvents: isVisible ? "auto" : "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.4s ease-out",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#111]" />

        <div
          ref={overlayGradientRef}
          className="absolute inset-0 z-[1] overflow-hidden"
          style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a3a74] via-[#0a0a0a] to-[#1e3472]" />
        </div>

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
      </div>

      <div
        ref={containerRef}
        className="relative z-[3] flex w-full h-full container"
      >
        <div className="w-full h-full flex items-center justify-center">
          <div
            ref={leftTextRef}
            className="w-[550px] flex flex-col gap-6 opacity-0"
          >
            <span className="text-6xl font-bold text-white font-crimson italic text-end">
              Ideas que brillan en pantalla y que realmente funcionan
            </span>
            <span className="text-[#ccc] text-xl text-end">
              Desde landing pages hasta dashboards utilizando patrones de
              diseño, componentes dinámicos y adaptables a cualquier pantalla
              para una mejor experiencia de usuario.
            </span>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center relative">
          <div className="relative w-[500px] h-[500px] hero-images-target">
            {IMAGES.map((img, i) => (
              <div
                key={i}
                ref={(el) => {
                  overlayImagesRef.current[i] = el;
                }}
                className={
                  "absolute overflow-hidden flex justify-center items-center"
                }
                style={{ visibility: "hidden" }}
              >
                {img.isMobile && (
                  <img
                    src={img.url}
                    alt=""
                    className={`absolute w-full h-full object-cover blur-2xl z-[1]`}
                  />
                )}
                <img
                  src={img.url}
                  className={`w-full h-full relative z-[2] ${
                    img.isMobile ? "object-contain" : "object-cover"
                  }`}
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
