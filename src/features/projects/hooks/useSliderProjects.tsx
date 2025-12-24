import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { projectData } from "../data";
import { useResponsive } from "../../../hooks/useMediaQuery";

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

interface useSliderProjectsProps {
  isActive?: boolean;
  onScrollToHero?: () => void;
}

export const useSliderProjects = ({
  isActive,
  onScrollToHero,
}: useSliderProjectsProps) => {
  const { isDesktop2XL, isDesktopXL, isLaptop, isMobile } = useResponsive();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const projectListRef = useRef<HTMLUListElement | null>(null);
  const minimapWrapperRef = useRef<HTMLDivElement | null>(null);
  const minimapImgPreviewRef = useRef<HTMLDivElement | null>(null);
  const minimapInfoListRef = useRef<HTMLDivElement | null>(null);
  const controlsInnerRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const animTimersRef = useRef<number[]>([]);

  const config = {
    SCROLL_SPEED: 1,
    LERP_FACTOR: 0.1,
    BUFFER_SIZE: 5,
    MAX_VELOCITY: 200,
    SNAP_DURATION: 300,
    FADE_MS: 300,
  };

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
    projectHeight:
      typeof window !== "undefined"
        ? window.innerHeight
        : isDesktop2XL
        ? 700
        : 800,
    minimapHeight: isDesktop2XL ? 350 : 400,
    isSnapping: false,
    snapStart: { time: 0, y: 0, target: 0 },
    lastScrollTime: Date.now(),
    visibleRange: { min: -config.BUFFER_SIZE, max: config.BUFFER_SIZE },
  });

  const [viewportH, setViewportH] = useState<number>(
    typeof window !== "undefined"
      ? window.innerHeight
      : isDesktop2XL
      ? 700
      : 800
  );
  const [viewportW, setViewportW] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
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
      const w = window.innerWidth;
      setViewportH(h);
      setViewportW(w);
      stateRef.current.projectHeight = h;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isDesktop2XL]);

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

  const getProjectData = useCallback((index: number) => {
    if (index < 0 || index >= projectData.length) {
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
  }, [ensureMapsHaveIndex]);

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
  }, [
    visibleRangeState.min,
    visibleRangeState.max,
    createParallax,
    isDesktop2XL,
  ]);

  const setTransformIfChanged = useCallback(
    (el: HTMLElement, value: string) => {
      if (el.style.transform !== value) el.style.transform = value;
    },
    []
  );

  useEffect(() => {
    const state = stateRef.current;
    const totalProjects = projectData.length;

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

      const normalized = clampIndex(current);
      if (activeIndexRef.current !== normalized) {
        activeIndexRef.current = normalized;
      }
    };

    const updatePositions = () => {
      const minimapY =
        (state.currentY * state.minimapHeight) / state.projectHeight;

      state.projects.forEach((item: any, index: number) => {
        try {
          const y = index * state.projectHeight + state.currentY;
          if (item.elRef?.current)
            setTransformIfChanged(item.elRef.current, `translateY(${y}px)`);
          item.parallax?.update(state.currentY, index);
        } catch {}
      });

      state.minimap.forEach((item: any, index: number) => {
        try {
          const y = index * state.minimapHeight + minimapY;
          if (item.elRef?.current)
            setTransformIfChanged(item.elRef.current, `translateY(${y}px)`);
          item.parallax?.update(minimapY, index);
        } catch {}
      });

      state.minimapInfo.forEach((item: any, index: number) => {
        try {
          const y = index * state.minimapHeight + minimapY;
          if (item.elRef?.current)
            setTransformIfChanged(item.elRef.current, `translateY(${y}px)`);
          item.parallax?.update(minimapY, index);
        } catch {}
      });

      try {
        const panelOffset = state.currentY;

        // Si estamos en laptop, queremos que los panels se muevan horizontalmente.
        const isHorizontal = !!isLaptop;
        const mappedOffsetX = (panelOffset * viewportW) / state.projectHeight;

        state.panels.forEach((p: any, index: number) => {
          if (!p.elRef?.current) return;

          if (isHorizontal) {
            const targetX = index * viewportW + mappedOffsetX;
            p.elRef.current.style.transform = `translate3d(${targetX}px, 0, 0)`;
          } else {
            const targetY = index * viewportH + panelOffset;
            p.elRef.current.style.transform = `translate3d(0, ${targetY}px, 0)`;
          }

          p.elRef.current.style.willChange = "transform, opacity";

          const currentIndex = Math.round(-state.targetY / state.projectHeight);
          const normalized = clampIndex(currentIndex);
          const panelNorm = index;

          const el = p.elRef.current;
          if (normalized === panelNorm) {
            el.classList.remove("opacity-0", "pointer-events-none");
            el.classList.add("opacity-100", "pointer-events-auto");
          } else {
            el.classList.remove("opacity-100", "pointer-events-auto");
            el.classList.add("opacity-0", "pointer-events-none");
          }
        });
      } catch {}

      const current = Math.round(-state.targetY / state.projectHeight);
      const clampedCurrent = Math.max(
        0,
        Math.min(projectData.length - 1, current)
      );
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
      if (!isActive) return;
      if (rootRef.current && !(e.target as Element).closest?.(".projects-root"))
        return;
      e.preventDefault();
      state.isSnapping = false;
      state.lastScrollTime = Date.now();
      const delta = Math.max(
        Math.min(e.deltaY * config.SCROLL_SPEED, config.MAX_VELOCITY),
        -config.MAX_VELOCITY
      );

      // Check if scrolling up at the first project
      if (state.targetY >= 0 && delta < 0) {
        onScrollToHero?.();
        return;
      }

      state.targetY -= delta;
      state.targetY = clamp(state.targetY, minTargetY, maxTargetY);
    };

    const touchStart = (e: TouchEvent) => {
      if (!isActive) return;
      if (rootRef.current && !(e.target as Element).closest?.(".projects-root"))
        return;
      state.isDragging = true;
      state.isSnapping = false;
      state.dragStart = { y: e.touches[0].clientY, scrollY: state.targetY };
      state.lastScrollTime = Date.now();
    };
    const touchMove = (e: TouchEvent) => {
      if (!state.isDragging) return;
      const newTargetY =
        state.dragStart.scrollY +
        (e.touches[0].clientY - state.dragStart.y) * 1.5;

      // Check if dragging up at the first project
      if (state.targetY >= 0 && newTargetY > state.targetY) {
        onScrollToHero?.();
        state.isDragging = false;
        return;
      }

      state.targetY = clamp(newTargetY, minTargetY, maxTargetY);
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
  }, [
    ensureMapsHaveIndex,
    findSwiperInWrapper,
    setTransformIfChanged,
    viewportH,
    viewportW,
    isActive,
    isDesktop2XL,
    isLaptop,
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

  return {
    rootRef,
    indicesToRender,
    stateRef,
    getProjectData,
    isLaptop,
    viewportW,
    viewportH,
    projectListRef,
    isMobile,
    isDesktop2XL,
    isDesktopXL,
    minimapWrapperRef,
    minimapImgPreviewRef,
    minimapInfoListRef,
    handlePrev,
    handleNext,
    controlsState,
    handleBulletClick,
    controlsInnerRef,
  };
};
