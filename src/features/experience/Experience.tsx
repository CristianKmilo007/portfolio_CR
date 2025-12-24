// src/pages/Experience.tsx
import { createPortal } from "react-dom";
import LiquidEther from "./components/LiquidEther";
import CircularReveal from "./components/CircularReveal";
import { useExperience } from "./hooks/useExperience";

export const Experience = () => {
  const {
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
  } = useExperience();

  const raysPortal = (
    <div className="fixed inset-0 bg-[#111] pointer-events-none z-0">
      <div
        ref={revealRef}
        className="absolute top 0 left-0 w-full h-full z-[2] flex items-center justify-center"
        style={{ transformOrigin: "center center" }}
      >
        <CircularReveal
          size={isMobile ? 350 : isDesktopXL ? 600 : 750}
          borderWidth={isMobile ? 75 : isDesktopXL ? 115 : 150}
          initialBorderWidth={isMobile ? 2 : 3}
          duration={2}
          expandDuration={1.5}
          backgroundImage="/experience/img2.jpg"
          maxScale={5.5}
        />
      </div>

      {/* OVERLAY: añadí ref aquí para poder moverlo hacia arriba */}
      <div
        ref={overlayRef}
        className="absolute top-0 left-0 w-full h-full z-[3] flex items-center justify-center"
      >
        <div className="flex flex-col lg:flex-row items-center justify-center text-5xl sm:text-7xl xl:text-8xl font-medium gap-70 sm:gap-50 lg:gap-10 relative">
          <span
            ref={aprendizajeRef}
            className="text-transparent [-webkit-text-stroke:1px_white] tracking-tight font-kalnia opacity-0 -mt-3 sm:mt-0"
            style={{
              transform: "scale(1, 1.2)",
            }}
          >
            Aprendizaje
          </span>

          <span
            ref={experienciaRef}
            className="text-white tracking-tight font-kalnia opacity-0"
            style={{
              transform: "scale(1, 1.2)",
            }}
          >
            Experiencia
          </span>

          <div
            ref={miVidaRef}
            className="absolute  lg:-bottom-30 text-[#aaa] text-sm xl:text-base font-normal w-[100px] text-center leading-4.5 xl:leading-5 opacity-0"
          >
            Mi Vida Profesional
          </div>
        </div>
      </div>

      <div
        ref={raysRef}
        className="w-full h-full absolute top-0 left-0 bg-[#111] z-[1] pointer-events-none"
        style={{ filter: "blur(0px)", willChange: "filter" }}
      >
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={15}
          cursorSize={50}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.2}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.25}
          autoIntensity={4}
          takeoverDuration={1}
          autoRampDuration={1}
        />
      </div>
    </div>
  );

  return (
    <>
      {mounted && createPortal(raysPortal, document.body)}
      <div
        ref={wrapperRef}
        className="relative w-full min-h-screen overflow-auto"
      >
        <div ref={contentRef} className="relative w-full" />

        <style>{`
        @keyframes scroll { 0% { transform: translateY(0); } 100% { transform: translateY(10px); } }
        .animate-scroll { animation: scroll 0.95s ease-in-out alternate infinite; fill: none; stroke: #000; stroke-linecap: round; stroke-miterlimit: 10; stroke-width: 1; }
        .circle { will-change: transform, opacity; width: 4px; height: 4px; border-radius: 50%; background: transparent; }
      `}</style>
      </div>
    </>
  );
};
