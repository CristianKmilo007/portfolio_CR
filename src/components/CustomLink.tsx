// src/components/CustomLink.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurtain } from "../context/curtain-core";
import { useTransition } from "../context/transition-core";

type Props = { to: string; className?: string; children: React.ReactNode };

export default function CustomLink({ to, className, children }: Props) {
  const navigate = useNavigate();
  const { coverThenNavigate } = useCurtain();
  const { runExitAnimations } = useTransition();
  const disabledRef = React.useRef(false);

  const handleClick: React.MouseEventHandler = async (e) => {
    e.preventDefault();
    if (disabledRef.current) return;
    disabledRef.current = true;

    try {
      await runExitAnimations(1100); // espera anims de página
      await coverThenNavigate(() => {
        navigate(to);
      });
    } finally {
      // desbloqueo posterior para permitir navegación nuevamente
      setTimeout(() => (disabledRef.current = false), 700);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} role="link" aria-label={`Ir a ${to}`}>
      {children}
    </a>
  );
}
