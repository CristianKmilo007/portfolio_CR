import { useEffect, useState } from "react";
import { SliderProjects } from "./components/SliderProjects";
import Hero from "./components/Hero";

export const Projects = () => {
  const [showProjects, setShowProjects] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero siempre está montado; controlamos su visibilidad con isVisible */}
      <Hero
        isVisible={!showProjects}
        onScrollPastHero={() => {
          // petición desde Hero para pasar a projects (cuando el usuario scrollea)
          setShowProjects(true);
        }}
      />

      {/* Projects: lo mostramos con transición de opacidad; pointer-events controlados */}
      <div
        className={`transition-opacity duration-600 relative ${
          showProjects
            ? "opacity-100 z-[1] pointer-events-auto"
            : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        <SliderProjects
          isActive={showProjects}
          onScrollToHero={() => {
            // petición desde Projects para volver al hero (ej: scroll up en primer panel)
            setShowProjects(false);
          }}
        />
      </div>
    </div>
  );
};
