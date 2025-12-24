// src/App.tsx
import { useState } from "react";
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

export const App = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

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
                  <div
                    key={location.pathname}
                    className="min-h-screen bg-[#111] text-slate-900 w-full"
                  >
                    <Routes location={location} key={location.pathname}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/skills" element={<SkillsPage />} />
                      <Route path="/experience" element={<ExperiencePage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
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
}
