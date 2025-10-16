// PageLoader.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

interface PageLoaderProps {
  onComplete: () => void;
  segments?: number[]; // e.g. [0, 42, 79, 100]
}

/* timing tunables */
const EXIT_DUR = 0.25;
const ENTER_DUR = 0.3;
const STAGGER = 60; // ms between column animations (visual offset)
const BREATHING = 0.12;
const INITIAL_SHOW_MS = 250;
const LINE_LEAD_MS = 200; // ms before line animation to hide counter parent

export default function PageLoader({
  onComplete,
  segments = [0, 42, 79, 100],
}: PageLoaderProps) {
  // Always two columns: tens (0..10) and units (0..9)
  const tensValues = Array.from({ length: 11 }, (_, i) => String(i)); // 0..10
  const unitsValues = Array.from({ length: 10 }, (_, i) => String(i)); // 0..9

  // state: which segment index we're showing
  const [index, setIndex] = useState(0);

  // flag to suppress the initial position animation for first mount
  const [suppressInitialAnim, setSuppressInitialAnim] = useState(true);

  // refs for GSAP targets & measurements
  const tensListRef = useRef<HTMLDivElement | null>(null);
  const unitsListRef = useRef<HTMLDivElement | null>(null);
  const counterWrapperRef = useRef<HTMLDivElement | null>(null);

  // RAF scheduler refs
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const hideScheduledRef = useRef(false);
  const gsapTlRef = useRef<gsap.core.Timeline | null>(null);
  const fadeTweenRef = useRef<gsap.core.Tween | null>(null);

  // utils: compute tens & unit digit for a percentage number (support 100)
  const digitsForValue = (n: number) => {
    const capped = Math.max(0, Math.round(n));
    const tens = Math.floor(capped / 10); // 0..10
    const units = capped % 10;
    return { tens, units };
  };

  // set initial "no animation" on first frame so 00 doesn't animate in
  useEffect(() => {
    const id = window.requestAnimationFrame(() =>
      setSuppressInitialAnim(false)
    );
    return () => window.cancelAnimationFrame(id);
  }, []);

  // animate both columns to the given tensIndex/unitsIndex
  const animateColumnsTo = (
    tensIndex: number,
    unitsIndex: number,
    animate = true
  ) => {
    // measure item heights (use first child)
    const tensList = tensListRef.current;
    const unitsList = unitsListRef.current;
    if (!tensList || !unitsList) return;

    const tensItem = tensList.querySelector<HTMLElement>("[data-digit]");
    const unitsItem = unitsList.querySelector<HTMLElement>("[data-digit]");
    if (!tensItem || !unitsItem) return;

    const tensH = tensItem.getBoundingClientRect().height;
    const unitsH = unitsItem.getBoundingClientRect().height;

    const targetYt = -tensIndex * tensH;
    const targetYu = -unitsIndex * unitsH;

    // kill previous tweens on these targets
    gsap.killTweensOf(tensList);
    gsap.killTweensOf(unitsList);

    if (!animate) {
      // immediate set (no animation)
      gsap.set(tensList, { y: targetYt });
      gsap.set(unitsList, { y: targetYu });
      return;
    }

    // animate both, with a tiny stagger to create the simultaneous-but-phased look
    const baseDur = 0.35; // tweak to change speed
    gsap.to(tensList, { y: targetYt, duration: baseDur, ease: "power2.out" });
    // units slightly faster and slightly delayed for perception of "building the number"
    gsap.to(unitsList, {
      y: targetYu,
      duration: baseDur * 0.85,
      ease: "power2.out",
      delay: STAGGER / 1000,
    });
  };

  // effect: run RAF-based scheduler to advance index according to timing (same approach as before)
  useEffect(() => {
    const cols = 2;
    const exitPhase = EXIT_DUR + (STAGGER / 1000) * Math.max(0, cols - 1);
    const enterPhase = ENTER_DUR + (STAGGER / 1000) * Math.max(0, cols - 1);
    const perSegmentMs = Math.round(
      (exitPhase + enterPhase + BREATHING) * 1000
    );
    const startAt = INITIAL_SHOW_MS;

    const totalRunMs =
      startAt +
      perSegmentMs * Math.max(0, segments.length - 1) +
      perSegmentMs +
      300;

    const tick = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;

      // before starting delay, keep index 0
      if (elapsed < startAt) {
        setIndex(0);
      } else {
        const sinceStart = elapsed - startAt;
        const step = Math.min(
          segments.length - 1,
          1 + Math.floor(sinceStart / perSegmentMs)
        );
        setIndex(step);
      }

      // schedule hide of counter parent slightly before line animation
      const timeUntilLine = totalRunMs - elapsed;
      if (timeUntilLine <= LINE_LEAD_MS && !hideScheduledRef.current) {
        hideScheduledRef.current = true;
        // fade move the parent (not the digits per-digit) so digits animation remains translate-only
        if (counterWrapperRef.current) {
          if (fadeTweenRef.current) {
            fadeTweenRef.current.kill();
            fadeTweenRef.current = null;
          }
          fadeTweenRef.current = gsap.to(counterWrapperRef.current, {
            opacity: 0,
            duration: 0.28,
            ease: "power2.out",
          });
        }
      }

      // finish: animate line and call onComplete once
      if (elapsed >= totalRunMs) {
        if (!completedRef.current) {
          completedRef.current = true;
          setIndex(segments.length - 1);
          const line = document.getElementById("page-loader-line");
          if (line) {
            gsap.set(line, { scaleX: 0, transformOrigin: "center center" });
            const tl = gsap.timeline({
              onComplete: () => onComplete(),
            });
            gsapTlRef.current = tl;
            tl.to(line, { scaleX: 1, duration: 0.5, ease: "power3.inOut" });
            tl.to(
              line,
              { height: "100vh", duration: 0.6, ease: "power4.inOut" },
              "+=0.08"
            );
          } else {
            onComplete();
          }
        }
        rafRef.current = null;
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    // reset flags & start
    startTimeRef.current = null;
    completedRef.current = false;
    hideScheduledRef.current = false;
    if (fadeTweenRef.current) {
      fadeTweenRef.current.kill();
      fadeTweenRef.current = null;
    }
    if (gsapTlRef.current) {
      gsapTlRef.current.kill();
      gsapTlRef.current = null;
    }

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
      completedRef.current = false;
      hideScheduledRef.current = false;
      if (fadeTweenRef.current) {
        fadeTweenRef.current.kill();
        fadeTweenRef.current = null;
      }
      if (gsapTlRef.current) {
        gsapTlRef.current.kill();
        gsapTlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(segments), onComplete]);

  // effect: whenever `index` changes, animate columns to show that segment's digits
  useLayoutEffect(() => {
    const seg = segments[index];
    const { tens, units } = digitsForValue(seg);

    // tens can be up to 10 (for 100). our tensValues covers 0..10.
    const animate = !suppressInitialAnim; // first paint = no animation
    animateColumnsTo(tens, units, animate);
  }, [index, suppressInitialAnim, segments]);

  // render lists of digits stacked vertically. parent uses overflow-hidden
  return (
    <div className="fixed inset-0 z-60 bg-[#202124] flex items-center justify-center overflow-hidden">
      {/* Counter wrapper: overflow-hidden so digits slide cleanly */}
      <div
        ref={counterWrapperRef}
        className="relative overflow-hidden flex items-center justify-center w-full h-full pointer-events-none"
        aria-hidden
      >
        <div className="absolute right-16 bottom-12 flex items-end gap-1 h-[125px] overflow-hidden">
          {/* Tens column */}
          <div
            className="overflow-hidden h-[9rem] leading-none"
            style={{ lineHeight: 1 }}
          >
            <div ref={tensListRef}>
              {tensValues.map((v, i) => (
                <div
                  key={v + i}
                  data-digit
                  className="text-[10rem] font-extrabold font-mono text-white text-end"
                  style={{
                    height: "10rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Units column */}
          <div
            className="overflow-hidden h-[9rem] leading-none"
            style={{ lineHeight: 1 }}
          >
            <div ref={unitsListRef}>
              {unitsValues.map((v, i) => (
                <div
                  key={v + i}
                  data-digit
                  className="text-[10rem] font-extrabold font-mono text-white text-center"
                  style={{
                    height: "10rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "start",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* percent sign */}
          <div className="text-[5rem] font-bold text-white ml-4 self-end -mb-4">
            %
          </div>
        </div>
      </div>

      {/* linea central (GSAP) */}
      <div
        id="page-loader-line"
        className="absolute left-0 right-0 top-1/2 h-[2px] bg-white origin-center scale-x-0"
        style={{ transform: "translateY(-50%)" }}
      />
    </div>
  );
}
