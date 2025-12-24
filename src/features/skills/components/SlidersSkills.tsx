"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { Button } from "@heroui/react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";

type ClassNames = {
  base?: string;
  content?: string;
  buttons?: string;
};

export type dataSkills = {
  tecnology: string;
  percentage: number;
  icon?: string | ReactNode;
};

interface SlidersSkillsProps {
  data: dataSkills[];
  classNames?: ClassNames;
}

export const SlidersSkills = ({ data, classNames }: SlidersSkillsProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const numbersRef = useRef<HTMLSpanElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  // continuous scroll control
  const pressIntervalRef = useRef<number | null>(null);
  const pressTimeoutRef = useRef<number | null>(null);
  const continuousActiveRef = useRef(false);

  // hold threshold (ms) — tiempo mínimo para considerar "hold"
  const HOLD_THRESHOLD = 0;

  // helper: reset visuals a 0
  const resetVisuals = () => {
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }
    barsRef.current.forEach((b) => {
      if (b) gsap.set(b, { width: 0 });
    });
    numbersRef.current.forEach((n) => {
      if (n) n.textContent = "0%";
    });
  };

  const runAnimation = () => {
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }

    const tl = gsap.timeline();
    tlRef.current = tl;

    data.forEach((item, i) => {
      const bar = barsRef.current[i];
      const num = numbersRef.current[i];
      const target = item.percentage;

      if (!bar || !num) return;
      const delay = i * 0.08;

      tl.to(
        bar,
        {
          width: `${target}%`,
          duration: 1.5,
          delay: 0.5,
          ease: "power3.out",
        },
        delay
      );

      tl.to(
        num,
        {
          innerText: target,
          duration: 1.5,
          delay: 0.5,
          ease: "power3.out",
          snap: { innerText: 1 },
          onUpdate() {
            num.textContent = `${Math.round(
              Number((num as any).innerText || num.textContent || "0")
            )}%`;
          },
        },
        delay
      );
    });
  };

  // update scroll buttons enabled/disabled + detecta si es scrolleable
  const updateScrollAvailability = () => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      setIsScrollable(false);
      return;
    }
    const up = el.scrollTop > 0;
    const down = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setCanScrollUp(up);
    setCanScrollDown(down);
    setIsScrollable(el.scrollHeight > el.clientHeight + 1);
  };

  const getStep = () => {
    const el = scrollRef.current;
    if (!el) return 120;
    return Math.floor(el.clientHeight * 0.6);
  };

  const scrollByStep = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: amount, behavior: "auto" });
    updateScrollAvailability();
  };

  // start continuous scrolling: direction = -1 (up) o 1 (down)
  const startContinuousScroll = (direction: -1 | 1) => {
    if (pressIntervalRef.current != null) return;
    const el = scrollRef.current;
    if (!el) return;

    const stepPerTick = Math.max(8, Math.floor(getStep() / 12)); // px por tick
    const tickMs = 40; // ms entre ticks

    // Ejecutar un primer tick al iniciar el loop para feedback
    scrollByStep(direction * stepPerTick);

    const id = window.setInterval(() => {
      if (direction === -1 && el.scrollTop <= 0) {
        stopContinuousScroll();
        return;
      }
      if (
        direction === 1 &&
        el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      ) {
        stopContinuousScroll();
        return;
      }
      scrollByStep(direction * stepPerTick);
    }, tickMs);

    pressIntervalRef.current = id;
    continuousActiveRef.current = true;
  };

  const stopContinuousScroll = () => {
    if (pressIntervalRef.current != null) {
      window.clearInterval(pressIntervalRef.current);
      pressIntervalRef.current = null;
    }
    if (pressTimeoutRef.current != null) {
      window.clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    continuousActiveRef.current = false;
  };

  useEffect(() => {
    // init to zeros
    resetVisuals();

    const root = rootRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const computed = window.getComputedStyle(root);
          const visibleByOpacity = Number(computed.opacity) > 0.05;
          if (entry.isIntersecting && visibleByOpacity) {
            if (!tlRef.current) {
              runAnimation();
            }
          } else {
            resetVisuals();
          }
        });
      },
      { threshold: 0.5 }
    );

    obs.observe(root);

    return () => {
      obs.disconnect();
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // attach scroll listener to update buttons availability
  useEffect(() => {
    const el = scrollRef.current;
    const handler = () => updateScrollAvailability();

    // always listen window resize to recalc scrolleabilidad
    window.addEventListener("resize", handler);

    if (el) {
      updateScrollAvailability();
      el.addEventListener("scroll", handler, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", handler);
      if (el) el.removeEventListener("scroll", handler);
    };
  }, [scrollRef.current, data]);

  // ensure we stop continuous scroll if user releases pointer anywhere
  useEffect(() => {
    const onGlobalPointerUp = () => stopContinuousScroll();
    window.addEventListener("pointerup", onGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", onGlobalPointerUp);
      stopContinuousScroll();
    };
  }, []);

  // helper: begin press handling (sets timeout for hold)
  const handlePointerDownStart =
    (direction: -1 | 1) => (e: React.PointerEvent) => {
      e.stopPropagation();
      // si no es scrolleable, no hacemos nada
      if (!isScrollable) return;
      // limpiar cualquier timeout previo
      if (pressTimeoutRef.current != null) {
        window.clearTimeout(pressTimeoutRef.current);
        pressTimeoutRef.current = null;
      }
      // programar inicio sólo si el usuario mantiene presionado HOLD_THRESHOLD ms
      pressTimeoutRef.current = window.setTimeout(() => {
        startContinuousScroll(direction);
        pressTimeoutRef.current = null;
      }, HOLD_THRESHOLD);
    };

  // pointer up / leave handlers (detienen tanto timeout como interval)
  const handlePointerUpOrLeave = (e?: React.PointerEvent) => {
    if (e) e.stopPropagation();
    // si el timeout aún no expiró -> clear y NO ejecutar scroll
    if (pressTimeoutRef.current != null) {
      window.clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    // si ya estaba el continuous activo, detenerlo
    if (continuousActiveRef.current) {
      stopContinuousScroll();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`w-full h-full flex justify-center items-center relative ${classNames?.base}`}
    >
      {/* Botones de scroll - sólo se muestran si hay overflow */}
      {isScrollable && (
        <div
          className={`absolute z-20 flex flex-row lg:flex-col gap-2 ${classNames?.buttons}`}
        >
          <Button
            type="button"
            onPointerDown={handlePointerDownStart(-1)}
            onPointerUp={handlePointerUpOrLeave}
            onPointerLeave={handlePointerUpOrLeave}
            isDisabled={!canScrollUp}
            isIconOnly
            radius="full"
            size="sm"
            variant="bordered"
            className="border-1"
          >
            <FaArrowUp color="#fff" />
          </Button>

          <Button
            type="button"
            onPointerDown={handlePointerDownStart(1)}
            onPointerUp={handlePointerUpOrLeave}
            onPointerLeave={handlePointerUpOrLeave}
            isDisabled={!canScrollDown}
            isIconOnly
            radius="full"
            size="sm"
            variant="bordered"
            className="border-1"
          >
            <FaArrowDown color="#fff" />
          </Button>
        </div>
      )}

      {/* contenedor scrollable */}
      <div
        ref={scrollRef}
        className={`max-h-[525px] sm:max-h-[460px] lg:max-h-[650px] custom-scrollbar overflow-x-hidden grid grid-cols-2 gap-x-5 sm:gap-x-12 gap-y-3 sm:gap-y-5 overflow-y-auto !px-1 sm:px-4 ${
          classNames?.content
        } ${isScrollable && "!pr-[16px]"}`}
        tabIndex={0}
      >
        {data.map((item, i) => (
          <div
            key={item.tecnology}
            className="flex items-center gap-2 sm:gap-4 w-full"
          >
            <div className="size-9 sm:size-12 min-w-9 sm:min-w-12 border border-[#ffffff17] bg-[#ffffff13] rounded-lg flex justify-center items-center overflow-hidden">
              {typeof item.icon === "string" ? (
                <img
                  src={item.icon}
                  alt={item.tecnology}
                  className="w-full h-full object-contain img-logos-filter-white p-1 sm:p-2"
                />
              ) : (
                item.icon
              )}
            </div>
            <div className="w-full flex flex-col gap-1 sm:gap-2 -mt-1">
              <div className="w-full flex gap-2 sm:gap-4 justify-between text-base sm:text-xl font-medium">
                <span className="text-one-line-ellipsis">{item.tecnology}</span>
                <span
                  ref={(el) => {
                    if (el) numbersRef.current[i] = el;
                  }}
                  className="font-crimson font-semibold"
                >
                  0%
                </span>
              </div>

              <div className="w-full h-[2px] sm:h-[3px] bg-[#666] rounded-full relative overflow-hidden">
                <div
                  ref={(el) => {
                    if (el) barsRef.current[i] = el;
                  }}
                  className="absolute top-0 left-0 h-full rounded-full bg-[linear-gradient(90deg,#ae38ff,#f92cf7)]"
                  style={{ width: 0 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidersSkills;
