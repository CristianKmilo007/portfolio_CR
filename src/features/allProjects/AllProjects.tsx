import { useState, useEffect, useRef, type MouseEvent } from "react";
import SlideImages from "../projects/components/SlidesImages";
import { projectData } from "../projects/data";
import { useResponsive } from "../../hooks/useMediaQuery";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react";
import { PiLinkBold } from "react-icons/pi";

// 1. Extraemos la tarjeta a un componente independiente
const ProjectCard = ({
  project,
  index,
  isMobile,
}: {
  project: any;
  index: number;
  isMobile: boolean;
}) => {
  // Estado para la aparición al hacer scroll
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Estados locales para el efecto 3D
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Intersection Observer para detectar cuando la tarjeta entra en pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Dejamos de observar una vez que ya apareció
        }
      },
      { threshold: 0.1, rootMargin: "50px" }, // Se activa un poco antes de ser 100% visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = (x / rect.width - 0.5) * 10;
    const rotateX = (0.5 - y / rect.height) * 10;

    setIsHovered(true);
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const slides =
    Array.isArray(project.slides) && project.slides.length > 0
      ? project.slides
      : project.image
        ? [{ type: "image", src: project.image }]
        : [];

  return (
    // CONTENEDOR EXTERNO: Maneja exclusivamente la animación de entrada (Scroll)
    // Usamos el índice % 4 para generar un retraso escalonado (0ms, 100ms, 200ms, 300ms)
    // creando el efecto de "una tras otra" a medida que aparecen.
    <div
      ref={cardRef}
      className={`w-full mb-12 sm:mb-8 break-inside-avoid transition-all duration-700 ease-out will-change-[opacity,transform] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      }`}
      style={{ transitionDelay: `${(index % 4) * 100}ms` }}
    >
      {/* CONTENEDOR INTERNO: Maneja exclusivamente el efecto 3D */}
      <div
        onMouseMove={isMobile ? undefined : handleMouseMove}
        onMouseLeave={isMobile ? undefined : handleMouseLeave}
        className="flex flex-col gap-2 p-0 sm:p-4 bg-[#00000000] sm:bg-[#ffffff00] rounded-xl sm:rounded-2xl transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        }}
      >
        <div className="w-full h-[200px] overflow-hidden rounded-lg sm:rounded-xl">
          <SlideImages slides={slides} thumbs={false} isAllProjects />
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex gap-2 items-center">
            <h2 className="text-xl font-semibold text-white">{project.name}</h2>
          {project.link && (
            <a
              href={project?.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir ${project.name} en nueva pestaña`}
              className="cursor-none"
            >
              <Button
                isIconOnly
                size="sm"
                radius="full"
                className="bg-[#00000046] mt-1 cursor-none button-link h-7 w-7 min-w-7"
              >
                <PiLinkBold color="#fff" size={15} />
              </Button>
            </a>
          )}
          </div>
          <div className="text-white text-sm">{t(project.description)}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {project.technologies.map((t: any) => (
              <span
                key={t}
                className="text-xs px-2 py-1 bg-[#ffffff17] text-white font-medium rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AllProjects = () => {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();

  // 1. Estado para rastrear el progreso del scroll
  const [scrollProgress, setScrollProgress] = useState(0);

  // NUEVO: Estado para manejar la aparición inicial
  const [isLoaded, setIsLoaded] = useState(false);

  // Efecto para inicializar la carga (Aparición inicial)
  useEffect(() => {
    // Un pequeñísimo retraso asegura que el navegador registre el estado inicial (opacity 0)
    // antes de cambiarlo a 1, detonando así la animación CSS.
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para el Scroll
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = window.innerHeight * (isMobile ? 0.15 : 0.4);
      const currentScroll = window.scrollY;
      const progress = Math.min(currentScroll / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  return (
    <div
      className="w-full min-h-screen relative overflow-clip px-4 sm:px-6 lg:px-8 pb-20"
      style={{
        background:
          "radial-gradient(circle at 10% 20%, rgba(255, 110, 199, 0.28) 0%, transparent 25%), radial-gradient(circle at 90% 10%, rgba(86, 255, 181, 0.24) 0%, transparent 22%), radial-gradient(circle at 50% 100%, rgba(255, 193, 87, 0.22) 0%, transparent 30%), linear-gradient(135deg, #0f1021 0%, #1a1534 45%, #271c3d 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "18px 18px, 30px 30px",
          backgroundPosition: "0 0, 9px 9px",
        }}
      />

      {/* CONTENEDOR DEL TÍTULO ANIMADO */}
      <div className="sticky top-0 z-50 w-full pt-10 sm:pt-12 pointer-events-none flex justify-center">
        <h1
          className="text-3xl sm:text-8xl font-bold text-white will-change-[transform,opacity] text-center"
          style={{
            transform: isMobile
              ? `translateY(${(1 - scrollProgress) * 10}vh)`
              : `translateY(${(1 - scrollProgress) * 20}vh)`,
            transformOrigin: "center top",

            // NUEVO: La opacidad depende de si ya cargó.
            // Si está cargado, depende del scroll. Si no, es 0.
            opacity: isLoaded ? 1 - scrollProgress : 0,

            // NUEVO: Solo animamos la transición de opacidad cuando el scroll está arriba.
            // Si hacemos scroll, se quita el 'transition' para que la respuesta sea instantánea.
            transition: scrollProgress === 0 ? "opacity 1.5s ease-out" : "none",
          }}
        >
          {t("Todos los proyectos")}
        </h1>
      </div>

      {/* CONTENEDOR DE LA GRILLA DE PROYECTOS */}
      <div className="relative z-10 container mx-auto mt-[20vh] sm:mt-[45vh]">
        <div className="w-full columns-1 sm:columns-3 xl:columns-4 gap-3 sm:gap-3">
          {projectData.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              index={index}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
