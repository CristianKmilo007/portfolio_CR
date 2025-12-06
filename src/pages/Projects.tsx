// src/pages/Projects.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { JSX } from "react";
import SlideImages from "../components/SlidesImages";

/* ----------------------------
  Data & config (con metadata)
---------------------------- */
type Project = {
  name: string;
  description: string;
  technologies: string[];
  image?: string;
  slides?: Array<{ type: "image" | "video"; src: string; thumb?: string }>;
};

const projectData: Project[] = [
  {
    name: "Portfolio Website",
    description:
      "Diseño moderno con transiciones fluidas y microinteracciones.",
    technologies: ["React", "TypeScript", "Tailwind", "GSAP"],
    slides: [
      { type: "image", src: "/projects/img_1.jpg" },
      { type: "image", src: "/projects/img_2.jpg" },
      { type: "image", src: "/projects/img_3.jpg" },
    ],
    image: "/projects/img_1.jpg",
  },
  {
    name: "Dashboard Analytics",
    description: "Dashboard interactivo con visualizaciones en tiempo real.",
    technologies: ["React", "Zustand", "ChartJS"],
    slides: [
      { type: "image", src: "/projects/img_2.jpg" },
      {
        type: "video",
        src: "/projects/proj2/clip_1.mp4",
        thumb: "/projects/proj2/clip_1_poster.jpg",
      },
      { type: "image", src: "/projects/img_3.jpg" },
      { type: "image", src: "/projects/img_4.jpg" },
    ],
    image: "/projects/img_2.jpg",
  },
  {
    name: "E-commerce Store",
    description: "Catálogo animado con soporte de video y filtros en vivo.",
    technologies: ["Next.js", "Framer Motion", "Stripe"],
    slides: [
      {
        type: "video",
        src: "/projects/proj3/hero.mp4",
        thumb: "/projects/proj3/hero_poster.jpg",
      },
      { type: "image", src: "/projects/img_3.jpg" },
      { type: "image", src: "/projects/img_4.jpg" },
    ],
    image: "/projects/img_3.jpg",
  },
  {
    name: "Landing Page Motion",
    description: "Landing con parallax y microanimaciones para conversión.",
    technologies: ["GSAP", "React"],
    slides: [
      { type: "image", src: "/projects/img_5.jpg" },
      { type: "image", src: "/projects/img_1.jpg" },
    ],
    image: "/projects/img_5.jpg",
  },
  {
    name: "Mobile App UI",
    description: "Prototipo UI/UX para app móvil con animaciones inmersivas.",
    technologies: ["React Native", "Expo"],
    slides: [
      { type: "image", src: "/projects/img_1.jpg" },
      {
        type: "video",
        src: "/projects/proj5/demo.mp4",
        thumb: "/projects/proj5/demo_poster.jpg",
      },
    ],
    image: "/projects/img_1.jpg",
  },
];

const config = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.05,
  BUFFER_SIZE: 5,
  MAX_VELOCITY: 150,
  SNAP_DURATION: 500,
};

/* minimal CSS to help rendering */
const injectedSmallCss = `
.projects-root .mySwiper .swiper-slide img,
.projects-root .mySwiper .swiper-slide video,
.projects-root .minimap-info-media-wrapper img,
.projects-root .minimap-info-media-wrapper video {
  transform-origin: center top;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: none !important;
}
`;

/* Static overlay controls (unchanged) */
function MinimapStaticControls({
  onPrev,
  onNext,
  bullets,
  activeIndex,
  onBulletClick,
  counterText,
  innerRef,
}: {
  onPrev: () => void;
  onNext: () => void;
  bullets: number;
  activeIndex: number;
  onBulletClick: (i: number) => void;
  counterText: string;
  innerRef: any;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[9] minimap-static-controls">
      <div ref={innerRef} className="absolute inset-0 pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="pointer-events-auto absolute -left-12 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center"
          aria-label="Anterior"
          title="Anterior"
        >
          ‹
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="pointer-events-auto absolute -right-12 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center"
          aria-label="Siguiente"
          title="Siguiente"
        >
          ›
        </button>

        <div className="pointer-events-auto absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: bullets }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onBulletClick(i);
              }}
              className={`w-2 h-2 rounded-full ${
                i === activeIndex ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Ir a ${i + 1}`}
            />
          ))}
        </div>

        <div className="pointer-events-auto absolute -top-8 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
          {counterText}
        </div>
      </div>
    </div>
  );
}

/* ---------- Projects component (JSX + Tailwind) ---------- */
export default function Projects(): JSX.Element {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const projectListRef = useRef<HTMLUListElement | null>(null);
  const minimapWrapperRef = useRef<HTMLDivElement | null>(null);
  const minimapImgPreviewRef = useRef<HTMLDivElement | null>(null);
  const minimapInfoListRef = useRef<HTMLDivElement | null>(null);
  const controlsInnerRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const animTimersRef = useRef<number[]>([]);

  // mutable state kept in ref (same approach as tu implementación original)
  const stateRef = useRef<any>({
    currentY: 0,
    targetY: 0,
    isDragging: false,
    projects: new Map<
      number,
      { elRef: React.RefObject<HTMLDivElement>; parallax: any }
    >(),
    minimap: new Map<
      number,
      { elRef: React.RefObject<HTMLDivElement>; parallax: any }
    >(),
    minimapInfo: new Map<number, any>(),
    panels: new Map<number, { elRef: React.RefObject<HTMLDivElement> }>(),
    projectHeight: typeof window !== "undefined" ? window.innerHeight : 800,
    minimapHeight: 400,
    isSnapping: false,
    snapStart: { time: 0, y: 0, target: 0 },
    lastScrollTime: Date.now(),
    visibleRange: { min: -config.BUFFER_SIZE, max: config.BUFFER_SIZE },
  });

  // reactive viewport height (used as panel height = 100vh)
  const [viewportH, setViewportH] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  // React-driven visible range (triggers JSX updates)
  const [visibleRangeState, setVisibleRangeState] = useState<{
    min: number;
    max: number;
  }>({
    min: -config.BUFFER_SIZE,
    max: config.BUFFER_SIZE,
  });

  // Swiper controls state
  const currentSwiperRef = useRef<any>(null);
  const [controlsState, setControlsState] = useState({
    bullets: 0,
    activeIndex: 0,
    counterText: "0 / 0",
  });

  // active index (normalized)
  const activeIndexRef = useRef<number>(0);

  // inject helper css once
  useEffect(() => {
    const s = document.createElement("style");
    s.setAttribute("data-injected-minimap-small", "1");
    s.textContent = injectedSmallCss;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  // keep viewportH / projectHeight in sync on resize
  useEffect(() => {
    const onResize = () => {
      const h = window.innerHeight;
      setViewportH(h);
      stateRef.current.projectHeight = h;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* -----------------------
     Parallax helper (optimized)
  ------------------------*/
  const createParallax = useCallback(
    (container: HTMLElement | null, height: number) => {
      let current = 0;
      let mediaEl: HTMLElement | null = null;
      if (container) {
        if (container.tagName === "IMG" || container.tagName === "VIDEO") {
          mediaEl = container as HTMLElement;
        } else {
          mediaEl =
            (container.querySelector(
              ".swiper-slide-active img, .swiper-slide-active video, img, video"
            ) as HTMLElement | null) ||
            (container.querySelector("img, video") as HTMLElement | null);
        }
      }
      if (mediaEl) {
        try {
          mediaEl.style.willChange = "transform";
          mediaEl.style.transition = "transform 0s linear";
          if (!mediaEl.style.transform)
            mediaEl.style.transform = "translate3d(0,0,0)";
        } catch {}
      }
      return {
        update: (scroll: number, index: number) => {
          if (!mediaEl) return;
          const intensity = 0.18;
          const target = (-scroll - index * height) * intensity;
          current = current + (target - current) * 0.12;
          try {
            const rounded = Math.round(current * 100) / 100;
            mediaEl.style.transform = `translate3d(0, ${rounded}px, 0)`;
          } catch {}
        },
        destroy: () => {
          if (mediaEl) {
            try {
              mediaEl.style.transform = "";
              mediaEl.style.willChange = "";
              mediaEl.style.transition = "";
            } catch {}
          }
        },
      };
    },
    []
  );

  /* ---------- helpers ---------- */
  const getProjectData = useCallback((index: number) => {
    const i =
      ((Math.abs(index) % projectData.length) + projectData.length) %
      projectData.length;
    return projectData[i];
  }, []);

  const findSwiperInWrapper = useCallback((wrapper: HTMLElement | null) => {
    if (!wrapper) return null;
    const swiperEl = wrapper.querySelector<HTMLElement>(".mySwiper, .swiper");
    return (swiperEl as any)?.swiper ?? null;
  }, []);

  const ensureMapsHaveIndex = useCallback((index: number) => {
    const state = stateRef.current;
    if (!state.projects.has(index))
      state.projects.set(index, {
        elRef: React.createRef<HTMLDivElement>(),
        parallax: null,
      });
    if (!state.minimap.has(index))
      state.minimap.set(index, {
        elRef: React.createRef<HTMLDivElement>(),
        parallax: null,
      });
    if (!state.minimapInfo.has(index))
      state.minimapInfo.set(index, {
        elRef: React.createRef<HTMLDivElement>(),
        wrapperRef: React.createRef<HTMLDivElement>(),
        rootMounted: false,
        parallax: null,
        swiper: null,
      });
    if (!state.panels.has(index))
      state.panels.set(index, { elRef: React.createRef<HTMLDivElement>() });
  }, []);

  /* build initial buffer refs */
  useEffect(() => {
    for (let i = -config.BUFFER_SIZE; i <= config.BUFFER_SIZE; i++)
      ensureMapsHaveIndex(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* attach parallax for visible range */
  useEffect(() => {
    const state = stateRef.current;
    const { min, max } = state.visibleRange;
    for (let i = min; i <= max; i++) {
      try {
        const p = state.projects.get(i);
        if (p && !p.parallax && p.elRef.current) {
          const media = p.elRef.current.querySelector(
            "img, video"
          ) as HTMLElement | null;
          p.parallax = createParallax(media, state.projectHeight);
        }
      } catch {}
      try {
        const mi = state.minimapInfo.get(i);
        if (mi && !mi.parallax && mi.wrapperRef?.current) {
          const media = mi.wrapperRef.current.querySelector(
            "img, video"
          ) as HTMLElement | null;
          mi.parallax = createParallax(media, state.minimapHeight);
        }
      } catch {}
    }

    return () => {
      state.projects.forEach((it: any) => {
        try {
          it.parallax?.destroy?.();
        } catch {}
      });
      state.minimap.forEach((it: any) => {
        try {
          it.parallax?.destroy?.();
        } catch {}
      });
      state.minimapInfo.forEach((it: any) => {
        try {
          it.parallax?.destroy?.();
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleRangeState.min, visibleRangeState.max, createParallax]);

  const setTransformIfChanged = useCallback(
    (el: HTMLElement, value: string) => {
      if (el.style.transform !== value) el.style.transform = value;
    },
    []
  );

  /* ---------- main loop: sync + update positions ---------- */
  useEffect(() => {
    const state = stateRef.current;

    const syncElements = () => {
      const current = Math.round(-state.targetY / state.projectHeight);
      const min = current - config.BUFFER_SIZE;
      const max = current + config.BUFFER_SIZE;

      for (let i = min; i <= max; i++) ensureMapsHaveIndex(i);

      const pruneMap = (map: Map<number, any>) => {
        map.forEach((item: any, idx: number) => {
          if (idx < min || idx > max) {
            try {
              item.parallax?.destroy?.();
            } catch {}
            // keep refs to avoid remount churn
          }
        });
      };
      pruneMap(state.projects);
      pruneMap(state.minimap);
      pruneMap(state.minimapInfo);

      if (state.visibleRange.min !== min || state.visibleRange.max !== max) {
        state.visibleRange = { min, max };
        setVisibleRangeState({ min, max });
      }

      // update active index normalized
      const normalized =
        ((current % projectData.length) + projectData.length) %
        projectData.length;
      if (activeIndexRef.current !== normalized) {
        activeIndexRef.current = normalized;
      }
    };

    const updatePositions = () => {
      const minimapY =
        (state.currentY * state.minimapHeight) / state.projectHeight;

      // projects (backgrounds)
      state.projects.forEach((item: any, index: number) => {
        try {
          const y = index * state.projectHeight + state.currentY;
          if (item.elRef?.current)
            setTransformIfChanged(item.elRef.current, `translateY(${y}px)`);
          item.parallax?.update(state.currentY, index);
        } catch {}
      });

      // minimap items
      state.minimap.forEach((item: any, index: number) => {
        try {
          const y = index * state.minimapHeight + minimapY;
          if (item.elRef?.current)
            setTransformIfChanged(item.elRef.current, `translateY(${y}px)`);
          item.parallax?.update(minimapY, index);
        } catch {}
      });

      // minimap info wrappers (SlideImages)
      state.minimapInfo.forEach((item: any, index: number) => {
        try {
          const y = index * state.minimapHeight + minimapY;
          if (item.elRef?.current)
            setTransformIfChanged(item.elRef.current, `translateY(${y}px)`);
          item.parallax?.update(minimapY, index);
        } catch {}
      });

      // PANEL COLUMN SYNC (100vh blocks)
      try {
        // panelOffset: how much we translate the entire column so panels align per viewport
        // since each panel is exactly projectHeight (viewportH), we simply apply state.currentY
        const panelOffset = state.currentY; // px
        state.panels.forEach((p: any, index: number) => {
          const targetY = index * viewportH + panelOffset;
          if (p.elRef?.current) {
            p.elRef.current.style.transform = `translate3d(0, ${targetY}px, 0)`;
            p.elRef.current.style.willChange = "transform, opacity";
            // highlight only the panel whose index matches the visible project
            const currentIndex = Math.round(
              -state.targetY / state.projectHeight
            );
            const normalized =
              ((currentIndex % projectData.length) + projectData.length) %
              projectData.length;
            const panelNorm =
              ((index % projectData.length) + projectData.length) %
              projectData.length;
            if (normalized === panelNorm) {
              p.elRef.current.style.opacity = "1";
              p.elRef.current.style.pointerEvents = "auto";
            } else {
              p.elRef.current.style.opacity = "0.45";
              p.elRef.current.style.pointerEvents = "none";
            }
          }
        });
      } catch {}

      // link static controls to visible wrapper's swiper
      const current = Math.round(-state.targetY / state.projectHeight);
      const visibleItem = state.minimapInfo.get(current);
      if (visibleItem) {
        const swiperInst =
          visibleItem.swiper ??
          findSwiperInWrapper(visibleItem.wrapperRef.current);
        currentSwiperRef.current = swiperInst ?? null;

        if (swiperInst) {
          try {
            const slidesCount =
              swiperInst.originalSlideCount ?? swiperInst.slides?.length ?? 0;
            const activeIdx =
              typeof swiperInst.realIndex === "number"
                ? swiperInst.realIndex
                : swiperInst.activeIndex ?? 0;
            const counterText = `${
              Math.min(Math.max(0, activeIdx), Math.max(0, slidesCount - 1)) + 1
            } / ${Math.max(0, slidesCount)}`;
            setControlsState({
              bullets: Math.max(0, slidesCount),
              activeIndex: activeIdx,
              counterText,
            });
            if (!swiperInst.__staticControlsHooked) {
              swiperInst.__staticControlsHooked = true;
              swiperInst.on?.("slideChange", () => {
                const a =
                  typeof swiperInst.realIndex === "number"
                    ? swiperInst.realIndex
                    : swiperInst.activeIndex ?? 0;
                const sCount =
                  swiperInst.originalSlideCount ??
                  swiperInst.slides?.length ??
                  0;
                setControlsState({
                  bullets: Math.max(0, sCount),
                  activeIndex: a,
                  counterText: `${a + 1} / ${Math.max(0, sCount)}`,
                });
              });
            }
          } catch {}
        } else {
          setControlsState({
            bullets: 0,
            activeIndex: 0,
            counterText: "0 / 0",
          });
        }
      } else {
        setControlsState({ bullets: 0, activeIndex: 0, counterText: "0 / 0" });
        currentSwiperRef.current = null;
      }
    };

    const animate = () => {
      const now = Date.now();

      if (
        !state.isSnapping &&
        !state.isDragging &&
        now - state.lastScrollTime > 100
      ) {
        const snapPoint =
          -Math.round(-state.targetY / state.projectHeight) *
          state.projectHeight;
        if (Math.abs(state.targetY - snapPoint) > 1) {
          state.isSnapping = true;
          state.snapStart.time = Date.now();
          state.snapStart.y = state.targetY;
          state.snapStart.target = snapPoint;
        }
      }

      if (state.isSnapping) {
        const progress = Math.min(
          (Date.now() - state.snapStart.time) / config.SNAP_DURATION,
          1
        );
        const eased = 1 - Math.pow(1 - progress, 3);
        state.targetY =
          state.snapStart.y +
          (state.snapStart.target - state.snapStart.y) * eased;
        if (progress >= 1) state.isSnapping = false;
      }

      if (!state.isDragging) {
        state.currentY += (state.targetY - state.currentY) * config.LERP_FACTOR;
      }

      syncElements();
      updatePositions();

      rafRef.current = requestAnimationFrame(animate);
    };

    // input handlers
    const wheelHandler = (e: WheelEvent) => {
      if (rootRef.current && !(e.target as Element).closest?.(".projects-root"))
        return;
      e.preventDefault();
      state.isSnapping = false;
      state.lastScrollTime = Date.now();
      const delta = Math.max(
        Math.min(e.deltaY * config.SCROLL_SPEED, config.MAX_VELOCITY),
        -config.MAX_VELOCITY
      );
      state.targetY -= delta;
    };

    const touchStart = (e: TouchEvent) => {
      if (rootRef.current && !(e.target as Element).closest?.(".projects-root"))
        return;
      state.isDragging = true;
      state.isSnapping = false;
      state.dragStart = { y: e.touches[0].clientY, scrollY: state.targetY };
      state.lastScrollTime = Date.now();
    };
    const touchMove = (e: TouchEvent) => {
      if (!state.isDragging) return;
      state.targetY =
        state.dragStart.scrollY +
        (e.touches[0].clientY - state.dragStart.y) * 1.5;
      state.lastScrollTime = Date.now();
    };
    const touchEnd = () => {
      state.isDragging = false;
    };

    window.addEventListener("wheel", wheelHandler, {
      passive: false,
    } as AddEventListenerOptions);
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("touchend", touchEnd);

    const onResize = () => {
      state.projectHeight = window.innerHeight;
      // force sync
      syncElements();
      updatePositions();
    };
    window.addEventListener("resize", onResize);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("wheel", wheelHandler as EventListener);
      window.removeEventListener("touchstart", touchStart as EventListener);
      window.removeEventListener("touchmove", touchMove as EventListener);
      window.removeEventListener("touchend", touchEnd as EventListener);
      window.removeEventListener("resize", onResize as EventListener);
      animTimersRef.current.forEach((t) => clearTimeout(t));
      animTimersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ensureMapsHaveIndex,
    findSwiperInWrapper,
    setTransformIfChanged,
    viewportH,
  ]);

  /* overlay controls */
  const handlePrev = useCallback(() => {
    try {
      currentSwiperRef.current?.slidePrev?.();
    } catch {}
  }, []);
  const handleNext = useCallback(() => {
    try {
      currentSwiperRef.current?.slideNext?.();
    } catch {}
  }, []);
  const handleBulletClick = useCallback((i: number) => {
    try {
      const s = currentSwiperRef.current;
      if (!s) return;
      if (typeof s.slideToLoop === "function") s.slideToLoop(i);
      else s.slideTo(i);
    } catch {}
  }, []);

  const indicesToRender = useMemo(() => {
    const arr: number[] = [];
    for (let i = visibleRangeState.min; i <= visibleRangeState.max; i++)
      arr.push(i);
    return arr;
  }, [visibleRangeState]);

  /* ---------- JSX Render ---------- */
  return (
    <div ref={rootRef} className="w-full projects-root">
      <div className="content fixed w-full h-screen overflow-hidden pointer-events-none">
        {/* LEFT PANELS COLUMN (INSIDE content but OUTSIDE minimap)
            Each panel now has height = viewportH (100vh) and its content is centered vertically.
            Panels are positioned absolutely and moved imperatively so they behave like vertical slider blocks.
        */}
        <div
          className="left-panels absolute left-6 top-0 z-[20] pointer-events-none"
          style={{ width: 320, height: "100vh", overflow: "visible" }}
        >
          {/** Use indicesToRender (virtual indices range), not projectData.length */}
          {indicesToRender.map((index) => {
            // ensure panel ref exists for this virtual index
            const panelEntry = stateRef.current.panels.get(index);
            const elRef =
              panelEntry?.elRef ?? React.createRef<HTMLDivElement>();
            if (!panelEntry) stateRef.current.panels.set(index, { elRef });

            // map virtual index to the project object (handles looping)
            const project = getProjectData(index);

            return (
              <div
                ref={elRef}
                key={`left-panel-${index}`}
                aria-hidden="false"
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  height: viewportH, // 100vh block
                  transform: `translate3d(0, ${index * viewportH}px, 0)`,
                  transition: "transform 0.12s linear, opacity 0.12s linear",
                  pointerEvents: "none",
                  opacity: 0.6,
                }}
                className="bg-transparent backdrop-blur-sm rounded"
              >
                {/* centered content */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    boxSizing: "border-box",
                    color: "white",
                  }}
                >
                  <div style={{ maxWidth: 320 }}>
                    <h3
                      style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}
                    >
                      {project.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.9)",
                        marginBottom: 12,
                      }}
                    >
                      {project.description}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 12,
                            padding: "6px 10px",
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 999,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* main project list (absolute-positioned backgrounds) */}
        <ul
          ref={projectListRef}
          className="project-list relative w-full h-screen list-none pointer-events-auto"
        >
          {indicesToRender.map((index) => {
            const mapItem = stateRef.current.projects.get(index);
            const elRef = mapItem?.elRef ?? React.createRef<HTMLDivElement>();
            if (!mapItem)
              stateRef.current.projects.set(index, { elRef, parallax: null });

            const data = getProjectData(index);
            return (
              <li
                key={`proj-${index}`}
                ref={elRef}
                className="project absolute w-full h-screen will-change-transform overflow-hidden top-0 left-0"
                style={{ transform: "translateY(0px)" }}
              >
                <img
                  src={data.image}
                  alt={`bg-${index}`}
                  className="w-full h-full object-cover filter blur-[50px] brightness-20"
                  decoding="async"
                />
              </li>
            );
          })}
        </ul>

        {/* minimap */}
        <div
          className="minimap fixed"
          style={{
            top: "50%",
            left: "65%",
            transform: "translate(-50%, -50%)",
            width: "30%",
            height: 400,
            zIndex: 30,
            pointerEvents: "auto",
          }}
        >
          <div
            className="minimap-wrapper relative w-full h-full rounded-2xl"
            ref={minimapWrapperRef}
          >
            <div
              ref={minimapImgPreviewRef}
              className="minimap-img-preview absolute inset-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none"
            ></div>

            <div
              ref={minimapInfoListRef}
              className="minimap-info-list relative w-full h-full overflow-hidden rounded-2xl"
            >
              {indicesToRender.map((index) => {
                const miItem = stateRef.current.minimapInfo.get(index);
                const elRef =
                  miItem?.elRef ?? React.createRef<HTMLDivElement>();
                const wrapperRef =
                  miItem?.wrapperRef ?? React.createRef<HTMLDivElement>();
                if (!miItem)
                  stateRef.current.minimapInfo.set(index, {
                    elRef,
                    wrapperRef,
                    rootMounted: false,
                    parallax: null,
                    swiper: null,
                  });

                const data = getProjectData(index);
                const slides =
                  Array.isArray(data.slides) && data.slides.length > 0
                    ? data.slides
                    : data.image
                    ? [{ type: "image", src: data.image }]
                    : [];

                return (
                  <div
                    key={`info-${index}`}
                    ref={elRef}
                    className="minimap-item-info absolute w-full h-[400px] flex flex-col justify-between will-change-transform"
                    style={{ top: 0, left: 0 }}
                  >
                    <div
                      ref={wrapperRef}
                      className="minimap-info-media-wrapper absolute inset-0 w-full h-full pointer-events-auto opacity-100 transition-opacity duration-300"
                      data-react-mounted="0"
                    >
                      <SlideImages slides={slides} thumbs={false} />
                    </div>
                    <div className="minimap-item-info-row w-full flex justify-between p-2 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>

            <MinimapStaticControls
              onPrev={handlePrev}
              onNext={handleNext}
              bullets={controlsState.bullets}
              activeIndex={controlsState.activeIndex}
              onBulletClick={handleBulletClick}
              counterText={controlsState.counterText}
              innerRef={controlsInnerRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
