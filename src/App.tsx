// src/App.tsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { LayoutGroup, AnimatePresence } from "framer-motion";

import CurtainProvider from "./context/CurtainProvider";
import { TransitionProvider } from "./context/TransitionProvider";
import PageLoader from "./components/Loader";
import Menu from "./layout/menu/Menu";
import MaskCursor from "./components/MaskCursor";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useResponsive } from "./hooks/useMediaQuery";
import { HomePage } from "./pages/HomePage";
import { SkillsPage } from "./pages/SkillsPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { AllProjectsPage } from "./pages/AllProjectsPage";

export const App: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  // El loader solo se muestra la primera vez por sesión, para no hacer esperar
  // a quien vuelve a entrar o recarga la página.
  const [isLoading, setIsLoading] = useState(() => {
    try {
      return window.sessionStorage.getItem("loaderShown") !== "1";
    } catch {
      return true;
    }
  });

  // Esta clave se incrementa cuando entramos a "/" -> fuerza remount del Home
  const [homeKey, setHomeKey] = useState(0);

  // Control de carga
  const handleLoadComplete = () => {
    try {
      window.sessionStorage.setItem("loaderShown", "1");
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  };

  // Incrementar solo cuando la ruta es "/" (no depende de homeKey para evitar bucles)
  useEffect(() => {
    if (location.pathname === "/") {
      setHomeKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const wrapperKey =
    location.pathname === "/" ? `home-${homeKey}` : location.pathname;

  return (
    <TransitionProvider>
      {!isMobile && <MaskCursor />}
      <CurtainProvider>
        <LayoutGroup>
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <PageLoader onComplete={handleLoadComplete} />
            ) : (
              <Menu>
                <AnimatePresence mode="wait" initial={false}>
                  {/* El key aquí fuerza remount del contenido al cambiar */}
                  <div
                    key={wrapperKey}
                    className="min-h-screen bg-[#111] text-slate-900 w-full"
                  >
                    <Routes location={location} key={location.pathname}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/skills" element={<SkillsPage />} />
                      <Route path="/experience" element={<ExperiencePage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route
                        path="/projects/all"
                        element={<AllProjectsPage />}
                      />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </div>
                </AnimatePresence>
              </Menu>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </CurtainProvider>
    </TransitionProvider>
  );
};

export default App;
