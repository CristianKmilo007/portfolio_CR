// src/pages/Skills.tsx
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DarkVeil from "../components/DarkVeil";
import StarsCanvas from "../components/StarBackground";
import { SlidersSkills, type dataSkills } from "../components/SlidersSkills";
import FadeContent from "../components/FadeContent";
import { useResponsive } from "../hooks/useMediaQuery";

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
import ServicesModal from "../components/ServicesModal";
import { Button, useDisclosure } from "@heroui/react";

gsap.registerPlugin(ScrollTrigger);

// ---------- Datos (mantén exactamente los tuyos) ----------

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

// ---------- Constantes de animación ----------
const DURATION = 1.5;
const FADE_OUT_DURATION = 0.35;
const FADE_IN_DURATION = 0.9;
const FADE_IN_DELAY = DURATION * 0.35;
const LOCK_MS = 700;

export const Skills: React.FC = () => {
  const { isLaptop, isMobile } = useResponsive();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const lastTimeRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isItems, setIsItems] = useState<Array<string>>([]);

  const dataFront: dataSkills[] = [
    {
      tecnology: "HTML",
      percentage: 90,
      icon: <FaHtml5 size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "CSS",
      percentage: 85,
      icon: <FaCss3Alt size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Javascript",
      percentage: 75,
      icon: <IoLogoJavascript size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Typescript",
      percentage: 75,
      icon: (
        <Icon
          icon="vscode-icons:file-type-typescript"
          width={isMobile ? 27 : 35}
          height={isMobile ? 27 : 35}
          className="icon-ts"
        />
      ),
    },
    {
      tecnology: "SASS",
      percentage: 75,
      icon: <FaSass size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Bootstrap",
      percentage: 50,
      icon: <FaBootstrap size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Tailwind CSS",
      percentage: 85,
      icon: <RiTailwindCssFill size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Github",
      percentage: 80,
      icon: <FaGithub size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Gsap",
      percentage: 60,
      icon: (
        <Icon
          icon="simple-icons:gsap"
          width={isMobile ? 25 : 33}
          height={isMobile ? 25 : 33}
        />
      ),
    },
    {
      tecnology: "Framer Motion",
      percentage: 60,
      icon: <PiFramerLogoFill size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Zustand",
      percentage: 75,
      icon: (
        <Icon
          icon="devicon-plain:zustand"
          width={isMobile ? 21 : 29}
          height={isMobile ? 21 : 29}
        />
      ),
    },
    {
      tecnology: "Axios",
      percentage: 70,
      icon: (
        <Icon
          icon="simple-icons:axios"
          width={isMobile ? 24 : 32}
          height={isMobile ? 24 : 32}
        />
      ),
    },
    {
      tecnology: "TanStack Query",
      percentage: 75,
      icon: "../../public/skills/splash-light.png",
    },
    {
      tecnology: "React",
      percentage: 85,
      icon: <FaReact size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Vite",
      percentage: 85,
      icon: <SiVite size={isMobile ? 20 : 28} color="#fff" />,
    },
    {
      tecnology: "Next JS",
      percentage: 80,
      icon: (
        <Icon
          icon="material-icon-theme:next"
          width={isMobile ? 24 : 32}
          height={isMobile ? 24 : 32}
        />
      ),
    },
    {
      tecnology: "Angular",
      percentage: 60,
      icon: <FaAngular size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Laravel",
      percentage: 50,
      icon: <FaLaravel size={isMobile ? 20 : 28} color="#fff" />,
    },
  ];

  const dataBack: dataSkills[] = [
    {
      tecnology: "TypeScript",
      percentage: 70,
      icon: (
        <Icon
          icon="vscode-icons:file-type-typescript"
          width={isMobile ? 27 : 35}
          height={isMobile ? 27 : 35}
          className="icon-ts"
        />
      ),
    },
    {
      tecnology: "Python",
      percentage: 50,
      icon: <FaPython size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "PHP",
      percentage: 45,
      icon: <FaPhp size={isMobile ? 26 : 34} color="#fff" />,
    },
    {
      tecnology: "Node Js",
      percentage: 60,
      icon: <FaNodeJs size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Express",
      percentage: 55,
      icon: <SiExpress size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "JWT",
      percentage: 50,
      icon: (
        <Icon
          icon="logos:jwt-icon"
          width={isMobile ? 20 : 28}
          height={isMobile ? 20 : 28}
          className="icon-ts"
        />
      ),
    },
    {
      tecnology: "Docker",
      percentage: 50,
      icon: <FaDocker size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Socket.IO",
      percentage: 45,
      icon: <TbBrandSocketIo size={isMobile ? 27 : 35} color="#fff" />,
    },
    {
      tecnology: "Postgress",
      percentage: 65,
      icon: <BiLogoPostgresql size={isMobile ? 25 : 33} color="#fff" />,
    },
    {
      tecnology: "Mongo DB",
      percentage: 50,
      icon: <SiMongodb size={isMobile ? 25 : 33} color="#fff" />,
    },
    {
      tecnology: "Type ORM",
      percentage: 65,
      icon: <SiTypeorm size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Nest JS",
      percentage: 75,
      icon: <SiNestjs size={isMobile ? 22 : 30} color="#fff" />,
    },
  ];

  const dataDesigner: dataSkills[] = [
    {
      tecnology: "Photoshop",
      percentage: 50,
      icon: <SiAdobephotoshop size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Illustrator",
      percentage: 45,
      icon: <SiAdobeillustrator size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Corel Draw",
      percentage: 45,
      icon: <SiCoreldraw size={isMobile ? 22 : 30} color="#fff" />,
    },
    {
      tecnology: "Figma",
      percentage: 45,
      icon: <FaFigma size={isMobile ? 20 : 28} color="#fff" />,
    },
  ];

  const SECTIONS: Section[] = [
    {
      id: 1,
      left: (
        <div className="flex flex-col gap-4 px-6 lg:px-0 lg:gap-6 w-full sm:w-[500px] lg:w-[450px] xl:w-[550px] lg:items-end text-start lg:text-end translate-x-0 lg:translate-x-10 2xl:translate-x-50 translate-y-15 lg:translate-y-40 xl:translate-y-50">
          <span className="text-4xl md:text-5xl lg:text-6xl">
            Mis Habilidades
          </span>
          <span className=" font-crimson italic text-xl lg:text-2xl leading-6 lg:leading-7">
            Combino desarrollo y diseño para convertir ideas en productos
            digitales coherentes: buena experiencia de usuario, lógica sólida y
            estética práctica. Me centro en soluciones mantenibles, rendimiento
            y buen diseño desde la idea hasta el despliegue.
          </span>
        </div>
      ),
      right: (
        <div className="w-[450px] min-w-[450px] sm:w-[550px] sm:min-w-[550px] translate-x-0 md:translate-x-20 lg:-translate-x-10 2xl:-translate-x-35 translate-y-25 lg:translate-y-0 ">
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
        <div className="w-full px-4 2xl:px-0 translate-x-0 lg:translate-x-25 xl:translate-x-30 2xl:translate-x-50 -translate-y-15 sm:-translate-y-15 lg:translate-y-0">
          <SlidersSkills
            data={dataFront}
            classNames={{
              base: "container mx-auto lg:mx-0 lg:!w-full",
              content: "container lg:!w-[600px] xl:!w-[700px] 2xl:!w-[800px]",
              buttons:
                "-top-16 lg:top-auto lg:bottom-0 right-[calc(0%+4px)] lg:right-auto lg:left-0",
            }}
          />
        </div>
      ),
      right: (
        <div className="w-full flex">
          <div className="container mx-auto lg:mx-0 lg:w-[350px] xl:w-[450px] 2xl:w-[548px] translate-x-0 lg:translate-x-30 2xl:translate-x-40 translate-y-10 lg:translate-y-20 xl:translate-y-25 2xl:translate-y-33 flex flex-col gap-6 pl-4 pr-4 lg:pr-0 lg:pl-0 xl:pl-12">
            <div className="flex gap-x-4 flex-wrap items-end">
              <span className="text-4xl sm:text-5xl">Frontend</span>
              {isLaptop && (
                <Button
                  size="sm"
                  radius="full"
                  variant="bordered"
                  className="border-1 text-white text-sm font-medium"
                  onPress={() => {
                    setIsItems(dataFrontItems);
                    onOpen();
                  }}
                >
                  Servicios
                </Button>
              )}
              <span className="text-xl text-[#888] font-medium w-full sm:w-max">
                (+4 años)
              </span>
            </div>
            <div className="hidden lg:flex flex-col gap-3 font-crimson italic">
              {dataFrontItems.map((item) => (
                <div className="flex gap-2" key={item}>
                  <TbPointFilled className="mt-1 size-4 min-w-4" />
                  <span className="text-xl leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      left: isLaptop ? (
        <div className="w-full px-4 2xl:px-0 translate-x-0 lg:translate-x-25 xl:translate-x-30 2xl:translate-x-50 -translate-y-33 sm:-translate-y-22 lg:translate-y-0">
          <SlidersSkills
            data={dataBack}
            classNames={{
              base: "container mx-auto lg:mx-0 lg:!w-full",
              content: "container lg:!w-[600px] xl:!w-[700px] 2xl:!w-[800px]",
              buttons:
                "-top-16 lg:top-auto lg:bottom-0 right-[calc(0%+4px)] lg:right-auto lg:left-5",
            }}
          />
        </div>
      ) : (
        <div className="w-full flex justify-end">
          <div className="container mx-auto lg:mx-0 lg:w-[350px] xl:w-[450px] 2xl:w-[500px] text-end translate-x-0 lg:-translate-x-30 2xl:-translate-x-50 translate-y-10 lg:translate-y-20 xl:translate-y-25 2xl:translate-y-33 flex flex-col gap-6 pl-4 pr-4 lg:pl-0 lg:pr-0 xl:pr-12">
            <div className="flex gap-x-4 flex-wrap items-end justify-end">
              <span className="text-4xl sm:text-5xl">Backend</span>
              {isLaptop && (
                <Button
                  size="sm"
                  radius="full"
                  variant="bordered"
                  className="border-1 text-white text-sm font-medium"
                  onPress={() => {
                    setIsItems(dataFrontItems);
                    onOpen();
                  }}
                >
                  Servicios
                </Button>
              )}
              <span className="text-xl text-[#888] font-medium w-full sm:w-max">
                (+1 año)
              </span>
            </div>
            <div className="hidden lg:flex flex-col gap-3 font-crimson italic">
              {dataFrontItems.map((item) => (
                <div className="flex justify-end gap-2" key={item}>
                  <span className="text-xl leading-6">{item}</span>
                  <TbPointFilled className="mt-1 size-4 min-w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),

      right: isLaptop ? (
        <div className="w-full flex">
          <div className="container mx-auto lg:mx-0 lg:w-[350px] xl:w-[450px] 2xl:w-[548px] translate-x-0 lg:translate-x-30 2xl:translate-x-40 translate-y-10 lg:translate-y-20 xl:translate-y-25 2xl:translate-y-33 flex flex-col gap-6 pl-4 pr-4 lg:pr-0 lg:pl-0 xl:pl-12">
            <div className="flex gap-x-4 flex-wrap items-end">
              <span className="text-4xl sm:text-5xl">Backend</span>
              {isLaptop && (
                <Button
                  size="sm"
                  radius="full"
                  variant="bordered"
                  className="border-1 text-white text-sm font-medium"
                  onPress={() => {
                    setIsItems(dataBackItems);
                    onOpen();
                  }}
                >
                  Servicios
                </Button>
              )}
              <span className="text-xl text-[#888] font-medium w-full sm:w-max">
                (+1 año)
              </span>
            </div>
            <div className="hidden lg:flex flex-col gap-3 font-crimson italic">
              {dataBackItems.map((item) => (
                <div className="flex gap-2" key={item}>
                  <TbPointFilled className="mt-1 size-4 min-w-4" />
                  <span className="text-xl leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full px-4 2xl:px-0 translate-x-0 lg:-translate-x-25 xl:-translate-x-30 2xl:-translate-x-50 -translate-y-15 lg:translate-y-0">
          <SlidersSkills
            data={dataBack}
            classNames={{
              base: "container mx-auto lg:mx-0 lg:!w-full",
              content: "container lg:!w-[600px] xl:!w-[700px] 2xl:!w-[800px]",
              buttons:
                "-top-16 lg:top-auto lg:bottom-0 right-[calc(0%+4px)] lg:right-auto lg:left-5",
            }}
          />
        </div>
      ),
    },
    {
      id: 4,
      left: (
        <div className="w-full px-4 2xl:px-0 translate-x-0 lg:translate-x-25 xl:translate-x-40 2xl:translate-x-50 -translate-y-45 sm:-translate-y-35 lg:translate-y-0">
          <SlidersSkills
            data={dataDesigner}
            classNames={{
              base: "container mx-auto lg:mx-0 lg:!w-full",
              content:
                "container lg:!w-[400px] xl:!w-[400px] 2xl:!w-[400px] !grid-cols-1",
              buttons:
                "-top-16 lg:top-auto lg:bottom-0 right-[calc(0%+4px)] lg:right-auto lg:left-55",
            }}
          />
        </div>
      ),
      right: (
        <div className="w-full flex">
          <div className="container mx-auto lg:mx-0 lg:w-[350px] xl:w-[450px] 2xl:w-[548px] translate-x-0 lg:translate-x-15 2xl:translate-x-0 translate-y-10 lg:translate-y-20 xl:translate-y-25 2xl:translate-y-33 flex flex-col gap-6 pl-4 pr-4 lg:pr-0 lg:pl-0 xl:pl-12">
            <div className="flex gap-x-4 flex-wrap items-end">
              <span className="text-4xl sm:text-5xl">Designer</span>
              {isLaptop && (
                <Button
                  size="sm"
                  radius="full"
                  variant="bordered"
                  className="border-1 text-white text-sm font-medium"
                  onPress={() => {
                    setIsItems(dataDesignItems);
                    onOpen();
                  }}
                >
                  Servicios
                </Button>
              )}
              <span className="text-xl text-[#888] font-medium w-full sm:w-max">
                (+1 año)
              </span>
            </div>
            <div className="hidden lg:flex flex-col gap-3 font-crimson italic">
              {dataDesignItems.map((item) => (
                <div className="flex gap-2" key={item}>
                  <TbPointFilled className="mt-1 size-4 min-w-4" />
                  <span className="text-xl leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

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

    // helpers
    const size = () => (isLaptop ? window.innerWidth : window.innerHeight);

    // Inicial: para la columna izquierda invertida necesitamos desplazarla
    const initLeftOffset = -maxIndex * size();

    // --- IMPORTANT: siempre seteamos ambos ejes para evitar residuos ---
    if (isLaptop) {
      // horizontal mode: posicionamos en X y garantizamos Y=0
      gsap.set(leftRef.current, { x: initLeftOffset, y: 0 });
      gsap.set(rightRef.current, { x: 0, y: 0 });
    } else {
      // vertical mode: posicionamos en Y y garantizamos X=0
      gsap.set(leftRef.current, { y: initLeftOffset, x: 0 });
      gsap.set(rightRef.current, { y: 0, x: 0 });
    }

    // Inicializar opacidades
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

      const s = size();

      // Para mantener la lógica original (left invertido en DOM):
      // leftPos = (clamped - maxIndex) * s  -> funciona para centrar leftChildren[maxIndex - idx]
      // rightPos = -clamped * s
      // Pero **importante**: en modo horizontal (isLaptop) esto produce:
      //  - leftRef.x pasa de negativo grande hacia 0 (se mueve hacia la derecha)
      //  - rightRef.x pasa de 0 hacia negativo (se mueve hacia la izquierda)
      const leftPos = (clamped - maxIndex) * s;
      const rightPos = -clamped * s;

      const leftChildren = leftRef.current?.children ?? [];
      const rightChildren = rightRef.current?.children ?? [];

      const prevLeftIndex = maxIndex - prev;
      const nextLeftIndex = maxIndex - clamped;

      const prevRightIndex = prev;
      const nextRightIndex = clamped;

      // matar tweens previos
      gsap.killTweensOf([leftRef.current, rightRef.current]);
      if (leftChildren[prevLeftIndex])
        gsap.killTweensOf(leftChildren[prevLeftIndex]);
      if (leftChildren[nextLeftIndex])
        gsap.killTweensOf(leftChildren[nextLeftIndex]);
      if (rightChildren[prevRightIndex])
        gsap.killTweensOf(rightChildren[prevRightIndex]);
      if (rightChildren[nextRightIndex])
        gsap.killTweensOf(rightChildren[nextRightIndex]);

      // mover columnas (IMPORTANTE: siempre seteamos ambos ejes)
      if (isLaptop) {
        // horizontal -> left moves right (x increases toward 0), right moves left (x decreases)
        gsap.to(leftRef.current, {
          x: leftPos,
          y: 0,
          duration: DURATION,
          ease: "power2.out",
        });
        gsap.to(rightRef.current, {
          x: rightPos,
          y: 0,
          duration: DURATION,
          ease: "power2.out",
        });
      } else {
        // vertical -> original behavior
        gsap.to(leftRef.current, {
          y: leftPos,
          x: 0,
          duration: DURATION,
          ease: "power2.out",
        });
        gsap.to(rightRef.current, {
          y: rightPos,
          x: 0,
          duration: DURATION,
          ease: "power2.out",
        });
      }

      // Fade out prev (left)
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

      // Fade in next (left)
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

      // Fade out prev (right)
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

      // Fade in next (right)
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
      if (isLaptop) {
        // en tablet preferimos deltaY para mapear scroll vertical a avance horizontal
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
        return;
      }

      // Desktop (vertical)
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
      touchStartXRef.current = e.touches?.[0]?.clientX ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < LOCK_MS) return;

      if (isLaptop) {
        const startX = touchStartXRef.current;
        touchStartXRef.current = null;
        if (startX == null) return;
        const endX = e.changedTouches?.[0]?.clientX ?? null;
        if (endX == null) return;
        const diff = startX - endX;
        const THRESH = 40;
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
      } else {
        const startY = touchStartYRef.current;
        touchStartYRef.current = null;
        if (startY == null) return;
        const endY = e.changedTouches?.[0]?.clientY ?? null;
        if (endY == null) return;
        const diff = startY - endY;
        const THRESH = 40;
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
      }
    };

    // keyboard
    const onKey = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < LOCK_MS) return;
      if (isLaptop) {
        if (e.key === "ArrowRight") {
          if (indexRef.current < maxIndex) {
            lastTimeRef.current = now;
            goTo(indexRef.current + 1);
          }
        } else if (e.key === "ArrowLeft") {
          if (indexRef.current > 0) {
            lastTimeRef.current = now;
            goTo(indexRef.current - 1);
          }
        }
      } else {
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
      }
    };

    // resize: recalcula offsets (muy importante)
    const onResize = () => {
      const idx = indexRef.current;
      const s = size();
      if (isLaptop) {
        gsap.set(leftRef.current, { x: (idx - maxIndex) * s, y: 0 });
        gsap.set(rightRef.current, { x: -idx * s, y: 0 });
      } else {
        gsap.set(leftRef.current, { y: (idx - maxIndex) * s, x: 0 });
        gsap.set(rightRef.current, { y: -idx * s, x: 0 });
      }
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
      gsap.killTweensOf([leftRef.current, rightRef.current]);
    };
  }, [isLaptop]);

  // render: left list rendered reversed so visual moves 'down' when index increases
  const leftSectionsReversed = [...SECTIONS].reverse();

  return (
    <div className="bg-[#111] w-screen h-screen relative text-white">
      <FadeContent
        blur={true}
        duration={1000}
        delay={500}
        easing="ease-out"
        initialOpacity={0}
        className="w-full h-full fixed z-10"
      >
        <StarsCanvas />
      </FadeContent>

      <FadeContent
        blur={true}
        duration={5000}
        delay={1500}
        easing="ease-out"
        initialOpacity={0}
        className="w-[1000px] md:w-full h-[250px] lg:h-[600px] relative"
      >
        <DarkVeil />
      </FadeContent>

      <FadeContent
        blur={true}
        duration={1000}
        delay={1500}
        easing="ease-out"
        initialOpacity={0}
        className="absolute top-0 left-0 w-full h-full z-20"
      >
        <section
          ref={containerRef}
          className="w-full h-full relative z-[999]"
          aria-label="Skills split scroller"
        >
          <div className="absolute w-full h-full inset-0 flex flex-col-reverse lg:flex-row">
            {/* LEFT COLUMN (lista invertida para que visual baje) */}

            <div
              ref={leftRef}
              className="flex flex-row lg:flex-col w-full lg:w-1/2 h-1/2 lg:h-full z-[1]"
            >
              {leftSectionsReversed.map((s) => (
                <div
                  key={s.id}
                  className={`split-item w-full min-w-full lg:w-full lg:min-w-auto h-full lg:h-screen lg:min-h-screen flex items-center justify-center`}
                >
                  {s.left}
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN (orden normal, sube) */}

            <div
              ref={rightRef}
              className="flex flex-row lg:flex-col w-full lg:w-1/2 h-1/2 lg:h-full"
            >
              {SECTIONS.map((s) => (
                <div
                  key={s.id}
                  className={`split-item w-full min-w-full lg:w-full lg:min-w-auto h-full lg:h-screen lg:min-h-screen flex items-center justify-center `}
                >
                  {s.right}
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeContent>

      <ServicesModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        items={isItems}
      />
    </div>
  );
};

export default Skills;
