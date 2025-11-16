"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

type ClassNames = {
  base?: string;
  content?: string
}

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
  const barsRef = useRef<HTMLDivElement[]>([]);
  const numbersRef = useRef<HTMLSpanElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // helper: reset visuals a 0
  const resetVisuals = () => {
    // kill timeline
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }
    // reset bars and numbers
    barsRef.current.forEach((b) => {
      if (b) gsap.set(b, { width: 0 });
    });
    numbersRef.current.forEach((n) => {
      if (n) n.textContent = "0%";
    });
  };

  const runAnimation = () => {
    // safety: kill prev
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }

    // create timeline
    const tl = gsap.timeline();
    tlRef.current = tl;

    data.forEach((item, i) => {
      const bar = barsRef.current[i];
      const num = numbersRef.current[i];
      const target = item.percentage;

      if (!bar || !num) return;

      // stagger delay per item
      const delay = i * 0.08;
      // animate width and numeric counter in parallel for each row
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

      // animate number using innerText snap
      tl.to(
        num,
        {
          innerText: target,
          duration: 1.5,
          delay: 0.5,
          ease: "power3.out",
          snap: { innerText: 1 },
          onUpdate() {
            // gsap.innerText updates value as number sometimes; ensure % sign
            num.textContent = `${Math.round(
              Number((num as any).innerText || num.textContent || "0")
            )}%`;
          },
        },
        delay
      );
    });
  };

  useEffect(() => {
    // init to zeros
    resetVisuals();

    const root = rootRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // only animate when intersecting enough and visible (opacity > 0)
          const computed = window.getComputedStyle(root);
          const visibleByOpacity = Number(computed.opacity) > 0.05; // tolerancia pequeña
          if (entry.isIntersecting && visibleByOpacity) {
            // small debounce: si ya hay tl corriendo, no reiniciar
            if (!tlRef.current) {
              runAnimation();
            }
          } else {
            // cuando salen del viewport o quedan invisibles, reset para que la próxima entrada reproduzca
            resetVisuals();
          }
        });
      },
      {
        threshold: 0.5, // al menos 50% visible para disparar
      }
    );

    obs.observe(root);

    return () => {
      obs.disconnect();
      // cleanup timeline
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div
      ref={rootRef}
      className={`w-full h-full flex justify-center items-center ${classNames?.base}`}
    >
      <div className={`w-[800px] grid grid-cols-2 gap-x-12 gap-y-5 ${classNames?.content}`}>
        {data.map((item, i) => (
          <div
            key={item.tecnology}
            className="flex items-center gap-4 w-full"
          >
            <div className="size-12 min-w-12 border border-[#ffffff17] bg-[#ffffff13] rounded-lg flex justify-center items-center overflow-hidden">
              {typeof item.icon === "string" ? (
                <img
                  src={item.icon}
                  alt={item.tecnology}
                  className="w-full h-full object-contain img-logos-filter-white p-2"
                />
              ) : (
                item.icon
              )}
            </div>
            <div className="w-full flex flex-col gap-2 -mt-1">
              <div className="w-full flex gap-4 justify-between text-xl font-medium">
                <span>{item.tecnology}</span>
                <span
                  ref={(el) => {
                    if (el) numbersRef.current[i] = el;
                  }}
                  className="font-crimson font-semibold"
                >
                  0%
                </span>
              </div>

              <div className="w-full h-[3px] bg-[#666] rounded-full relative overflow-hidden">
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
