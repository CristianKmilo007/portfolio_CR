import { useState } from "react";
import Projects from "./Projects";
import Hero from "../components/Hero";

export const Example = () => {
  const [showProjects, setShowProjects] = useState(false);

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
        className={`transition-opacity duration-600 relative z-[1] ${
          showProjects ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <Projects
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

export default Example;
