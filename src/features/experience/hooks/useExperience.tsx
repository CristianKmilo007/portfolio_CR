import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createRoot, type Root } from "react-dom/client";
import { useResponsive } from "../../../hooks/useMediaQuery";
import TimelineCard, { type TimelineEvent } from "../components/TimelineCard";

gsap.registerPlugin(ScrollTrigger);

export const useExperience = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const revealPathRef = useRef<SVGPathElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const smootherRef = useRef<any>(null);

  // NEW: refs para los textos y para el overlay que se subirá
  const aprendizajeRef = useRef<HTMLSpanElement | null>(null);
  const experienciaRef = useRef<HTMLSpanElement | null>(null);
  const miVidaRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null); // contenedor z-[3] que pediste subir

  const { isDesktopXL, isLaptop, isMobile } = useResponsive();

  const TIMELINE_EVENTS: Array<
    {
      year: string;
      title: string;
      desc: string;
      functions?: Array<string>;
      side: "left" | "right";
      type: "education" | "job";
      img?: string;
    } & (
      | { y?: never; progress?: never }
      | { y: number; progress?: never }
      | { progress: number; y?: never }
    )
  > = [
    {
      year: "2019 - 2021",
      title: "Tecnico en Sistemas",
      desc: "Instituto Politecnico Agroindustrial",
      functions: [
        "Soporte técnico y mantenimiento del hardware y softwaredel computador",
      ],
      side: isLaptop ? "left" : "right",
      img: "/experience/cert_1.jpg",
      type: "education",
      progress: isMobile ? 0.37 : 0.33,
    },
    {
      year: "2021 - 2022",
      title: "Web Designer",
      desc: "Udemy",
      functions: ["Máster en Diseño Web, enfoque UX/UI y desarrollo front-end"],
      side: isMobile ? "left" : isLaptop ? "right" : "left",
      img: "/experience/cert_2.jpg",
      type: "education",
      progress: isMobile ? 0.45 : 0.41,
    },
    {
      year: "2021 - 2022",
      title: "Web Developer Full Stack",
      desc: "Universidad Iberoamericana",
      type: "education",
      functions: [
        "Desarrollar aplicaciones completas usando JavaScript, Node.js y Angular",
      ],
      side: isLaptop ? "right" : "left",
      img: "/experience/cert_3.jpg",
      progress: isMobile ? 0.53 : 0.49,
    },
    {
      year: "2021 - 2023",
      title: "Full Stack Developer Freelance",
      desc: "Villavicencio - Remoto",
      functions: [
        "Desarrollar interfaces web responsivas usando Angular, HTML5, CSS3 y frameworks de diseño modernos",
        "Implementar APIs RESTful y endpoints backend seguros con Node.js y Express",
        "Participar en revisiones de código, aplicando buenas prácticas y patrones de diseño",
      ],
      side: isLaptop ? "right" : "left",
      type: "job",
      progress: isMobile ? 0.61 : 0.57,
    },
    {
      year: "2023 - 2024",
      title: "TodoServy",
      desc: "Villavicencio - Remoto",
      functions: [
        "Implementar componentes reutilizables y modulares respetando patrones de diseño y buenas prácticas",
        "Revisar código mediante pull requests y participar activamente en code reviews del equipo",
      ],
      type: "job",
      side: isLaptop ? "left" : "right",
      progress: isMobile ? 0.69 : 0.65,
    },
    {
      year: "2024-2025",
      title: "Shepwashi",
      desc: "Villavicencio - Remoto",
      functions: [
        "Desarrollar interfaces web responsivas con HTML5, CSS3 y Typescript moderno",
        "Implementar componentes reutilizables usando frameworks como React, Nest Js o Vite",
        "Integrar APIs REST gestionando estado de la aplicación de forma eficiente",
        "Definir arquitectura frontend escalable y guiar al equipo en buenas prácticas",
      ],
      type: "job",
      side: isLaptop ? "left" : "right",
      progress: isMobile ? 0.77 : 0.73,
    },
    {
      year: "2025",
      title: "Backend Dev. Nest JS",
      desc: "DevTalles",
      type: "education",
      functions: [
        "Uso de Git, Docker y bases de datos SQL/NoSQL en proyectos reales con Nest JS, TypeORM y PostgresSQL",
      ],
      img: "/experience/cert_4.jpg",
      side: isMobile ? "right" : isLaptop ? "left" : "right",
      progress: isMobile ? 0.85 : 0.81,
    },
    {
      year: "2026...",
      title: "Crecimiento profesional",
      desc: "Constante aprendizaje y fortalecimiento de mis habilidades...",
      type: "education",
      side: isMobile ? "left" : "right",
      progress: 1,
    },
  ];

  const SVG_ID = "trace-line-fixed-experience";

  type Pt = { x: number; y: number };

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function catmullRomToBezier(points: Pt[], handleLen = 80) {
    if (points.length < 2) return "";
    const dParts: string[] = [`M ${points[0].x} ${points[0].y}`];

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] ?? points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] ?? p2;

      const t1x = p2.x - p0.x;
      const t1y = p2.y - p0.y;
      const t2x = p3.x - p1.x;
      const t2y = p3.y - p1.y;

      const len1 = Math.hypot(t1x, t1y) || 1;
      const len2 = Math.hypot(t2x, t2y) || 1;
      const u1x = t1x / len1;
      const u1y = t1y / len1;
      const u2x = t2x / len2;
      const u2y = t2y / len2;

      const cp1x = p1.x + u1x * handleLen;
      const cp1y = p1.y + u1y * handleLen;
      const cp2x = p2.x - u2x * handleLen;
      const cp2y = p2.y - u2y * handleLen;

      dParts.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
    }

    return dParts.join(" ");
  }

  // util: binary search find length whose point.y ~= targetY
  function findLengthAtY(
    pathEl: SVGPathElement,
    pathLen: number,
    targetY: number
  ) {
    let lo = 0;
    let hi = pathLen;
    let mid = 0;
    for (let i = 0; i < 40; i++) {
      mid = (lo + hi) / 2;
      const pt = pathEl.getPointAtLength(mid);
      if (pt.y < targetY) lo = mid;
      else hi = mid;
    }
    return mid;
  }

  function enforceMinSpacingByLength(
    lengths: number[],
    minGap: number,
    maxLen: number
  ) {
    const out = [...lengths].sort((a, b) => a - b);
    for (let i = 1; i < out.length; i++) {
      if (out[i] - out[i - 1] < minGap) {
        out[i] = out[i - 1] + minGap;
      }
    }
    for (let i = out.length - 1; i >= 0; i--) {
      const maxAllowed = maxLen - (out.length - 1 - i) * minGap;
      if (out[i] > maxAllowed) {
        out[i] = maxAllowed;
      }
    }
    return out;
  }

  function enforceMinVerticalSpacing(
    pathEl: SVGPathElement,
    lengths: number[],
    minYGap = 100
  ) {
    const out = [...lengths].sort((a, b) => a - b);
    for (let i = 1; i < out.length; i++) {
      const prevPt = pathEl.getPointAtLength(out[i - 1]);
      let curPt = pathEl.getPointAtLength(out[i]);
      if (curPt.y - prevPt.y < minYGap) {
        let attempt = out[i];
        const step = Math.max(3, Math.floor(pathEl.getTotalLength() / 200));
        while (true) {
          attempt += step;
          if (attempt > pathEl.getTotalLength()) break;
          const newPt = pathEl.getPointAtLength(attempt);
          if (newPt.y - prevPt.y >= minYGap) {
            out[i] = attempt;
            curPt = newPt;
            break;
          }
        }
      }
    }
    return out;
  }

  useEffect(() => {
    let cancelled = false;
    let externalCleanup: (() => void) | null = null;

    const build = async (): Promise<() => void> => {
      const wrapper = wrapperRef.current!;
      const content = contentRef.current!;
      if (!wrapper || !content) return () => {};

      const ctx = gsap.context(() => {
        (async () => {
          // limpia circles previos (evita duplicados en rebuilds)
          const oldCircles = content.querySelectorAll(".circle");
          if (oldCircles && oldCircles.length)
            oldCircles.forEach((c) => c.remove());

          // optional noise circles
          try {
            const simplexMod = await import("simplex-noise");
            const SimplexCtor =
              (simplexMod as any).default ??
              (simplexMod as any).SimplexNoise ??
              simplexMod;
            if (typeof SimplexCtor === "function") {
              const simplex = new (SimplexCtor as any)();
              for (let i = 0; i < 600; i++) {
                const d = document.createElement("div");
                d.className =
                  "circle absolute rounded-full pointer-events-none";
                const n1 = simplex.noise2D(i * 0.003, i * 0.0033);
                const n2 = simplex.noise2D(i * 0.002, i * 0.001);
                const size = 2 + (Math.abs(n1) + Math.abs(n2)) * 4;
                d.style.width = `${size}px`;
                d.style.height = `${size}px`;
                d.style.left = `${Math.random() * 100}%`;
                d.style.top = `${Math.random() * 4200 - 1000}px`;
                d.style.opacity = "0";
                content.appendChild(d);
              }
            }
          } catch (e) {
            /* ignore */
          }

          // --- SVG create/ensure ---
          const SVG_HEIGHT = isMobile ? 6000 : 8000;
          const amplitude = isMobile ? 75 : 100;

          let svgEl = document.getElementById(SVG_ID) as SVGSVGElement | null;
          if (svgEl) {
            try {
              svgEl.remove();
            } catch {}
            svgEl = null;
          }
          if (!svgEl) {
            svgEl = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg"
            );
            svgEl.setAttribute("id", SVG_ID);
            svgEl.setAttribute(
              "class",
              `fixed left-0 top-0 w-full h-[${SVG_HEIGHT}px] pointer-events-none z-0`
            );
            svgEl.setAttribute("width", "100%");
            svgEl.setAttribute("height", `${SVG_HEIGHT}`);
            svgEl.setAttribute(
              "viewBox",
              `0 0 ${window.innerWidth} ${SVG_HEIGHT}`
            );
            svgEl.setAttribute("preserveAspectRatio", "none");

            svgEl.style.opacity = "0";
            svgEl.style.visibility = "visible"; // importante: no usar hidden
            svgEl.style.willChange = "opacity";
            svgRef.current = svgEl;

            const defs = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "defs"
            );
            const grad = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "linearGradient"
            );
            grad.setAttribute("id", "traceGradient");
            grad.setAttribute("gradientUnits", "userSpaceOnUse");
            grad.setAttribute("x1", "0");
            grad.setAttribute("y1", "0");
            grad.setAttribute("x2", "0");
            grad.setAttribute("y2", `${SVG_HEIGHT}`);

            const stop1 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", "#ae38ff");
            stop1.setAttribute("stop-opacity", "1");

            const stop2 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop2.setAttribute("offset", "100%");
            stop2.setAttribute("stop-color", "#f92cf7");
            stop2.setAttribute("stop-opacity", "1");

            grad.appendChild(stop1);
            grad.appendChild(stop2);
            defs.appendChild(grad);
            svgEl.appendChild(defs);

            const g = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g"
            );
            g.setAttribute("id", "trace-group");

            const bgPath = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path"
            );
            bgPath.setAttribute("class", "stroke-current text-gray-200");
            bgPath.setAttribute("stroke-width", isMobile ? "3" : "5");
            bgPath.setAttribute("fill", "none");
            bgPath.setAttribute("stroke-linecap", "round");
            bgPath.setAttribute("stroke-linejoin", "round");
            const BG_COLOR = "#333";
            bgPath.style.stroke = BG_COLOR;

            const revealPath = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path"
            );
            revealPath.setAttribute("stroke-width", isMobile ? "3" : "5");
            revealPath.setAttribute("stroke", "url(#traceGradient)");
            revealPath.setAttribute("fill", "none");
            revealPath.setAttribute("stroke-linecap", "round");
            revealPath.setAttribute("stroke-linejoin", "round");

            g.appendChild(bgPath);
            g.appendChild(revealPath);
            svgEl.appendChild(g);

            document.body.appendChild(svgEl);
          }

          svgRef.current = svgEl;
          const paths = svgEl.querySelectorAll("path");
          revealPathRef.current = (
            paths.length >= 2 ? paths[1] : paths[0]
          ) as SVGPathElement;
          groupRef.current = svgEl.querySelector(
            "g#trace-group"
          ) as SVGGElement | null;

          // build anchors equiespaciados
          const cx = window.innerWidth / 2;
          const NUM_ANCHORS = 8;
          const ZIG_MULTIPLIER = 0.6;
          const JITTER_ENABLED = false;
          const JITTER_MAG = 8;
          const HANDLE_FACTOR = 0.9;
          const HANDLE_CLAMP_MIN = 60;
          const HANDLE_CLAMP_MAX = 500;
          const SMOOTH_KERNEL = 0;

          function smoothPoints(pts: Pt[], kernel = 1) {
            if (kernel <= 0) return pts;
            const out: Pt[] = pts.map((p) => ({ x: p.x, y: p.y }));
            for (let k = 0; k < kernel; k++) {
              for (let i = 1; i < pts.length - 1; i++) {
                out[i].x = (pts[i - 1].x + pts[i].x + pts[i + 1].x) / 3;
                out[i].y = (pts[i - 1].y + pts[i].y + pts[i + 1].y) / 3;
              }
            }
            return out;
          }

          const anchors: Pt[] = [];
          for (let i = 0; i < NUM_ANCHORS; i++) {
            const t = i / Math.max(1, NUM_ANCHORS - 1);
            const y = Math.round(t * SVG_HEIGHT);
            const zig = (i % 2 === 0 ? 1 : -1) * amplitude * ZIG_MULTIPLIER;
            const jitter = JITTER_ENABLED
              ? (Math.random() - 0.5) * JITTER_MAG
              : 0;
            const x = cx + zig + jitter;
            anchors.push({ x, y });
          }

          const anchorsSmoothed =
            SMOOTH_KERNEL > 0 ? smoothPoints(anchors, SMOOTH_KERNEL) : anchors;

          let totalSeg = 0;
          for (let i = 0; i < anchorsSmoothed.length - 1; i++) {
            const dx = anchorsSmoothed[i + 1].x - anchorsSmoothed[i].x;
            const dy = anchorsSmoothed[i + 1].y - anchorsSmoothed[i].y;
            totalSeg += Math.hypot(dx, dy);
          }
          const avgSeg = Math.max(
            1,
            totalSeg / Math.max(1, anchorsSmoothed.length - 1)
          );
          const handleLength = Math.max(
            HANDLE_CLAMP_MIN,
            Math.min(HANDLE_CLAMP_MAX, avgSeg * HANDLE_FACTOR)
          );

          const d = catmullRomToBezier(anchorsSmoothed, handleLength);

          const gEl = groupRef.current!;
          const bgPathEl = gEl.querySelectorAll("path")[0] as
            | SVGPathElement
            | undefined;
          const revealPathEl = revealPathRef.current!;
          if (bgPathEl) bgPathEl.setAttribute("d", d);
          revealPathEl.setAttribute("d", d);

          // eliminar nodos previos (desmontar roots si hay)
          const prevNodes = gEl.querySelectorAll(".timeline-node");
          if (prevNodes && prevNodes.length) {
            prevNodes.forEach((n) => {
              try {
                const foEl = (n as Element).querySelector("foreignObject") as
                  | any
                  | null;
                if (foEl) {
                  const root = foEl.__reactRoot as Root | undefined;
                  if (root && typeof root.unmount === "function") {
                    try {
                      root.unmount();
                    } catch (e) {
                      /* ignore */
                    }
                  }
                }
              } catch (err) {
                /* ignore */
              } finally {
                try {
                  n.remove();
                } catch (e) {
                  /* ignore */
                }
              }
            });
          }

          // compute lengths + center
          const pathLen = revealPathEl.getTotalLength();
          const viewportCenter = window.innerHeight / 2;

          const lenAtCenter = findLengthAtY(
            revealPathEl,
            pathLen,
            viewportCenter
          );

          revealPathEl.setAttribute("stroke-dasharray", `${pathLen}`);
          const ptCenter = revealPathEl.getPointAtLength(lenAtCenter);
          const initialTranslateY = viewportCenter - ptCenter.y;
          gEl.setAttribute("transform", `translate(0, ${initialTranslateY})`);
          revealPathEl.setAttribute("stroke-dashoffset", `${pathLen}`);

          const requiredHeight = Math.ceil(SVG_HEIGHT + viewportCenter + 200);
          let spacer = content.querySelector(
            ".circle-spacer"
          ) as HTMLElement | null;
          if (!spacer) {
            spacer = document.createElement("div");
            spacer.className = "circle-spacer";
            spacer.style.height = `${requiredHeight}px`;
            content.appendChild(spacer);
          } else {
            spacer.style.height = `${requiredHeight}px`;
          }

          const startLenForItems = lenAtCenter + 20;
          const endLenForItems = pathLen - 20;
          const nEvents = TIMELINE_EVENTS.length;

          let lengthsForEvents = TIMELINE_EVENTS.map((ev, i) => {
            const anyEv = ev as any;
            if (typeof anyEv.y === "number") {
              const desiredY = Math.max(0, Math.min(anyEv.y, SVG_HEIGHT));
              return findLengthAtY(revealPathEl, pathLen, desiredY);
            }
            if (typeof anyEv.progress === "number") {
              const p = Math.max(0, Math.min(1, anyEv.progress));
              return startLenForItems + p * (endLenForItems - startLenForItems);
            }
            const t = i / Math.max(1, nEvents - 1);
            const tt = easeInOutQuad(t);
            return startLenForItems + tt * (endLenForItems - startLenForItems);
          });

          const MIN_GAP_LEN = 90;
          lengthsForEvents = enforceMinSpacingByLength(
            lengthsForEvents,
            MIN_GAP_LEN,
            pathLen
          );

          lengthsForEvents = enforceMinVerticalSpacing(
            revealPathEl,
            lengthsForEvents,
            /*minYGap=*/ 110
          );

          // prepare nodes using these lengths
          type Node = {
            len: number;
            pt: { x: number; y: number };
            baseCircle: SVGCircleElement;
            ringBg: SVGCircleElement;
            ringReveal: SVGCircleElement;
            fo: SVGForeignObjectElement;
            visible: boolean;
            reactRoot?: Root;
            side?: "left" | "right";
          };
          const nodes: Node[] = [];

          // creación de nodos
          lengthsForEvents.forEach((len, idx) => {
            const ev = TIMELINE_EVENTS[idx];
            const pt = revealPathEl.getPointAtLength(len);

            const dotR = 5;
            const ringStroke = isMobile ? 3 : 4;
            const ringR = dotR + Math.max(1, Math.floor(ringStroke / 1.7));
            const BG_COLOR = "#333";

            const nodeGroup = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g"
            );
            nodeGroup.setAttribute("class", "timeline-node");

            const baseCircle = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            ) as SVGCircleElement;
            baseCircle.setAttribute("cx", `${pt.x}`);
            baseCircle.setAttribute("cy", `${pt.y}`);
            baseCircle.setAttribute("r", `${dotR}`);
            baseCircle.setAttribute("fill", "#111");
            baseCircle.setAttribute("stroke", "none");

            const ringBg = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            ) as SVGCircleElement;
            ringBg.setAttribute("cx", `${pt.x}`);
            ringBg.setAttribute("cy", `${pt.y}`);
            ringBg.setAttribute("r", `${ringR}`);
            ringBg.setAttribute("fill", "none");
            ringBg.setAttribute("stroke-linecap", "round");
            ringBg.setAttribute("stroke-linejoin", "round");
            ringBg.setAttribute("stroke-width", `${ringStroke}`);
            ringBg.setAttribute("stroke", BG_COLOR);
            ringBg.style.opacity = "1";

            const ringReveal = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            ) as SVGCircleElement;
            ringReveal.setAttribute("cx", `${pt.x}`);
            ringReveal.setAttribute("cy", `${pt.y}`);
            ringReveal.setAttribute("r", `${ringR}`);
            ringReveal.setAttribute("fill", "none");
            ringReveal.setAttribute("stroke-linecap", "round");
            ringReveal.setAttribute("stroke-linejoin", "round");
            ringReveal.setAttribute("stroke-width", `${ringStroke}`);
            ringReveal.setAttribute("stroke", "url(#traceGradient)");
            ringReveal.style.opacity = "0";
            ringReveal.style.visibility = "visible";

            nodeGroup.appendChild(baseCircle);
            nodeGroup.appendChild(ringBg);
            nodeGroup.appendChild(ringReveal);
            gEl.appendChild(nodeGroup);

            // foreignObject
            const fo = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "foreignObject"
            ) as SVGForeignObjectElement;
            fo.setAttribute("class", "timeline-node");
            const boxW = isMobile ? 250 : isLaptop ? 325 : 500;
            const boxH = isMobile ? 300 : isLaptop ? 325 : 500;
            const offsetX = 14;
            let foX =
              ev.side === "left" ? pt.x - offsetX - boxW : pt.x + offsetX;
            foX = Math.max(6, Math.min(window.innerWidth - boxW - 6, foX));

            // --- aquí: top align (la card inicia al mismo nivel del punto) ---
            // antes: const foY = pt.y - boxH / 2;
            const foY = pt.y; // top-aligned

            fo.setAttribute("x", `${foX}`);
            fo.setAttribute("y", `${foY}`);
            fo.setAttribute("width", `${boxW}`);
            fo.setAttribute("height", `${boxH}`);
            fo.setAttribute("tabindex", "-1");
            fo.setAttribute("focusable", "false");
            (fo as any).style.outline = "none";

            // Inicialmente invisible y sin pointer-events
            (fo as any).style.opacity = "0";
            (fo as any).style.visibility = "visible";
            (fo as any).style.pointerEvents = "none";

            gEl.appendChild(fo);

            // Mount React component inside foreignObject using createRoot
            const reactRoot: Root = createRoot(fo as any);
            reactRoot.render(<TimelineCard ev={ev as TimelineEvent} />);

            (fo as any).__reactRoot = reactRoot;

            // push node including reactRoot and side
            nodes.push({
              len,
              pt: { x: pt.x, y: pt.y },
              baseCircle,
              ringBg,
              ringReveal,
              fo,
              visible: false,
              reactRoot,
              side: ev.side,
            });
          });

          // proxy + update
          const proxy: { len: number } = { len: lenAtCenter };
          let prevLen = lenAtCenter;
          const activationOffset = 6;
          const hideThreshold = 24;

          const updateRevealAndTranslate = () => {
            const curLen = proxy.len;
            const delta = curLen - prevLen;
            revealPathEl.setAttribute(
              "stroke-dashoffset",
              `${Math.max(0, pathLen - curLen)}`
            );
            const centeredPt = revealPathEl.getPointAtLength(curLen);
            const translateY = viewportCenter - centeredPt.y;
            gEl.setAttribute("transform", `translate(0, ${translateY})`);

            nodes.forEach((node) => {
              if (!node.visible) {
                if (delta >= 0 && curLen >= node.len - activationOffset) {
                  node.visible = true;

                  // mostrar foreignObject + animar progress bar desde 0->100%
                  gsap.killTweensOf(node.fo);
                  gsap.to(node.fo, {
                    autoAlpha: 1,
                    duration: 0.28,
                    ease: "power2.out",
                    onStart: () => {
                      try {
                        node.fo.style.pointerEvents = "all";
                      } catch {}
                      try {
                        const bar = (node.fo as Element).querySelector(
                          ".timeline-progress-bar"
                        ) as HTMLElement | null;
                        if (bar) {
                          gsap.killTweensOf(bar);
                          // animación de la barra: width 0% -> 100%
                          gsap.fromTo(
                            bar,
                            { width: "0%" },
                            { width: "100%", duration: 0.6, ease: "power2.out" }
                          );
                        }
                      } catch {}
                    },
                  });

                  // Mostrar gradiente del borde mediante opacity (fade-in)
                  gsap.killTweensOf(node.ringReveal);
                  gsap.to(node.ringReveal, {
                    autoAlpha: 1,
                    duration: 0.35,
                    ease: "power2.out",
                  });
                }
              } else {
                // ---------------- ocultado de nodo (reemplaza tu bloque existente) ----------------
                if (delta < 0 && curLen < node.len - hideThreshold) {
                  node.visible = false;

                  // Primero animamos la barra de progreso 100% -> 0% (si existe),
                  // y *al completar* ocultamos la foreignObject.
                  try {
                    const bar = (node.fo as Element).querySelector(
                      ".timeline-progress-bar"
                    ) as HTMLElement | null;

                    if (bar) {
                      // asegurarnos de no tener animaciones previas
                      gsap.killTweensOf(bar);
                      // animamos la barra hacia 0%
                      gsap.to(bar, {
                        width: "0%",
                        duration: 0.35,
                        ease: "power2.inOut",
                        onStart: () => {
                          // opcional: si quieres que la barra se vea aún al empezar el reverse
                          // bar.style.willChange = 'width';
                        },
                        onComplete: () => {
                          // al terminar la barra, ocultamos la foreignObject
                          try {
                            gsap.killTweensOf(node.fo);
                            gsap.to(node.fo, {
                              autoAlpha: 0,
                              duration: 0.22,
                              ease: "power2.out",
                              onComplete: () => {
                                try {
                                  node.fo.style.pointerEvents = "none";
                                } catch {}
                              },
                            });
                          } catch {}
                        },
                      });
                    } else {
                      // fallback: si no hay barra, ocultar directamente
                      gsap.killTweensOf(node.fo);
                      gsap.to(node.fo, {
                        autoAlpha: 0,
                        duration: 0.22,
                        ease: "power2.out",
                        onComplete: () => {
                          try {
                            node.fo.style.pointerEvents = "none";
                          } catch {}
                        },
                      });
                    }
                  } catch (e) {
                    // fallback robusto
                    try {
                      gsap.killTweensOf(node.fo);
                      gsap.to(node.fo, {
                        autoAlpha: 0,
                        duration: 0.22,
                        ease: "power2.out",
                        onComplete: () => {
                          try {
                            node.fo.style.pointerEvents = "none";
                          } catch {}
                        },
                      });
                    } catch {}
                  }

                  // Ocultar gradiente del borde mediante opacity (fade-out)
                  gsap.killTweensOf(node.ringReveal);
                  gsap.to(node.ringReveal, {
                    autoAlpha: 0,
                    duration: 0.25,
                    ease: "power2.inOut",
                  });

                  // -------------------------------------------------------------------------------
                }
              }
            });

            prevLen = curLen;
          };

          // intro reveal
          await new Promise<void>((resolveIntro) => {
            const introProxy = { off: pathLen };
            revealPathEl.setAttribute("stroke-dashoffset", `${pathLen}`);
            gsap.to(introProxy, {
              off: pathLen - lenAtCenter,
              duration: 0.6,
              ease: "power2.out",
              onUpdate: () => {
                revealPathEl.setAttribute(
                  "stroke-dashoffset",
                  `${Math.max(0, introProxy.off)}`
                );
              },
              onComplete: () => {
                proxy.len = lenAtCenter;
                prevLen = lenAtCenter;
                resolveIntro();
              },
            });
          });

          // scroll mapping (RAF)
          let rafId: number | null = null;
          let lastScroll = -1;
          let finishTween: gsap.core.Tween | null = null;

          const getScrollTop = () => {
            const s = smootherRef.current;
            if (s) {
              if (typeof s.getScrollTop === "function") return s.getScrollTop();
              if (typeof s.scrollTop === "number") return s.scrollTop;
            }
            return window.scrollY || document.documentElement.scrollTop || 0;
          };

          const getScrollableTotal = () =>
            Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight
            );

          const onScrollRAF = () => {
            rafId = null;
            const st = getScrollTop();
            if (st === lastScroll) return;
            lastScroll = st;
            const total = getScrollableTotal();
            let p = st / total;
            p = Math.max(0, Math.min(1, p));
            proxy.len = lenAtCenter + p * (pathLen - lenAtCenter);
            updateRevealAndTranslate();

            if (p >= 0.999) {
              if (proxy.len < pathLen - 0.5 && !finishTween) {
                finishTween = gsap.to(proxy, {
                  len: pathLen,
                  duration: 0.5,
                  ease: "power2.out",
                  onUpdate: updateRevealAndTranslate,
                  onComplete: () => {
                    finishTween = null;
                  },
                });
              }
            } else {
              if (finishTween) {
                finishTween.kill();
                finishTween = null;
              }
            }
          };

          const onScroll = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(onScrollRAF);
          };

          window.addEventListener("scroll", onScroll, { passive: true });
          wrapper.addEventListener("scroll", onScroll, { passive: true });

          // small circles fade (scoped)
          const circles = content.querySelectorAll(".circle");
          if (circles && circles.length) {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: content,
                start: "top top",
                end: `+=${SVG_HEIGHT}`,
                scrub: 0.7,
              },
            });
            circles.forEach((c) =>
              tl.to(c, { opacity: 1, duration: 0.2 }, "<")
            );
          }

          // resize -> rebuild
          const onResize = () => {
            if (svgRef.current) {
              try {
                svgRef.current.remove();
              } catch {}
              svgRef.current = null;
              revealPathRef.current = null;
              groupRef.current = null;
            }
            setTimeout(() => {
              if (!cancelled) build();
            }, 60);
          };
          window.addEventListener("resize", onResize);

          externalCleanup = () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll);
            wrapper.removeEventListener("scroll", onScroll);
            try {
              if (rafId) cancelAnimationFrame(rafId);
            } catch {}
            if (finishTween) {
              try {
                finishTween.kill();
              } catch {}
              finishTween = null;
            }
          };
        })();
      }, wrapper);

      return () => {
        cancelled = true;
        try {
          ctx.revert();
        } catch {}
        try {
          const content = contentRef.current;
          const spacer = content?.querySelector(".circle-spacer");
          if (spacer) spacer.remove();
        } catch {}
        try {
          const existing = document.getElementById(SVG_ID);
          if (existing && existing.parentNode)
            existing.parentNode.removeChild(existing);
        } catch {}
        try {
          if (
            smootherRef.current &&
            typeof smootherRef.current.kill === "function"
          ) {
            smootherRef.current.kill();
          }
          smootherRef.current = null;
        } catch {}
        if (typeof externalCleanup === "function") externalCleanup();
      };
    }; // end build

    let cleanupFn: (() => void) | null = null;
    let mounted = true;
    (async () => {
      const fn = await build();
      if (!mounted) {
        try {
          fn();
        } catch {}
      } else {
        cleanupFn = fn;
      }
    })();

    return () => {
      mounted = false;
      try {
        if (cleanupFn) cleanupFn();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLaptop, isMobile]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const raysRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!raysRef.current || !contentRef.current) return;

    const overlayHeightRef = { current: 0 as number | null };

    const ctx = gsap.context(() => {
      const blurVh = 3;
      const fadeVh = 2;
      const maxBlur = 64;
      const totalVh = blurVh + fadeVh;
      const blurFrac = blurVh / totalVh;

      raysRef.current!.style.willChange = "filter";

      if (revealRef.current) {
        revealRef.current.style.willChange = "transform, opacity";
        revealRef.current.style.transformOrigin = "center center";
        revealRef.current.style.transform = "scale(1) rotate(0deg)";
      }

      let svgInitialized = false;

      const st = ScrollTrigger.create({
        trigger: contentRef.current,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * totalVh),
        scrub: true,
        onUpdate: (self) => {
          const p = Math.max(0, Math.min(1, self.progress));

          // BLUR PHASE
          const blurPhaseProgress =
            blurFrac > 0 ? Math.min(1, p / blurFrac) : 1;
          const blurPx = maxBlur * blurPhaseProgress;
          if (raysRef.current)
            raysRef.current.style.filter = `blur(${blurPx}px)`;

          // Escala + Rotación del revealRef
          const maxScale = 5.5;
          const minScale = 1;
          const scale = minScale + (maxScale - minScale) * blurPhaseProgress;
          const maxRotateDeg = -180;
          const rotateDeg = maxRotateDeg * blurPhaseProgress;
          if (revealRef.current) {
            revealRef.current.style.transform = `scale(${scale}) rotate(${rotateDeg}deg)`;
          }

          // MOVIMIENTO DEL OVERLAY LIGADO AL PROGRESO DEL REVEAL
          // Empezar a mover cuando scale >= moveStartScale, progresar hasta maxScale
          const moveStartScale = 3.0;
          if (overlayRef.current) {
            if (!overlayHeightRef.current) {
              overlayHeightRef.current =
                overlayRef.current.getBoundingClientRect().height;
            }

            const overlayH =
              overlayHeightRef.current ||
              overlayRef.current.getBoundingClientRect().height;
            if (scale <= moveStartScale) {
              overlayRef.current.style.transform = `translateY(0px)`;
            } else {
              const t = Math.max(
                0,
                Math.min(
                  1,
                  (scale - moveStartScale) / (maxScale - moveStartScale)
                )
              );
              const extra = 80; // margen extra para asegurar que salga
              const translateY = -t * (overlayH + extra);
              overlayRef.current.style.transform = `translateY(${translateY}px)`;
            }
          }

          // FADE-IN PHASE
          const showAt = 0.45; // cuando empiece a aparecer (ajusta a tu gusto, 0..1)
          const fadeRange = 0.12; // rango de progreso para pasar 0 -> 1 (más pequeño = más rápido)

          // calcula progreso dentro del rango [showAt, showAt + fadeRange]
          let raw = 0;
          if (p > showAt) {
            raw = (p - showAt) / Math.max(1e-6, fadeRange);
          }
          let svgPhaseProgress = Math.max(0, Math.min(1, raw));

          // opcional: easing simple (descomenta si quieres suavizar)
          svgPhaseProgress = Math.pow(svgPhaseProgress, 0.95);

          // obtener svg y asegurar init
          const svgEl: Element | null =
            svgRef.current ?? document.getElementById(SVG_ID);
          if (!svgEl) return;

          if (!svgInitialized) {
            svgInitialized = true;
            (svgEl as HTMLElement | SVGElement).style.opacity = "0";
            (svgEl as HTMLElement | SVGElement).style.willChange = "opacity";
            (svgEl as HTMLElement | SVGElement).style.visibility = "visible";
          }

          // aplicar opacidad al svg completo
          (svgEl as HTMLElement | SVGElement).style.opacity =
            String(svgPhaseProgress);

          // sincronizar opacidad del path (si existe)
          const revealPath = revealPathRef.current;
          if (revealPath) {
            revealPath.style.opacity = String(svgPhaseProgress);
          }

          if (svgPhaseProgress >= 1) {
            (svgEl as HTMLElement | SVGElement).style.willChange = "";
            (svgEl as HTMLElement | SVGElement).style.opacity = "1";
            if (revealPath) revealPath.style.opacity = "1";
          }
        },
      });

      return () => {
        st.kill();
      };
    }, contentRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [mounted]);

  // --- NEW: effect que controla la animación secuencial de los textos y bloqueo de scroll ---
  // --- REEMPLAZAR la useEffect que controla la animación secuencial y bloqueo ---
  useEffect(() => {
    if (!mounted) return;

    const apr = aprendizajeRef.current;
    const exp = experienciaRef.current;
    const mi = miVidaRef.current;
    const wrapper = wrapperRef.current;

    if (apr) {
      apr.style.opacity = "0";
      apr.style.filter = "blur(12px)";
      apr.style.willChange = "opacity, filter";
      apr.style.display = "inline-block";
    }
    if (exp) {
      exp.style.opacity = "0";
      exp.style.filter = "blur(12px)";
      exp.style.willChange = "opacity, filter";
      exp.style.display = "inline-block";
    }
    if (mi) {
      mi.style.opacity = "0";
      mi.style.transform = "translateY(12px)";
      mi.style.willChange = "opacity, transform";
    }

    // refs para guardar estilos/posición previos
    const prevScrollYRef = { current: window.scrollY || 0 };
    const prevHtmlOverflow = {
      current: document.documentElement.style.overflow || "",
    };
    const prevBodyOverflow = { current: document.body.style.overflow || "" };
    const prevBodyPos = {
      position: document.body.style.position || "",
      top: document.body.style.top || "",
      left: document.body.style.left || "",
      right: document.body.style.right || "",
      width: document.body.style.width || "",
    };

    let isBlocked = false;

    // handlers para prevenir scroll
    const wheelHandler = (e: Event) => {
      e.preventDefault();
    };
    const touchHandler = (e: Event) => {
      e.preventDefault();
    };
    const keyHandler = (e: KeyboardEvent) => {
      const blocked = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "Space",
      ];
      if (blocked.includes(e.code)) e.preventDefault();
    };

    const addPreventListeners = () => {
      document.addEventListener("wheel", wheelHandler, { passive: false });
      document.addEventListener("touchmove", touchHandler, { passive: false });
      document.addEventListener("keydown", keyHandler, { passive: false });

      if (wrapper) {
        wrapper.addEventListener("wheel", wheelHandler, { passive: false });
        wrapper.addEventListener("touchmove", touchHandler, { passive: false });
      }
    };

    const removePreventListeners = () => {
      document.removeEventListener("wheel", wheelHandler);
      document.removeEventListener("touchmove", touchHandler);
      document.removeEventListener("keydown", keyHandler);

      if (wrapper) {
        wrapper.removeEventListener("wheel", wheelHandler);
        wrapper.removeEventListener("touchmove", touchHandler);
      }
    };

    // BLOCK: usa position:fixed para congelar la página en la posición actual
    const blockScroll = () => {
      if (isBlocked) return;
      try {
        prevScrollYRef.current =
          window.scrollY || document.documentElement.scrollTop || 0;

        // guardar estilos previos
        prevHtmlOverflow.current =
          document.documentElement.style.overflow || "";
        prevBodyOverflow.current = document.body.style.overflow || "";
        prevBodyPos.position = document.body.style.position || "";
        prevBodyPos.top = document.body.style.top || "";
        prevBodyPos.left = document.body.style.left || "";
        prevBodyPos.right = document.body.style.right || "";
        prevBodyPos.width = document.body.style.width || "";

        // fijar body para congelar scroll
        document.body.style.position = "fixed";
        document.body.style.top = `-${prevScrollYRef.current}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        if (wrapper) wrapper.style.overflow = "hidden";

        addPreventListeners();
        isBlocked = true;
      } catch (e) {
        // fallback: solo overflow hidden + listeners
        try {
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
          addPreventListeners();
          isBlocked = true;
        } catch {}
      }
    };

    // UNBLOCK: restaura valores y mueve scroll a la posición original
    const unblockScroll = () => {
      if (!isBlocked) return;
      try {
        removePreventListeners();

        // restaurar estilos inline previos
        document.documentElement.style.overflow =
          prevHtmlOverflow.current ?? "";
        document.body.style.overflow = prevBodyOverflow.current ?? "";

        // restaurar body position y top, y reajustar scroll
        document.body.style.position = prevBodyPos.position ?? "";
        document.body.style.top = prevBodyPos.top ?? "";
        document.body.style.left = prevBodyPos.left ?? "";
        document.body.style.right = prevBodyPos.right ?? "";
        document.body.style.width = prevBodyPos.width ?? "";

        if (wrapper) wrapper.style.overflow = "";

        // reajustar scroll a la posición guardada
        const y = prevScrollYRef.current || 0;
        window.scrollTo(0, y);
      } catch (e) {
        try {
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          if (wrapper) wrapper.style.overflow = "";
        } catch {}
      } finally {
        isBlocked = false;
      }
    };

    // bloquear inmediatamente para que el usuario NO pueda scrollear
    blockScroll();

    let tl: gsap.core.Timeline | null = null;
    const delayMs = 3500;
    const timeoutId = window.setTimeout(() => {
      // arrancar la secuencia de texto (siempre con scroll bloqueado)
      tl = gsap.timeline({
        onComplete: () => {
          // cuando termina la secuencia (miVidaRef ya se mostró), desbloqueamos
          unblockScroll();
        },
      });

      if (apr) {
        tl.to(apr, {
          duration: 0.8,
          autoAlpha: 1,
          filter: "blur(0px)",
          ease: "power2.out",
        });
      }

      if (exp) {
        tl.to(
          exp,
          {
            duration: 0.8,
            autoAlpha: 1,
            filter: "blur(0px)",
            ease: "power2.out",
          },
          "+=0.12"
        );
      }

      if (mi) {
        tl.fromTo(
          mi,
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
          "+=0.12"
        );
      }
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (tl) tl.kill();
      if (apr) gsap.killTweensOf(apr);
      if (exp) gsap.killTweensOf(exp);
      if (mi) gsap.killTweensOf(mi);
      // siempre intentar desbloquear si algo queda activo
      try {
        unblockScroll();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  return {
    revealRef,
    isMobile,
    isDesktopXL,
    overlayRef,
    aprendizajeRef,
    experienciaRef,
    miVidaRef,
    raysRef,
    mounted,
    wrapperRef,
    contentRef,
  };
};
