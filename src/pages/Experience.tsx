// src/pages/Experience.tsx
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TIMELINE_EVENTS: Array<
  { year: string; title: string; desc: string; side: "left" | "right" } & (
    | { y?: never; progress?: never }
    | { y: number; progress?: never }
    | { progress: number; y?: never }
  )
> = [
  {
    year: "2015",
    title: "Curso X",
    desc: "Descripción corta del curso X",
    side: "left",
    y: 750,
  },
  {
    year: "2016",
    title: "Práctica Y",
    desc: "Descripción corta de la práctica Y",
    side: "right",
    progress: 0.25,
  },
  {
    year: "2018",
    title: "Trabajo Z",
    desc: "Descripción corta del trabajo Z",
    side: "left",
    progress: 0.5,
  },
  {
    year: "2021",
    title: "Bootcamp W",
    desc: "Descripción corta del bootcamp W",
    side: "right",
    progress: 0.75,
  },
];

const SVG_ID = "trace-line-fixed-experience";

type Pt = { x: number; y: number };

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Catmull-Rom -> cubic Bézier (genera 'd' string)
function catmullRomToBezier(points: Pt[]) {
  if (points.length < 2) return "";
  const dParts: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
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

// asegurar separación mínima por longitud (simple)
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
  // empujar hacia atrás si se sale
  for (let i = out.length - 1; i >= 0; i--) {
    const maxAllowed = maxLen - (out.length - 1 - i) * minGap;
    if (out[i] > maxAllowed) {
      out[i] = maxAllowed;
    }
  }
  return out;
}

// forzar separación vertical mínima (intenta empujar hacia abajo)
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
      // intenta incrementar length hasta cumplir gap
      let attempt = out[i];
      const step = Math.max(3, Math.floor(pathEl.getTotalLength() / 200)); // step adaptativo
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

const CircleScroll: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const revealPathRef = useRef<SVGPathElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const smootherRef = useRef<any>(null);

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
          const SVG_HEIGHT = 4000;
          const amplitude = 120;

          let svgEl = document.getElementById(SVG_ID) as SVGSVGElement | null;
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

            // stop 0%: naranja
            const stop1 = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "stop"
            );
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", "#ae38ff");
            stop1.setAttribute("stop-opacity", "1");

            // stop 60%: rosa
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

            // --- crear grupo y paths ---
            const g = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g"
            );
            g.setAttribute("id", "trace-group");

            // fondo (más ancho)
            const bgPath = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path"
            );
            bgPath.setAttribute("class", "stroke-current text-gray-200");
            bgPath.setAttribute("stroke-width", "5"); // <- grosor fondo (ajusta) // color fondo (fallback)
            bgPath.setAttribute("fill", "none");
            bgPath.setAttribute("stroke-linecap", "round");
            bgPath.setAttribute("stroke-linejoin", "round");
            const BG_COLOR = "#333"; // <- cámbialo aquí
            bgPath.style.stroke = BG_COLOR;

            // línea revelada (usa gradiente)
            const revealPath = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path"
            );
            revealPath.setAttribute("stroke-width", "5"); // ancho deseado
            revealPath.setAttribute("stroke", "url(#traceGradient)"); // usa el gradient
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

          // build anchors and path with Catmull-Rom
          const cx = window.innerWidth / 2;
          const anchors: Pt[] = [];
          const anchorYs = [0, 420, 980, 1500, 1960, 2600, 3300, SVG_HEIGHT];
          let noiseFn: any = null;
          try {
            const simplexMod = await import("simplex-noise");
            const SimplexCtor =
              (simplexMod as any).default ??
              (simplexMod as any).SimplexNoise ??
              simplexMod;
            noiseFn = new (SimplexCtor as any)();
          } catch {
            noiseFn = null;
          }
          for (let i = 0; i < anchorYs.length; i++) {
            const y = Math.min(SVG_HEIGHT, Math.max(0, anchorYs[i]));
            const zig =
              (i % 2 === 0 ? 1 : -1) *
              (amplitude * (0.25 + (i / anchorYs.length) * 0.9));
            const jitter = noiseFn
              ? noiseFn.noise2D(i * 0.12, 0.5) * 40
              : (Math.random() - 0.5) * 24;
            const x = cx + zig + jitter;
            anchors.push({ x, y });
          }

          const d = catmullRomToBezier(anchors);
          const gEl = groupRef.current!;
          const bgPathEl = gEl.querySelectorAll("path")[0] as
            | SVGPathElement
            | undefined;
          const revealPathEl = revealPathRef.current!;
          if (bgPathEl) bgPathEl.setAttribute("d", d);
          revealPathEl.setAttribute("d", d);

          // eliminar nodos previos para evitar duplicados
          const prevNodes = gEl.querySelectorAll(".timeline-node");
          if (prevNodes && prevNodes.length)
            prevNodes.forEach((n) => n.remove());

          // compute lengths + center
          const pathLen = revealPathEl.getTotalLength();
          const viewportCenter = window.innerHeight / 2;

          const lenAtCenter = findLengthAtY(
            revealPathEl,
            pathLen,
            viewportCenter
          );

          // stroke initial state + center group
          revealPathEl.setAttribute("stroke-dasharray", `${pathLen}`);
          const ptCenter = revealPathEl.getPointAtLength(lenAtCenter);
          const initialTranslateY = viewportCenter - ptCenter.y;
          gEl.setAttribute("transform", `translate(0, ${initialTranslateY})`);
          revealPathEl.setAttribute("stroke-dashoffset", `${pathLen}`);

          // spacer
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

          // -------------------------
          // Aquí: calcular lengthsForEvents usando y/progress/fallback + evitar solapes
          // -------------------------
          const startLenForItems = lenAtCenter + 20;
          const endLenForItems = pathLen - 20;
          const nEvents = TIMELINE_EVENTS.length;

          // 1) primer pase: generar según y/progress/fallback
          let lengthsForEvents = TIMELINE_EVENTS.map((ev, i) => {
            // si y proporcionado -> convertir a longitud
            const anyEv = ev as any;
            if (typeof anyEv.y === "number") {
              const desiredY = Math.max(0, Math.min(anyEv.y, SVG_HEIGHT));
              return findLengthAtY(revealPathEl, pathLen, desiredY);
            }
            if (typeof anyEv.progress === "number") {
              const p = Math.max(0, Math.min(1, anyEv.progress));
              return startLenForItems + p * (endLenForItems - startLenForItems);
            }
            // fallback: uniform con easing
            const t = i / Math.max(1, nEvents - 1);
            const tt = easeInOutQuad(t);
            return startLenForItems + tt * (endLenForItems - startLenForItems);
          });

          // 2) forzar separación mínima por longitud
          const MIN_GAP_LEN = 90; // ajusta si tus cards son más altas o más pequeñas
          lengthsForEvents = enforceMinSpacingByLength(
            lengthsForEvents,
            MIN_GAP_LEN,
            pathLen
          );

          // 3) opcional: forzar separación vertical para evitar solape de foreignObject visual
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
          };
          const nodes: Node[] = [];

          // ------------------ creación del nodo (borde cambia solo con opacity) ------------------
          lengthsForEvents.forEach((len, idx) => {
            const ev = TIMELINE_EVENTS[idx];
            const pt = revealPathEl.getPointAtLength(len);

            // parámetros visuales — ajústalos si quieres otro tamaño
            const dotR = 5; // radio del punto relleno
            const ringStroke = 4; // grosor del borde
            const ringR = dotR + Math.max(1, Math.floor(ringStroke / 1.7)); // radio del anillo
            const BG_COLOR = "#333"; // color del borde base (igual que la línea fija)

            // grupo por nodo (facilita transformaciones si fuese necesario)
            const nodeGroup = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g"
            );
            nodeGroup.setAttribute("class", "timeline-node");

            // 1) base: círculo relleno (#111)
            const baseCircle = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            ) as SVGCircleElement;
            baseCircle.setAttribute("cx", `${pt.x}`);
            baseCircle.setAttribute("cy", `${pt.y}`);
            baseCircle.setAttribute("r", `${dotR}`);
            baseCircle.setAttribute("fill", "#111");
            baseCircle.setAttribute("stroke", "none");

            // 2) ringBg: borde inicial (BG_COLOR) — permanece visible debajo
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

            // 3) ringReveal: stroke con gradiente (invisible inicialmente, se mostrará por opacity)
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
            // **Importante**: NO strokeDash ni animación de trazo — solo opacity
            ringReveal.style.opacity = "0";
            ringReveal.style.visibility = "visible";

            // añadir en orden (base debajo, ringBg encima, ringReveal encima)
            nodeGroup.appendChild(baseCircle);
            nodeGroup.appendChild(ringBg);
            nodeGroup.appendChild(ringReveal);
            gEl.appendChild(nodeGroup);

            // foreignObject (igual que antes)
            const fo = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "foreignObject"
            ) as SVGForeignObjectElement;
            fo.setAttribute("class", "timeline-node");
            const boxW = 260;
            const boxH = 84;
            const offsetX = 14;
            let foX =
              ev.side === "left" ? pt.x - offsetX - boxW : pt.x + offsetX;
            foX = Math.max(6, Math.min(window.innerWidth - boxW - 6, foX));
            const foY = pt.y - boxH / 2;
            fo.setAttribute("x", `${foX}`);
            fo.setAttribute("y", `${foY}`);
            fo.setAttribute("width", `${boxW}`);
            fo.setAttribute("height", `${boxH}`);
            fo.setAttribute("pointer-events", "all");
            fo.innerHTML = `
              <div xmlns="http://www.w3.org/1999/xhtml" class="${
                ev.side === "left"
                  ? "flex justify-end pr-3 items-center h-full"
                  : "flex justify-start pl-3 items-center h-full"
              }">
                <div class="bg-white border border-gray-100 shadow rounded-lg p-3 text-left">
                  <div class="text-xs font-semibold text-gray-900">${ev.year}</div>
                  <div class="text-sm font-semibold">${ev.title}</div>
                  <div class="text-sm text-gray-600 mt-1">${ev.desc}</div>
                </div>
              </div>
            `;
            (fo.style as any).opacity = "0";
            gEl.appendChild(fo);

            nodes.push({
              len,
              pt: { x: pt.x, y: pt.y },
              baseCircle,
              ringBg,
              ringReveal,
              fo,
              visible: false,
            });
          });
          // ------------------ fin creación del nodo ------------------

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

                  // mostrar foreignObject
                  gsap.killTweensOf(node.fo);
                  gsap.to(node.fo, {
                    autoAlpha: 1,
                    duration: 0.28,
                    ease: "power2.out",
                  });

                  // Mostrar gradiente del borde mediante opacity (fade-in)
                  gsap.killTweensOf(node.ringReveal);
                  gsap.to(node.ringReveal, {
                    autoAlpha: 1,
                    duration: 0.35,
                    ease: "power2.out",
                  });

                  // NOTE: no ocultamos ringBg — lo dejamos como base visible.
                }
              } else {
                if (delta < 0 && curLen < node.len - hideThreshold) {
                  node.visible = false;

                  // ocultar foreignObject
                  gsap.killTweensOf(node.fo);
                  gsap.to(node.fo, {
                    autoAlpha: 0,
                    duration: 0.22,
                    ease: "power2.out",
                  });

                  // Ocultar gradiente del borde mediante opacity (fade-out)
                  gsap.killTweensOf(node.ringReveal);
                  gsap.to(node.ringReveal, {
                    autoAlpha: 0,
                    duration: 0.25,
                    ease: "power2.inOut",
                  });

                  // ringBg permanece
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
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full min-h-screen overflow-auto bg-[#111]"
    >
      <div ref={contentRef} className="relative w-full" />

      <style>{`
        @keyframes scroll { 0% { transform: translateY(0); } 100% { transform: translateY(10px); } }
        .animate-scroll { animation: scroll 0.95s ease-in-out alternate infinite; fill: none; stroke: #000; stroke-linecap: round; stroke-miterlimit: 10; stroke-width: 1; }
        .circle { will-change: transform, opacity; width: 4px; height: 4px; border-radius: 50%; background: transparent; }
      `}</style>
    </div>
  );
};

export default CircleScroll;
