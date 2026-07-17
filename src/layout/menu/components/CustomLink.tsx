import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurtain } from "../../../context/curtain-core";
import { useTransition } from "../../../context/transition-core";

type Props = {
  to: string;
  className?: string;
  children: React.ReactNode;
  onBeforeNavigate?: () => Promise<void>;
};

export default function CustomLink({
  to,
  className,
  children,
  onBeforeNavigate,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { coverThenNavigate } = useCurtain();
  const { runExitAnimations } = useTransition();

  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const normalizePath = (p: string) => {
    // si es URL externa, devuélvela tal cual
    if (/^https?:\/\//.test(p)) return p;
    const withoutQuery = p.split("?")[0].split("#")[0];
    const noTrailing = withoutQuery.replace(/\/+$/g, "");
    return noTrailing === "" ? "/" : noTrailing;
  };

  const normTo = normalizePath(to);
  const normPath = normalizePath(location.pathname);

  // --- NUEVA LÓGICA DE ACTIVACIÓN ---
  // Si el link es para el home ("/"), debe coincidir exactamente.
  // Si es otra ruta (ej: "/projects"), se activa si la ruta actual empieza con esa palabra,
  // cubriendo así tanto "/projects" como "/projects/all".
  const isActive =
    normTo === "/" ? normPath === "/" : normPath.startsWith(normTo);

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = async (e) => {
    e.preventDefault();

    // Aquí seguimos comparando exactamente para saber si estamos haciendo clic
    // en exactamente la misma página en la que ya estamos parados.
    const sameRoute = normTo === normPath;

    if (sameRoute) {
      try {
        await onBeforeNavigate?.();
      } catch (err) {
        console.warn("onBeforeNavigate fallo al cerrar la UI:", err);
      }
      return;
    }

    try {
      await runExitAnimations(1100);

      const navPromise = coverThenNavigate(() => navigate(to));

      const beforePromise = onBeforeNavigate
        ? (async () => {
            await wait(500);
            await onBeforeNavigate();
          })()
        : Promise.resolve();

      await Promise.allSettled([beforePromise, navPromise]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <a
      href={to}
      onClick={(e) => {
        handleClick(e);
      }}
      className={`cursor-none ${className} ${isActive ? "text-white" : "text-[#888]"}`}
      role="link"
      aria-label={`Ir a ${to}`}
    >
      {children}
    </a>
  );
}
