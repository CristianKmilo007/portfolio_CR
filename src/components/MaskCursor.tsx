import { useEffect, useRef } from "react";
import gsap from "gsap";

const MaskCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const baseSize = 16;

    // El cursor ES el círculo (así evitamos offsets dobles)
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      width: baseSize,
      height: baseSize,
      borderRadius: 9999,
    });

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let isHovering = false;
    let hoveredElement: HTMLElement | null = null;

    const updateCursor = () => {
      if (isHovering && hoveredElement) {
        const rect = hoveredElement.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      } else {
        targetX = mouseX;
        targetY = mouseY;
      }

      const dx = targetX - currentX;
      const dy = targetY - currentY;

      const ease = isHovering ? 0.2 : 0.15;
      currentX += dx * ease;
      currentY += dy * ease;

      gsap.set(cursor, { x: currentX, y: currentY });
      requestAnimationFrame(updateCursor);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseEnterLink = (e: MouseEvent) => {
      isHovering = true;
      hoveredElement = e.currentTarget as HTMLElement;

      gsap.to(cursor, {
        width: 60,
        height: 60,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    const onMouseLeaveLink = () => {
      isHovering = false;
      hoveredElement = null;

      gsap.to(cursor, {
        width: baseSize,
        height: baseSize,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    updateCursor();
    window.addEventListener("mousemove", onMouseMove);

    const addListeners = () => {
      const menuLinks = document.querySelectorAll<HTMLElement>(
        ".menu-overlay .menu-link, .menu-overlay .menu-tag a"
      );

      menuLinks.forEach((link) => {
        link.removeEventListener("mouseenter", onMouseEnterLink);
        link.removeEventListener("mouseleave", onMouseLeaveLink);
        link.addEventListener("mouseenter", onMouseEnterLink);
        link.addEventListener("mouseleave", onMouseLeaveLink);
      });
    };

    addListeners();

    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      const menuLinks = document.querySelectorAll<HTMLElement>(
        ".menu-overlay .menu-link a, .menu-overlay .menu-tag a"
      );
      menuLinks.forEach((link) => {
        link.removeEventListener("mouseenter", onMouseEnterLink);
        link.removeEventListener("mouseleave", onMouseLeaveLink);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference bg-white"
      style={{ willChange: "transform, width, height" }}
    />
  );
};

export default MaskCursor;

