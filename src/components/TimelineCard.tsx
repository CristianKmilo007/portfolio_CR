// src/components/TimelineCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaBriefcase, FaGraduationCap } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { useResponsive } from "../hooks/useMediaQuery";

export type TimelineEvent = {
  year: string;
  title: string;
  desc: string;
  side: "left" | "right";
  type: "education" | "job";
  img?: string;
};

type Props = {
  ev: TimelineEvent;
};

/**
 * ImageModal con animación de entrada/salida (fade + scale) y bloqueo de scroll.
 * - onRequestClose inicia la animación de salida y llama `onClose` del padre al finalizar.
 */
const ImageModal: React.FC<{
  src: string;
  alt?: string;
  onClose: () => void;
}> = ({ src, alt = "Imagen ampliada", onClose }) => {
  const [visible, setVisible] = useState(false); // controla la clase de entrada/salida
  const timeoutRef = useRef<number | null>(null);
  const DURATION = 220; // ms (sincronizar con clases tailwind)

  // bloquear scroll mientras el modal exista
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // small delay para que la animación de entrada use `visible` true
    // mount -> set visible true to trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    return () => {
      document.body.style.overflow = prev;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // cerrar con ESC (inicia animación de salida)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startClose = () => {
    // iniciar animación de salida
    setVisible(false);
    // esperar la duración y avisar al padre para desmontar
    timeoutRef.current = window.setTimeout(() => {
      onClose();
    }, DURATION);
  };

  const onBackdropClick = () => startClose();

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-none"
      aria-modal="true"
      role="dialog"
      onClick={onBackdropClick}
    >
      {/* Fondo - fade */}
      <div
        className={`absolute inset-0 backdrop-blur-lg transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.72)" }}
      />

      {/* Contenedor de la imagen - scale + fade */}
      <div
        className={`relative z-10 max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden transform transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={stopProp}
      >
        <button
          onClick={startClose}
          className="button-modal-close cursor-none absolute top-2 right-2 size-7 z-20 rounded-full p-1 bg-black/70 text-xs text-white"
          aria-label="Cerrar imagen"
        >
          ✕
        </button>

        <img
          src={src}
          alt={alt}
          className="block max-w-full max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );

  const portalRoot = typeof document !== "undefined" ? document.body : null;
  if (!portalRoot) return null;
  return createPortal(modal, portalRoot);
};

const TimelineCard: React.FC<Props> = ({ ev }) => {
  const { isLaptop, isMobile } = useResponsive()
  
  const [openImg, setOpenImg] = useState<string | null>(null);

  return (
    <>
      <div
        className={`${
          ev.side === "left"
            ? "flex justify-end pr-0 sm:pr-10 lg:pr-20 items-start h-full"
            : "flex justify-start pl-0 sm:pl-10 lg:pl-20 items-start h-full"
        }`}
      >
        <div className={`bg-[#ffffff1c] backdrop-blur-md rounded-xl p-4 pt-3  text-white w-full max-w-[350px] relative overflow-hidden ${ev.side === 'left' ? 'text-end' : 'text-left'}`}>
          <div className="absolute top-0 left-0 w-full">
            <div className="relative h-[3px] rounded overflow-hidden">
              <div
                className={`timeline-progress-bar absolute top-0 h-full rounded`}
                style={
                  ev.side === "right"
                    ? {
                        left: 0,
                        right: "auto",
                        width: "0%",
                        background: "linear-gradient(90deg,#ae38ff,#f92cf7)",
                      }
                    : {
                        right: 0,
                        left: "auto",
                        width: "0%",
                        background: "linear-gradient(270deg,#ae38ff,#f92cf7)",
                      }
                }
              />
            </div>
          </div>

          <div className={`w-full flex items-start gap-2 sm:gap-3 ${ev.side === 'left' ? 'justify-end flex-row-reverse' : 'justify-start flex-row'}`}>
            {ev.type === "education" ? (
              <FaGraduationCap size={isMobile ? 19 : isLaptop ? 22 : 25} className="mt-[2px] sm:mt-[4px]" />
            ) : (
              <FaBriefcase size={isMobile ? 15 : isLaptop ? 18 : 21} className="mt-[3px] sm:mt-[5px] min-w-[21px]" />
            )}
            <div className={`text-lg sm:text-xl lg:text-2xl font-semibold leading-5 sm:leading-7 ${ev.side === 'left' ? 'ml-auto' : 'ml-0'}`}>{ev.title}</div>
          </div>
          <div className="text-xs sm:text-sm lg:text-base mt-1">{ev.desc}</div>
          <div className={`text-xs sm:text-sm lg:text-base flex items-center gap-2 ${ev.side === 'left' ? 'justify-end' : 'justify-start'}`}>
            <IoCalendarOutline />
            <span>{ev.year}</span>
          </div>

          {ev.img && (
            <div
              className="img-card-experience mouse-big w-full h-[100px] sm:h-[125px] lg:h-[150px] rounded-lg overflow-hidden mt-3"
              onClick={() => setOpenImg(ev.img!)}
            >
              <img
                src={ev.img}
                alt={ev.title}
                className="w-full h-full object-cover object-top rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {openImg && (
        <ImageModal
          src={openImg}
          alt={ev.title}
          onClose={() => setOpenImg(null)}
        />
      )}
    </>
  );
};

export default TimelineCard;
