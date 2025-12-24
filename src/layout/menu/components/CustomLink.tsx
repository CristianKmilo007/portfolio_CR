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
    // si es URL externa, devuélvela tal cual (no vamos a comparar rutas internas)
    if (/^https?:\/\//.test(p)) return p;
    const withoutQuery = p.split("?")[0].split("#")[0];
    const noTrailing = withoutQuery.replace(/\/+$/g, "");
    return noTrailing === "" ? "/" : noTrailing;
  };

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = async (e) => {
    e.preventDefault();

    const sameRoute = normalizePath(to) === normalizePath(location.pathname);

    if (sameRoute) {
      // Si apuntamos a la misma ruta: NO navegamos, solo ejecutamos onBeforeNavigate (ej: closeMenu)
      try {
        // si quieres que no espere la animación, quita el await
        await onBeforeNavigate?.();
      } catch (err) {
        console.warn("onBeforeNavigate fallo al cerrar la UI:", err);
      }
      return; // no navegamos
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
      className={`cursor-none ${className}`}
      role="link"
      aria-label={`Ir a ${to}`}
    >
      {children}
    </a>
  );
}
