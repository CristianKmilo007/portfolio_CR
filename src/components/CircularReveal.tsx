// src/components/CircularReveal.tsx
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface CircularRevealProps {
  size?: number;
  borderWidth?: number;
  initialBorderWidth?: number;
  duration?: number; // trace draw duration
  expandDuration?: number; // stroke-width expand duration
  backgroundImage?: string;
  maxScale?: number; // kept for possible future use, currently not drive by scroll
}

const CircularReveal: React.FC<CircularRevealProps> = ({
  size = 400,
  borderWidth = 60,
  initialBorderWidth = 4,
  duration = 2,
  expandDuration = 0.6,
  backgroundImage = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
  maxScale = 3,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const progressRef = useRef({ progress: 0, strokeWidth: initialBorderWidth });
  const patternIdRef = useRef(`img-pattern-${Math.random().toString(36).substr(2, 9)}`);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const circle = circleRef.current;
    if (!container || !circle) return;

    const getCircumference = (strokeW: number) => {
      const radius = (size - strokeW) / 2;
      return 2 * Math.PI * radius;
    };

    container.style.willChange = "transform";
    container.style.transformOrigin = "50% 50%";
    container.style.backfaceVisibility = "hidden";

    progressRef.current.progress = 0;
    progressRef.current.strokeWidth = initialBorderWidth;

    const initialRadius = (size - initialBorderWidth) / 2;
    circle.setAttribute("r", `${initialRadius}`);
    circle.style.strokeDasharray = `${getCircumference(initialBorderWidth)}`;
    circle.style.strokeDashoffset = `${getCircumference(initialBorderWidth)}`;
    circle.style.strokeWidth = `${initialBorderWidth}`;

    // timeline intro: draw trace -> expand stroke
    const introTl = gsap.timeline();
    introTlRef.current = introTl;

    // draw trace
    introTl.to(progressRef.current, {
      progress: 1,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const circumference = getCircumference(progressRef.current.strokeWidth);
        const offset = circumference * (1 - progressRef.current.progress);
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
      },
    });

    // expand stroke
    introTl.to(progressRef.current, {
      strokeWidth: borderWidth,
      duration: expandDuration,
      ease: "power2.out",
      onUpdate: () => {
        const newRadius = (size - progressRef.current.strokeWidth) / 2;
        circle.setAttribute("r", `${newRadius}`);
        circle.style.strokeWidth = `${progressRef.current.strokeWidth}`;
        const newCirc = 2 * Math.PI * newRadius;
        circle.style.strokeDasharray = `${newCirc}`;
        circle.style.strokeDashoffset = `${newCirc * (1 - progressRef.current.progress)}`;
      },
    });

    // opcional: aseguro escala base en 1 al inicio
    gsap.set(container, { scale: 1 });

    return () => {
      try {
        introTl.kill();
      } catch {}
      introTlRef.current = null;
      try {
        container.style.willChange = "";
        container.style.backfaceVisibility = "";
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, borderWidth, initialBorderWidth, duration, expandDuration, maxScale]);

  const center = size / 2;
  const initialRadius = (size - initialBorderWidth) / 2;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <pattern
            id={patternIdRef.current}
            patternUnits="userSpaceOnUse"
            width={size}
            height={size}
            patternTransform={`rotate(90 ${center} ${center})`}
          >
            <image
              href={backgroundImage}
              x={0}
              y={0}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        </defs>

        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={initialRadius}
          fill="none"
          stroke={`url(#${patternIdRef.current})`}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default CircularReveal;
