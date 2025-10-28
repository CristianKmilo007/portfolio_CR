// src/App.tsx
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import About from "./pages/About";
import CurtainProvider from "./context/CurtainProvider";
import { TransitionProvider } from "./context/TransitionProvider";
import PageLoader from "./components/Loader";
import Menu from "./components/Menu";
/* import PinExample from "./pages/Example";
import PinDebugFixed from "./pages/Example";
 */
export default function App() {
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <TransitionProvider>
      <CurtainProvider>
        <LayoutGroup>
          <AnimatePresence mode="wait" initial={false}>
            {/* {isLoading ? (
              <PageLoader onComplete={handleLoadComplete} />
            ) : ( */}
              <Menu>
                <AnimatePresence mode="wait" initial={false}>
                  <div
                    key={location.pathname}
                    className="min-h-screen bg-white text-slate-900 w-full"
                  >
                    <Routes location={location} key={location.pathname}>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                    </Routes>
                  </div>
                </AnimatePresence>
             </Menu>
            {/* )} */}
          </AnimatePresence>
        </LayoutGroup>
      </CurtainProvider>
    </TransitionProvider>
  );
}
