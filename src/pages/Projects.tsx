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
import { Button } from "@heroui/react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { PiLinkBold } from "react-icons/pi";
import { projectData } from "./data";

/* ---------------------------- Config ---------------------------- */
export type Project = {
  name: string;
  description: string;
  technologies: string[];
  image?: string;
  slides?: Array<{
    type: "image" | "video";
    src: string;
    thumb?: string;
    isContain?: boolean;
  }>;
  link?: string;
};

const config = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.05,
  BUFFER_SIZE: 5,
  MAX_VELOCITY: 150,
  SNAP_DURATION: 500,
  FADE_MS: 300, // fade duration for info/panels
};

/* minimal CSS to help rendering (still injected for media performance) */
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

/* Static overlay controls (unchanged visually, converted to Tailwind) */
function MinimapStaticControls({
  onPrev,
  onNext,
  bullets,
  activeIndex,
  onBulletClick,
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
        <Button
          isIconOnly
          radius="full"
          onPress={onPrev}
          className={`pointer-events-auto absolute -left-12 top-1/2 -translate-y-1/2 bg-black/60 text-white w-9 h-9 min-w-9 flex items-center justify-center`}
        >
          <FaArrowLeft className="text-white" size={14} />
        </Button>

        <Button
          isIconOnly
          radius="full"
          onPress={onNext}
          className={`pointer-events-auto absolute -right-12 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-9 h-9 min-w-9 flex items-center justify-center`}
        >
          <FaArrowRight className="text-white" size={14} />
        </Button>

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

  const [viewportH, setViewportH] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  const [visibleRangeState, setVisibleRangeState] = useState<{
    min: number;
    max: number;
  }>({
    min: -config.BUFFER_SIZE,
    max: config.BUFFER_SIZE,
  });

  const currentSwiperRef = useRef<any>(null);
  const [controlsState, setControlsState] = useState({
    bullets: 0,
    activeIndex: 0,
    counterText: "0 / 0",
  });

  const activeIndexRef = useRef<number>(0);

  useEffect(() => {
    const s = document.createElement("style");
    s.setAttribute("data-injected-minimap-small", "1");
    s.textContent = injectedSmallCss;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

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

  // ### NO-LOOP CHANGES: getProjectData no longer wraps with modulo
  const getProjectData = useCallback((index: number) => {
    if (index < 0 || index >= projectData.length) {
      // return a harmless placeholder so rendering doesn't crash
      return {
        name: "",
        description: "",
        technologies: [],
        image: undefined,
        slides: [],
      } as Project;
    }
    return projectData[index];
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

  useEffect(() => {
    for (let i = -config.BUFFER_SIZE; i <= config.BUFFER_SIZE; i++)
      ensureMapsHaveIndex(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    const state = stateRef.current;
    const totalProjects = projectData.length;

    // ### NO-LOOP HELPERS
    const clamp = (v: number, a: number, b: number) =>
      Math.max(a, Math.min(b, v));
    const clampIndex = (i: number) =>
      Math.max(0, Math.min(totalProjects - 1, i));
    const minTargetY = -(totalProjects - 1) * state.projectHeight;
    const maxTargetY = 0;

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

      // ### NO-LOOP: use clamped index instead of modulo
      const normalized = clampIndex(current);
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
        const panelOffset = state.currentY; // px
        state.panels.forEach((p: any, index: number) => {
          const targetY = index * viewportH + panelOffset;
          if (p.elRef?.current) {
            // position
            p.elRef.current.style.transform = `translate3d(0, ${targetY}px, 0)`;
            p.elRef.current.style.willChange = "transform, opacity";

            // determine which panel is the "active" visible one
            const currentIndex = Math.round(
              -state.targetY / state.projectHeight
            );
            // ### NO-LOOP: don't modulo, use plain indices
            const normalized = clampIndex(currentIndex);
            const panelNorm = index; // index corresponds to the panel's index in absolute terms

            // use class toggles for smooth fade in/out (Tailwind utilities)
            const el = p.elRef.current;
            if (normalized === panelNorm) {
              el.classList.remove("opacity-0", "pointer-events-none");
              el.classList.add("opacity-100", "pointer-events-auto");
            } else {
              el.classList.remove("opacity-100", "pointer-events-auto");
              el.classList.add("opacity-0", "pointer-events-none");
            }
          }
        });
      } catch {}

      // link static controls to visible wrapper's swiper
      const current = Math.round(-state.targetY / state.projectHeight);
      const clampedCurrent = clampIndex(current);
      const visibleItem = state.minimapInfo.get(clampedCurrent);
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

      // ### NO-LOOP: SNAP uses clamped index and clamp snap point
      if (
        !state.isSnapping &&
        !state.isDragging &&
        now - state.lastScrollTime > 100
      ) {
        let snapIndex = Math.round(-state.targetY / state.projectHeight);
        snapIndex = clampIndex(snapIndex);
        const snapPoint = -snapIndex * state.projectHeight;
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
        // clamp targetY after snap interpolation
        state.targetY = clamp(state.targetY, minTargetY, maxTargetY);
        if (progress >= 1) state.isSnapping = false;
      }

      if (!state.isDragging) {
        state.currentY += (state.targetY - state.currentY) * config.LERP_FACTOR;
      }

      syncElements();
      updatePositions();

      rafRef.current = requestAnimationFrame(animate);
    };

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
      // ### NO-LOOP: clamp immediately so we never go out-of-bounds
      state.targetY = clamp(state.targetY, minTargetY, maxTargetY);
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
      // ### NO-LOOP: clamp when dragging
      state.targetY = clamp(state.targetY, minTargetY, maxTargetY);
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
      // recalc minTargetY based on new height
      // note: minTargetY calculated above is based on previous height; update by setting targetY/clamps below
      state.targetY = clamp(
        state.targetY,
        -(projectData.length - 1) * state.projectHeight,
        0
      );
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
        {/* LEFT PANELS COLUMN */}
        <div className="left-panels absolute left-6 top-0 z-[20] pointer-events-none w-[calc(50%-150px)] h-screen overflow-visible">
          {indicesToRender.map((index) => {
            const panelEntry = stateRef.current.panels.get(index);
            const elRef =
              panelEntry?.elRef ?? React.createRef<HTMLDivElement>();
            if (!panelEntry) stateRef.current.panels.set(index, { elRef });

            const project = getProjectData(index);

            return (
              <div
                ref={elRef}
                key={`left-panel-${index}`}
                aria-hidden="false"
                style={{
                  transform: `translate3d(0, ${index * viewportH}px, 0)`,
                }}
                className="absolute left-0 w-full h-screen transform transition-opacity duration-300 ease-out will-change-transform opacity-0 pointer-events-none"
              >
                <div className="w-full h-full flex items-center justify-end p-6 box-border text-white text-right">
                  <div className="max-w-[400px] flex flex-col gap-2">
                    <div className="w-full flex gap-2 justify-end items-center">
                      <h3 className="text-4xl font-semibold">{project.name}</h3>
                      {project.link && (
                        <a
                          href={project?.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir ${project.name} en nueva pestaña`}
                        >
                          <Button
                            isIconOnly
                            size="sm"
                            radius="full"
                            className="bg-[#00000036] mt-1"
                          >
                            <PiLinkBold color="#fff" size={18} />
                          </Button>
                        </a>
                      )}
                    </div>
                    <p className="text-lg leading-6 text-[#aaa]">
                      {project.description}
                    </p>
                    <div className="flex justify-end flex-wrap gap-2 mt-2">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className="text-sm px-3 py-1 bg-[#ffffff1c] rounded-full"
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
                  className="w-full h-full object-cover filter blur-[50px] brightness-40"
                  decoding="async"
                />
              </li>
            );
          })}
        </ul>

        {/* minimap */}
        <div
          className="minimap fixed top-1/2 z-30 pointer-events-auto"
          style={{
            left: "65%",
            transform: "translate(-50%, -50%)",
            width: "32%",
            height: 400,
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
