import { useEffect, useRef } from "react";
import gsap from "gsap";

const MaskCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const baseSize = 20;

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      width: baseSize,
      height: baseSize,
      borderRadius: "50rem",
    });

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let isHovering = false;
    let hoveredElement: HTMLElement | null = null;

    let rafId: number | null = null;

    let hoveredIsReal = false;
    let hoveredIsBig = false;

    let isPressed = false; // estado de click / hold

    // timeout para "despegar" el cursor luego de click en menu-link
    let detachTimeoutId: number | null = null;

    const animateToSize = (
      w: number,
      h: number,
      options: { br?: string } = {}
    ) => {
      if (!cursor) return;
      gsap.killTweensOf(cursor);
      gsap.to(cursor, {
        width: w,
        height: h,
        borderRadius: options.br ?? getComputedStyle(cursor).borderRadius,
        duration: 0.25,
        ease: "power3.out",
      });
    };

    const detachHover = () => {
      isHovering = false;
      hoveredElement = null;
      hoveredIsReal = false;
      hoveredIsBig = false;

      animateToSize(baseSize, baseSize, { br: "50rem" });
    };

    const scheduleDetach = (delay = 250) => {
      if (detachTimeoutId) {
        window.clearTimeout(detachTimeoutId);
        detachTimeoutId = null;
      }
      detachTimeoutId = window.setTimeout(() => {
        detachHover();
        detachTimeoutId = null;
      }, delay);
    };

    const cancelScheduledDetach = () => {
      if (detachTimeoutId) {
        window.clearTimeout(detachTimeoutId);
        detachTimeoutId = null;
      }
    };

    const applyHoverSize = () => {
      if (isPressed) return;

      const padding = 8;
      const minSize = 12;

      if (!hoveredElement) {
        animateToSize(baseSize, baseSize, { br: "50rem" });
        return;
      }

      const rect = hoveredElement.getBoundingClientRect();
      const targetW = Math.max(minSize, rect.width + padding * 2);
      const targetH = Math.max(minSize, rect.height + padding * 2);

      if (hoveredIsReal) {
        animateToSize(targetW + 10, Math.max(minSize, targetH - 20), {
          br: ".8rem",
        });
      } else if (hoveredIsBig) {
        animateToSize(50, 50, {});
      } else {
        animateToSize(targetW, targetH, {});
      }
    };

    const updateCursor = () => {
      if (isHovering && hoveredElement && !hoveredElement.isConnected) {
        isHovering = false;
        hoveredElement = null;
        hoveredIsReal = false;
        hoveredIsBig = false;
      }

      if (isHovering && hoveredElement) {
        const rect = hoveredElement.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          targetX = mouseX;
          targetY = mouseY;
        } else {
          const extraY = hoveredIsReal ? 5 : 0;
          targetX = rect.left + rect.width / 2;
          targetY = rect.top + rect.height / 2 + extraY;
        }
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
      rafId = requestAnimationFrame(updateCursor);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseEnterLink = (e: MouseEvent) => {
      cancelScheduledDetach();

      isHovering = true;
      hoveredElement = (e.currentTarget as HTMLElement) || null;

      hoveredIsReal = !!(
        hoveredElement &&
        (hoveredElement.matches?.(".mouse-real") ||
          hoveredElement.closest?.(".mouse-real"))
      );

      hoveredIsBig = !!(
        hoveredElement &&
        (hoveredElement.matches?.(".mouse-big") ||
          hoveredElement.closest?.(".mouse-big"))
      );

      applyHoverSize();
    };

    const onMouseLeaveLink = () => {
      isHovering = false;
      hoveredElement = null;
      hoveredIsReal = false;
      hoveredIsBig = false;

      if (!isPressed) {
        animateToSize(baseSize, baseSize, { br: "50rem" });
      }
    };

    const onMenuLinkPointerDown = () => {
      // solo para .menu-overlay .menu-link (schedule detach)
      scheduleDetach(250);
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest(".button-modal-close")) {
        isHovering = false;
        hoveredElement = null;
        hoveredIsReal = false;
        hoveredIsBig = false;
        currentX = e.clientX;
        currentY = e.clientY;
        gsap.set(cursor, { x: currentX, y: currentY });
      }

      // no pressed effect if currently hovering (prev behavior)
      if (isHovering) return;

      isPressed = true;
      gsap.killTweensOf(cursor);
      gsap.to(cursor, {
        width: 50,
        height: 50,
        borderRadius: "50rem",
        duration: 0.12,
        ease: "power3.out",
      });
    };

    const onPointerUp = () => {
      isPressed = false;
      applyHoverSize();
    };

    // START
    updateCursor();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // addListeners (hover generic) + add pointerdown only to .menu-overlay .menu-link
    const addListeners = () => {
      const hoverEls = document.querySelectorAll<HTMLElement>(
        ".menu-overlay .menu-link, .menu-overlay .menu-tag a, .menu-bar .menu-hamburger-icon, .button-modal-close, .img-card-experience, .button-prev, .button-next, .dots-slider, .button-link"
      );

      hoverEls.forEach((link) => {
        link.removeEventListener("mouseenter", onMouseEnterLink);
        link.removeEventListener("mouseleave", onMouseLeaveLink);
        link.addEventListener("mouseenter", onMouseEnterLink);
        link.addEventListener("mouseleave", onMouseLeaveLink);
      });

      const menuLinkEls = document.querySelectorAll<HTMLElement>(
        ".menu-overlay .menu-link"
      );
      menuLinkEls.forEach((el) => {
        el.removeEventListener("pointerdown", onMenuLinkPointerDown);
        el.addEventListener("pointerdown", onMenuLinkPointerDown);
      });
    };

    // CREAR observer ANTES del return y después de definir addListeners
    const observer = new MutationObserver(addListeners);
    addListeners();
    observer.observe(document.body, { childList: true, subtree: true });

    // UNICO return (cleanup)
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      // limpiar hover listeners
      const hoverEls = document.querySelectorAll<HTMLElement>(
        ".menu-overlay .menu-link, .menu-overlay .menu-tag a, .menu-bar .menu-hamburger-icon, .button-modal-close, .img-card-experience, .button-prev, .button-next, .dots-slider, .button-link"
      );
      hoverEls.forEach((link) => {
        link.removeEventListener("mouseenter", onMouseEnterLink);
        link.removeEventListener("mouseleave", onMouseLeaveLink);
      });

      const menuLinkEls = document.querySelectorAll<HTMLElement>(
        ".menu-overlay .menu-link"
      );
      menuLinkEls.forEach((el) => {
        el.removeEventListener("pointerdown", onMenuLinkPointerDown);
      });

      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (detachTimeoutId) {
        window.clearTimeout(detachTimeoutId);
        detachTimeoutId = null;
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference bg-white"
      style={{ willChange: "transform, width, height, borderRadius" }}
    />
  );
};

export default MaskCursor;
