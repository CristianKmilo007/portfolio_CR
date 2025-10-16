import React, { useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { CurtainContext } from "./curtain-core";

// Versión simplificada y más predecible de la transición tipo "curtain".
// Esta versión utiliza 3 paneles que se deslizan desde la derecha con delays
// — similar al snippet que propusiste — y mantiene la API `coverThenNavigate(cb)`.

export const CurtainProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const layoutA = useAnimation();
  const layoutB = useAnimation();
  const layoutC = useAnimation();

  const animatingRef = useRef(false);

  const coverThenNavigate = async (cbAfterCover: () => void) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    document.documentElement.classList.add("is-curtaining");

    try {
      // Asegura estado inicial off-screen (derecha)
      await Promise.all([
        layoutA.set({ x: "-100%" }),
        layoutB.set({ x: "-100%" }),
        layoutC.set({ x: "-100%" }),
      ]);

      // Entrada: los paneles se deslizan hacia el centro con stagger (delays)
      await Promise.all([
        layoutA.start({
          x: "0%",
          transition: { delay: 0.2, duration: 0.6, ease: "easeInOut" },
        }),
        layoutB.start({
          x: "0%",
          transition: { delay: 0.4, duration: 0.6, ease: "easeInOut" },
        }),
        layoutC.start({
          x: "0%",
          transition: { delay: 0.6, duration: 0.6, ease: "easeInOut" },
        }),
      ]);

      // Pequeña espera para dar sensación de "cierre" antes de navegar
      await new Promise((res) => setTimeout(res, 80));

      // Ejecuta la navegación o el callback del cliente
      cbAfterCover();

      // Salida: los paneles se deslizan hacia la derecha (revelado)
      await Promise.all([
        layoutA.start({
          x: "-100%",
          transition: { delay: 0.2, duration: 0.6, ease: "easeInOut" },
        }),
        layoutB.start({
          x: "-100%",
          transition: { delay: 0.4, duration: 0.6, ease: "easeInOut" },
        }),
        layoutC.start({
          x: "-100%",
          transition: { delay: 0.6, duration: 0.6, ease: "easeInOut" },
        }),
      ]);
    } catch (err) {
      console.error("Curtain transition error:", err);
      // intenta limpiar estados visuales si algo falla
    } finally {
      // Resetea rápidamente a off-screen para dejar todo preparado
      await Promise.all([
        layoutA.set({ x: "-100%" }),
        layoutB.set({ x: "-100%" }),
        layoutC.set({ x: "-100%" }),
      ]);

      document.documentElement.classList.remove("is-curtaining");
      animatingRef.current = false;
    }
  };

  return (
    <CurtainContext.Provider value={{ coverThenNavigate }}>
      {children}

      {/* paneles: están en el DOM pero pointer-events-none para no interceptar interacción */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {/* capa más cercana al usuario (z más alto) */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={layoutA}
          className="fixed top-0 right-0 bottom-0 w-screen h-screen z-30 bg-[#2e2257]"
          aria-hidden
        />

        {/* capa media */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={layoutB}
          className="fixed top-0 right-0 bottom-0 w-screen h-screen z-20 bg-[#3b2d71]"
          aria-hidden
        />

        {/* capa lejana */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={layoutC}
          className="fixed top-0 right-0 bottom-0 w-screen h-screen z-10 bg-[#4b3792]"
          aria-hidden
        />
      </div>
    </CurtainContext.Provider>
  );
};

export default CurtainProvider;
