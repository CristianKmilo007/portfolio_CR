// src/App.tsx
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import CurtainProvider from "./context/CurtainProvider";
import { TransitionProvider } from "./context/TransitionProvider";
import PageLoader from "./components/Loader";
import Menu from "./components/Menu";
import { Skills } from "./pages/Skills";
import CircleScroll from "./pages/Experience";

import Example from "./pages/Example";
import MaskCursor from "./components/MaskCursor";
import { NotFound } from "./pages/NotFound";
import { useResponsive } from "./hooks/useMediaQuery";
/* import PinExample from "./pages/Example";
import PinDebugFixed from "./pages/Example";
 */
export default function App() {
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
                      <Route path="/" element={<Home />} />
                      <Route path="/skills" element={<Skills />} />
                      <Route path="/experience" element={<CircleScroll />} />
                      <Route path="/projects" element={<Example />} />
                      <Route path="*" element={<NotFound />} />
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
