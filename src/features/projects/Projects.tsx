import { useState } from "react";
import { SliderProjects } from "./components/SliderProjects";
import Hero from "./components/Hero";
import { usePreventPullToRefresh } from "../../hooks/usePreventPullToRefresh";

export const Projects = () => {
  const [showProjects, setShowProjects] = useState(false);

  usePreventPullToRefresh(true);

  return (
    <div
      className="min-h-screen bg-[#0a0a0a]"
      style={{ overscrollBehavior: "none" }}
    >
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
