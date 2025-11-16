import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DarkVeil from "../components/DarkVeil";
import StarsCanvas from "../components/StarBackground";
import { SlidersSkills, type dataSkills } from "../components/SlidersSkills";
import {
  FaAngular,
  FaBootstrap,
  FaCss3Alt,
  FaDocker,
  FaFigma,
  FaGithub,
  FaHtml5,
  FaLaravel,
  FaNodeJs,
  FaPhp,
  FaPython,
  FaReact,
  FaSass,
} from "react-icons/fa6";
import { IoLogoJavascript } from "react-icons/io";
import { RiTailwindCssFill } from "react-icons/ri";
import {
  SiAdobeillustrator,
  SiAdobephotoshop,
  SiCoreldraw,
  SiExpress,
  SiMongodb,
  SiNestjs,
  SiTypeorm,
  SiVite,
} from "react-icons/si";
import { PiFramerLogoFill } from "react-icons/pi";
import { Icon } from "@iconify/react";
import { TbBrandSocketIo, TbPointFilled } from "react-icons/tb";
import { BiLogoPostgresql } from "react-icons/bi";
import FadeContent from "../components/FadeContent";

const dataFront: dataSkills[] = [
  {
    tecnology: "HTML",
    percentage: 90,
    icon: <FaHtml5 size={30} color="#fff" />,
  },
  {
    tecnology: "CSS",
    percentage: 85,
    icon: <FaCss3Alt size={30} color="#fff" />,
  },
  {
    tecnology: "Javascript",
    percentage: 75,
    icon: <IoLogoJavascript size={30} color="#fff" />,
  },
  {
    tecnology: "Typescript",
    percentage: 75,
    icon: (
      <Icon
        icon="vscode-icons:file-type-typescript"
        width="35"
        height="35"
        className="icon-ts"
      />
    ),
  },
  {
    tecnology: "SASS",
    percentage: 75,
    icon: <FaSass size={30} color="#fff" />,
  },
  {
    tecnology: "Bootstrap",
    percentage: 50,
    icon: <FaBootstrap size={30} color="#fff" />,
  },
  {
    tecnology: "Tailwind CSS",
    percentage: 85,
    icon: <RiTailwindCssFill size={30} color="#fff" />,
  },
  {
    tecnology: "Github",
    percentage: 80,
    icon: <FaGithub size={30} color="#fff" />,
  },
  {
    tecnology: "Gsap",
    percentage: 60,
    icon: <Icon icon="simple-icons:gsap" width="33" height="33" />,
  },
  {
    tecnology: "Framer Motion",
    percentage: 60,
    icon: <PiFramerLogoFill size={30} color="#fff" />,
  },
  {
    tecnology: "Zustand",
    percentage: 75,
    icon: <Icon icon="devicon-plain:zustand" width="29" height="29" />,
  },
  {
    tecnology: "Axios",
    percentage: 70,
    icon: <Icon icon="simple-icons:axios" width="32" height="32" />,
  },
  {
    tecnology: "TanStack Query",
    percentage: 75,
    icon: "../../public/skills/splash-light.png",
  },
  {
    tecnology: "React",
    percentage: 85,
    icon: <FaReact size={30} color="#fff" />,
  },
  {
    tecnology: "Vite",
    percentage: 85,
    icon: <SiVite size={28} color="#fff" />,
  },
  {
    tecnology: "Next JS",
    percentage: 80,
    icon: <Icon icon="material-icon-theme:next" width="32" height="32" />,
  },
  {
    tecnology: "Angular",
    percentage: 60,
    icon: <FaAngular size={30} color="#fff" />,
  },
  {
    tecnology: "Laravel",
    percentage: 50,
    icon: <FaLaravel size={28} color="#fff" />,
  },
];

const dataBack: dataSkills[] = [
  {
    tecnology: "TypeScript",
    percentage: 70,
    icon: (
      <Icon
        icon="vscode-icons:file-type-typescript"
        width="35"
        height="35"
        className="icon-ts"
      />
    ),
  },
  {
    tecnology: "Python",
    percentage: 50,
    icon: <FaPython size={30} color="#fff" />,
  },
  { tecnology: "PHP", percentage: 45, icon: <FaPhp size={34} color="#fff" /> },
  {
    tecnology: "Node Js",
    percentage: 60,
    icon: <FaNodeJs size={30} color="#fff" />,
  },
  {
    tecnology: "Express",
    percentage: 55,
    icon: <SiExpress size={30} color="#fff" />,
  },
  {
    tecnology: "JWT",
    percentage: 50,
    icon: (
      <Icon icon="logos:jwt-icon" width="28" height="28" className="icon-ts" />
    ),
  },
  {
    tecnology: "Docker",
    percentage: 50,
    icon: <FaDocker size={30} color="#fff" />,
  },
  {
    tecnology: "Socket.IO",
    percentage: 45,
    icon: <TbBrandSocketIo size={35} color="#fff" />,
  },
  {
    tecnology: "Postgress",
    percentage: 65,
    icon: <BiLogoPostgresql size={33} color="#fff" />,
  },
  {
    tecnology: "Mongo DB",
    percentage: 50,
    icon: <SiMongodb size={33} color="#fff" />,
  },
  {
    tecnology: "Type ORM",
    percentage: 65,
    icon: <SiTypeorm size={30} color="#fff" />,
  },
  {
    tecnology: "Nest JS",
    percentage: 75,
    icon: <SiNestjs size={30} color="#fff" />,
  },
];

const dataDesigner: dataSkills[] = [
  {
    tecnology: "Photoshop",
    percentage: 50,
    icon: <SiAdobephotoshop size={30} color="#fff" />,
  },
  {
    tecnology: "Illustrator",
    percentage: 45,
    icon: <SiAdobeillustrator size={30} color="#fff" />,
  },
  {
    tecnology: "Corel Draw",
    percentage: 45,
    icon: <SiCoreldraw size={30} color="#fff" />,
  },
  {
    tecnology: "Figma",
    percentage: 45,
    icon: <FaFigma size={28} color="#fff" />,
  },
];

const dataFrontItems: string[] = [
  "Desarrollo de interfaces modernas y responsivas",
  "Implementación de componentes reutilizables con React/Next.js y TypeScript.",
  "Estilos limpios y escalables usando CSS modular / Tailwind.",
  "Consumo de APIs y manejo eficiente del estado global con Axios / Zustand.",
  "Animaciones fluidas e interactivas con GSAP / Framer Motion.",
  "Optimización del rendimiento y buenas prácticas de accesibilidad.",
];

const dataBackItems: string[] = [
  "Construcción de APIs sólidas y escalables en Node.js / TypeScript.",
  "Modelado y gestión de bases de datos con Postgres / MongoDB.",
  "Implementación de autenticación segura con JWT y validación robusta.",
  "Arquitecturas eficientes con Docker y control de versiones.",
  "Monitoreo, logs y manejo de errores para sistemas confiables.",
  "Diseño de lógica de negocio clara, mantenible y orientada al rendimiento.",
];

const dataDesignItems: string[] = [
  "Retoque y edición de imágenes con Photoshop.",
  "Ilustración y trabajo vectorial básico en Illustrator / CorelDRAW.",
  "Mockups y prototipos simples en Figma.",
  "Diseño limpio, funcional y fácil de integrar en proyectos web.",
];

type Section = { id: number; left: ReactNode; right: ReactNode };

const SECTIONS: Section[] = [
  {
    id: 1,
    left: (
      <div className="flex flex-col gap-6 w-[550px] items-end text-end translate-x-50 translate-y-50">
        <span className="text-6xl">Mis Habilidades</span>
        <span className=" font-crimson italic text-2xl leading-7">
          Combino desarrollo y diseño para convertir ideas en productos
          digitales coherentes: buena experiencia de usuario, lógica sólida y
          estética práctica. Me centro en soluciones mantenibles, rendimiento y
          buen diseño desde la idea hasta el despliegue.
        </span>
      </div>
    ),
    right: (
      <div className="w-[550px] -translate-x-35">
        <img
          src="../../public/skills/mainIconsdark.svg"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    ),
  },
  {
    id: 2,
    left: (
      <div className="w-full translate-x-50">
        <SlidersSkills data={dataFront} />
      </div>
    ),
    right: (
      <div className="w-full flex">
        <div className="w-[500px] translate-x-50 translate-y-33 flex flex-col gap-6">
          <div className="flex gap-4 items-end">
            <span className="text-5xl">Frontend</span>
            <span className="text-xl text-[#888] font-medium">(+4 años)</span>
          </div>
          <div className="flex flex-col gap-3 font-crimson italic">
            {dataFrontItems.map((item) => {
              return (
                <div className="flex gap-2">
                  <TbPointFilled className="mt-1 size-4 min-w-4" />
                  <span className="text-xl leading-6">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    left: (
      <div className="w-full flex justify-end">
        <div className="w-[500px] text-end -translate-x-50 translate-y-33 flex flex-col gap-6">
          <div className="flex gap-4 items-end justify-end">
            <span className="text-xl text-[#888] font-medium">(+1 año)</span>
            <span className="text-5xl">Backend</span>
          </div>
          <div className="flex flex-col gap-3 font-crimson italic">
            {dataBackItems.map((item) => {
              return (
                <div className="flex justify-end gap-2">
                  <span className="text-xl leading-6">{item}</span>
                  <TbPointFilled className="mt-1 size-4 min-w-4" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    right: (
      <div className="w-full -translate-x-50">
        <SlidersSkills data={dataBack} />
      </div>
    ),
  },
  {
    id: 4,
    left: (
      <div className="w-full translate-x-50">
        <SlidersSkills
          data={dataDesigner}
          classNames={{
            content: "!w-[400px] !grid-cols-1",
          }}
        />
      </div>
    ),
    right: (
      <div className="w-full flex">
        <div className="w-[500px] translate-y-33 flex flex-col gap-6">
          <div className="flex gap-4 items-end">
            <span className="text-5xl">Designer</span>
            <span className="text-xl text-[#888] font-medium">(+1 año)</span>
          </div>
          <div className="flex flex-col gap-3 font-crimson italic">
            {dataDesignItems.map((item) => {
              return (
                <div className="flex gap-2">
                  <TbPointFilled className="mt-1 size-4 min-w-4" />
                  <span className="text-xl leading-6">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
  },
];

const DURATION = 1.5; // duración animación de desplazamiento (igual)
const FADE_OUT_DURATION = 0.35; // salida (rápida)
const FADE_IN_DURATION = 0.9; // entrada (más lenta para que se note)
const FADE_IN_DELAY = DURATION * 0.35; // empezar el fade-in cuando la columna ya ha avanzado ~35%
const LOCK_MS = 700;

export const Skills: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const lastTimeRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    try {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const previousOverflow =
      document.documentElement.style.overflow || document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow || "";
      document.body.style.overflow = previousOverflow || "";
    };
  }, []);

  useEffect(() => {
    const sections = SECTIONS.length;
    const maxIndex = sections - 1;

    // Inicial: para la columna izquierda invertida necesitamos desplazarla
    // para que muestre la sección 1 en el primer viewport.
    const initLeftOffset = -maxIndex * window.innerHeight;
    gsap.set(leftRef.current, { y: initLeftOffset });
    gsap.set(rightRef.current, { y: 0 });

    // Inicializar opacidades: ocultar todas y mostrar las actuales (index 0)
    const setInitialOpacities = () => {
      const leftChildren = leftRef.current?.children ?? [];
      const rightChildren = rightRef.current?.children ?? [];

      for (let i = 0; i < leftChildren.length; i++) {
        gsap.set(leftChildren[i], { autoAlpha: 0, pointerEvents: "none" });
      }
      for (let i = 0; i < rightChildren.length; i++) {
        gsap.set(rightChildren[i], { autoAlpha: 0, pointerEvents: "none" });
      }

      // left is rendered reversed: visible child index = maxIndex - index
      const leftVisibleIndex = maxIndex - indexRef.current;
      const rightVisibleIndex = indexRef.current;
      if (leftChildren[leftVisibleIndex]) {
        gsap.set(leftChildren[leftVisibleIndex], {
          autoAlpha: 1,
          pointerEvents: "auto",
        });
      }
      if (rightChildren[rightVisibleIndex]) {
        gsap.set(rightChildren[rightVisibleIndex], {
          autoAlpha: 1,
          pointerEvents: "auto",
        });
      }
    };

    setInitialOpacities();

    // helper para animar a un índice
    const goTo = (idx: number) => {
      const clamped = Math.max(0, Math.min(maxIndex, idx));
      const prev = indexRef.current;
      if (prev === clamped) return;

      const vh = window.innerHeight;
      // Para la izquierda (lista invertida): y = (idx - maxIndex) * vh
      const yLeft = (clamped - maxIndex) * vh;
      // Para la derecha (orden normal): y = -idx * vh (sube)
      const yRight = -clamped * vh;

      // índices de hijos DOM
      const leftChildren = leftRef.current?.children ?? [];
      const rightChildren = rightRef.current?.children ?? [];

      const prevLeftIndex = maxIndex - prev;
      const nextLeftIndex = maxIndex - clamped;

      const prevRightIndex = prev;
      const nextRightIndex = clamped;

      // matar tweens previos para evitar parpadeos
      gsap.killTweensOf([leftRef.current, rightRef.current]);
      if (leftChildren[prevLeftIndex])
        gsap.killTweensOf(leftChildren[prevLeftIndex]);
      if (leftChildren[nextLeftIndex])
        gsap.killTweensOf(leftChildren[nextLeftIndex]);
      if (rightChildren[prevRightIndex])
        gsap.killTweensOf(rightChildren[prevRightIndex]);
      if (rightChildren[nextRightIndex])
        gsap.killTweensOf(rightChildren[nextRightIndex]);

      // mover columnas (como antes)
      gsap.to(leftRef.current, {
        y: yLeft,
        duration: DURATION,
        ease: "power2.out",
      });
      gsap.to(rightRef.current, {
        y: yRight,
        duration: DURATION,
        ease: "power2.out",
      });

      // Fade out prev, fade in next (autoAlpha controla visibility+opacity)
      // Left: salir
      if (leftChildren[prevLeftIndex]) {
        gsap.to(leftChildren[prevLeftIndex], {
          autoAlpha: 0,
          duration: FADE_OUT_DURATION,
          ease: "power1.out",
          onComplete: () => {
            try {
              (leftChildren[prevLeftIndex] as HTMLElement).style.pointerEvents =
                "none";
            } catch {}
          },
        });
      }

      // Left: entrar (set + delayed fade-in más larga)
      if (leftChildren[nextLeftIndex]) {
        gsap.set(leftChildren[nextLeftIndex], {
          autoAlpha: 0,
          pointerEvents: "none",
        });
        gsap.to(leftChildren[nextLeftIndex], {
          autoAlpha: 1,
          duration: FADE_IN_DURATION,
          delay: FADE_IN_DELAY,
          ease: "power1.out",
          onComplete: () => {
            try {
              (leftChildren[nextLeftIndex] as HTMLElement).style.pointerEvents =
                "auto";
            } catch {}
          },
        });
      }

      // Right: salir
      if (rightChildren[prevRightIndex]) {
        gsap.to(rightChildren[prevRightIndex], {
          autoAlpha: 0,
          duration: FADE_OUT_DURATION,
          ease: "power1.out",
          onComplete: () => {
            try {
              (
                rightChildren[prevRightIndex] as HTMLElement
              ).style.pointerEvents = "none";
            } catch {}
          },
        });
      }

      // Right: entrar
      if (rightChildren[nextRightIndex]) {
        gsap.set(rightChildren[nextRightIndex], {
          autoAlpha: 0,
          pointerEvents: "none",
        });
        gsap.to(rightChildren[nextRightIndex], {
          autoAlpha: 1,
          duration: FADE_IN_DURATION,
          delay: FADE_IN_DELAY,
          ease: "power1.out",
          onComplete: () => {
            try {
              (
                rightChildren[nextRightIndex] as HTMLElement
              ).style.pointerEvents = "auto";
            } catch {}
          },
        });
      }

      indexRef.current = clamped;
    };

    // wheel handler
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < LOCK_MS) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      if (e.deltaY > 0) {
        if (indexRef.current < maxIndex) {
          lastTimeRef.current = now;
          goTo(indexRef.current + 1);
        }
      } else if (e.deltaY < 0) {
        if (indexRef.current > 0) {
          lastTimeRef.current = now;
          goTo(indexRef.current - 1);
        }
      }
    };

    // touch handlers
    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches?.[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      if (startY == null) return;
      const endY = e.changedTouches?.[0]?.clientY ?? null;
      if (endY == null) return;
      const diff = startY - endY;
      const THRESH = 40;
      const now = Date.now();
      if (now - lastTimeRef.current < LOCK_MS) return;
      if (diff > THRESH) {
        if (indexRef.current < maxIndex) {
          lastTimeRef.current = now;
          goTo(indexRef.current + 1);
        }
      } else if (diff < -THRESH) {
        if (indexRef.current > 0) {
          lastTimeRef.current = now;
          goTo(indexRef.current - 1);
        }
      }
    };

    // keyboard
    const onKey = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < LOCK_MS) return;
      if (e.key === "ArrowDown") {
        if (indexRef.current < maxIndex) {
          lastTimeRef.current = now;
          goTo(indexRef.current + 1);
        }
      } else if (e.key === "ArrowUp") {
        if (indexRef.current > 0) {
          lastTimeRef.current = now;
          goTo(indexRef.current - 1);
        }
      }
    };

    // resize: recalcula offsets (muy importante)
    const onResize = () => {
      const idx = indexRef.current;
      // re-aplicar posiciones sin animación
      const vh = window.innerHeight;
      gsap.set(leftRef.current, { y: (idx - maxIndex) * vh });
      gsap.set(rightRef.current, { y: -idx * vh });
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // render: left list rendered reversed so visual moves 'down' when index increases
  const leftSectionsReversed = [...SECTIONS].reverse();

  return (
    <div className="bg-[#111] h-screen relative text-white">
      <FadeContent
        blur={true}
        duration={1000}
        delay={500}
        easing="ease-out"
        initialOpacity={0}
        className="w-full h-screen fixed z-10"
      >
        <StarsCanvas />
      </FadeContent>

      <FadeContent
        blur={true}
        duration={5000}
        delay={2500}
        easing="ease-out"
        initialOpacity={0}
        className="w-full h-[600px] relative"
      >
        <DarkVeil />
      </FadeContent>

      <FadeContent
        blur={true}
        duration={1000}
        delay={1500}
        easing="ease-out"
        initialOpacity={0}
        className="absolute top-0 left-0 w-full"
      >
        <section
          ref={containerRef}
          className="w-full h-screen relative overflow-hidden z-[999]"
          aria-label="Skills split scroller"
        >
          <div className="absolute inset-0 grid grid-cols-2">
            {/* LEFT COLUMN (lista invertida para que visual baje) */}

            <div ref={leftRef} className="flex flex-col w-full">
              {leftSectionsReversed.map((s) => (
                <div
                  key={s.id}
                  className={`split-item w-full h-screen flex items-center justify-center`}
                  style={{ minHeight: "100vh" }}
                >
                  {s.left}
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN (orden normal, sube) */}

            <div ref={rightRef} className="flex flex-col w-full">
              {SECTIONS.map((s) => (
                <div
                  key={s.id}
                  className={`split-item w-full h-screen flex items-center justify-center`}
                  style={{ minHeight: "100vh" }}
                >
                  {s.right}
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeContent>
    </div>
  );
};

export default Skills;
