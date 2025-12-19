// ------------------ src/components/Menu.tsx ------------------
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  useCallback,
  useLayoutEffect,
} from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import MenuOverlay from "./MenuOverlay";
import DynamicSVGVariant from "../assets/icons/DynamicLogo";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomLink from "./CustomLink";
import { useResponsive } from "../hooks/useMediaQuery";

type SplitInstance = {
  lines: HTMLElement[];
};

interface MenuProps {
  children: ReactNode;
}

const Menu = ({ children }: MenuProps) => {
  const location = useLocation();

  const { isTablet } = useResponsive()

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [splitTextByContainer, setSplitTextByContainer] = useState<
    SplitInstance[][]
  >([]);

  const lenisRef = useRef<Lenis | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuToggleLabelRef = useRef<HTMLParagraphElement | null>(null);
  const menuOverlayRef = useRef<HTMLElement | null>(null);
  const menuOverlayContentRef = useRef<HTMLElement | null>(null);
  const menuMediaWrapperRef = useRef<HTMLElement | null>(null);
  const copyContainersRef = useRef<HTMLElement[]>([]);
  const hamburgerIconRef = useRef<HTMLDivElement | null>(null);
  const pendingCloseRef = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
    CustomEase.create("hop", ".87,0,.13,1");

    const lenis = new Lenis({
      // Si tienes opciones las mantienes, e.g. smooth: true, duration: 1.2
    });
    lenisRef.current = lenis;

    const scrollingElement =
      document.scrollingElement || document.documentElement;
    ScrollTrigger.scrollerProxy(scrollingElement, {
      scrollTop(value?: number) {
        if (arguments.length) {
          try {
            (lenis as any).scrollTo(value);
          } catch {
            /* ignore */
          }
        }
        try {
          return (
            (lenis as any)?.scroll?.target ??
            (lenis as any)?.scroll ??
            window.scrollY
          );
        } catch {
          return window.scrollY;
        }
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    let rafId = 0;
    function onRaf(time: number) {
      try {
        (lenis as any).raf(time);
      } catch {
        /* ignore */
      }
      try {
        ScrollTrigger.update();
      } catch {
        /* ignore */
      }
      rafId = requestAnimationFrame(onRaf);
    }
    rafId = requestAnimationFrame(onRaf);

    const initHamburgerLines = () => {
      const el = hamburgerIconRef.current;
      if (!el) return;
      const line1 = el.querySelector<HTMLElement>(".hamburger-line-1");
      const line2 = el.querySelector<HTMLElement>(".hamburger-line-2");
      if (!line1 || !line2) return;

      gsap.set([line1, line2], {
        transformOrigin: "50% 50%",
        background: "#fff",
      });

      gsap.set(line1, { y: -4, rotation: 0, scaleX: 1 });
      gsap.set(line2, { y: 4, rotation: 0, scaleX: 1 });
    };
    requestAnimationFrame(initHamburgerLines);

    const onResize = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    return () => {
      try {
        cancelAnimationFrame(rafId);
      } catch {
        /* ignore */
      }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      try {
        lenis.destroy();
      } catch {
        /* ignore */
      }
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    menuOverlayRef.current = document.querySelector(".menu-overlay");
    menuOverlayContentRef.current = document.querySelector(
      ".menu-overlay-content"
    );
    menuMediaWrapperRef.current = document.querySelector(".menu-media-wrapper");
    copyContainersRef.current = Array.from(
      document.querySelectorAll<HTMLElement>(".menu-col")
    );
  }, [splitTextByContainer]);

  const openMenu = useCallback((): Promise<void> => {
    if (isAnimating) return Promise.resolve();
    setIsAnimating(true);
    lenisRef.current?.stop();

    const line1 =
      hamburgerIconRef.current?.querySelector<HTMLElement>(
        ".hamburger-line-1"
      ) ?? null;
    const line2 =
      hamburgerIconRef.current?.querySelector<HTMLElement>(
        ".hamburger-line-2"
      ) ?? null;

    const tl = gsap.timeline();

    if (line1 && line2) {
      gsap.killTweensOf([line1, line2]);
      tl.to(
        line1,
        {
          duration: 0.5,
          y: 0,
          rotate: 45,
          scaleX: 1.05,
          transformOrigin: "50% 50%",
          ease: "power3.in",
          background: "#fff",
        },
        0
      );
      tl.to(
        line2,
        {
          duration: 0.5,
          y: 0,
          rotate: -45,
          scaleX: 1.05,
          transformOrigin: "50% 50%",
          ease: "power3.in",
          background: "#fff",
        },
        0
      );
    }

    tl.to(
      menuToggleLabelRef.current!,
      {
        y: "-110%",
        duration: 1,
        ease: "hop",
      },
      "<"
    )
      .to(
        containerRef.current!,
        {
          y: "100svh",
          duration: 1,
          ease: "hop",
        },
        "<"
      )
      .to(
        menuOverlayRef.current!,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1,
          ease: "hop",
        },
        "<"
      )
      .to(
        menuOverlayContentRef.current!,
        {
          yPercent: 0,
          duration: 1,
          ease: "hop",
        },
        "<"
      )
      .to(
        menuMediaWrapperRef.current!,
        {
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          delay: 0.5,
        },
        "<"
      );

    splitTextByContainer.forEach((containerSplits) => {
      const copyLines = containerSplits.flatMap((split) => split.lines);
      tl.to(
        copyLines,
        {
          y: "0%",
          duration: 2,
          ease: "hop",
          stagger: -0.075,
        },
        -0.15
      );
    });

    return new Promise<void>((resolve) => {
      tl.call(() => {
        setIsAnimating(false);
        setIsMenuOpen(true);
        resolve();
      });
    });
  }, [isAnimating, splitTextByContainer]);

  const closeMenu = useCallback((): Promise<void> => {
    // Si ya hay una animación en curso, encolamos el cierre y devolvemos
    if (isAnimating) {
      pendingCloseRef.current = true;
      return Promise.resolve();
    }

    setIsAnimating(true);

    const line1 =
      hamburgerIconRef.current?.querySelector<HTMLElement>(
        ".hamburger-line-1"
      ) ?? null;
    const line2 =
      hamburgerIconRef.current?.querySelector<HTMLElement>(
        ".hamburger-line-2"
      ) ?? null;

    const tl = gsap.timeline();

    tl.to(containerRef.current!, {
      y: "0svh",
      duration: 1,
      ease: "hop",
    })
      .to(
        menuOverlayRef.current!,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "hop",
        },
        "<"
      )
      .to(
        menuOverlayContentRef.current!,
        {
          yPercent: -50,
          duration: 1,
          ease: "hop",
        },
        "<"
      )
      .to(
        menuToggleLabelRef.current!,
        {
          y: "0%",
          duration: 1,
          ease: "hop",
        },
        "<"
      )
      .to(
        copyContainersRef.current,
        {
          opacity: 0.25,
          duration: 1,
          ease: "hop",
        },
        "<"
      );

    if (line1 && line2) {
      gsap.killTweensOf([line1, line2]);
      tl.to(
        line1,
        {
          duration: 0.5,
          rotate: 0,
          y: -4,
          scaleX: 1,
          transformOrigin: "50% 50%",
          background: "#fff",
          ease: "power3.in",
        },
        +0.3
      );
      tl.to(
        line2,
        {
          duration: 0.5,
          rotate: 0,
          y: 4,
          scaleX: 1,
          transformOrigin: "50% 50%",
          background: "#fff",
          ease: "power3.in",
        },
        +0.3
      );
    }

    return new Promise<void>((resolve) => {
      tl.call(() => {
        splitTextByContainer.forEach((containerSplits) => {
          const copyLines = containerSplits.flatMap((split) => split.lines);
          gsap.set(copyLines, { y: "-110%" });
        });

        gsap.set(copyContainersRef.current, { opacity: 1 });
        gsap.set(menuMediaWrapperRef.current, { opacity: 0 });

        setIsAnimating(false);
        setIsMenuOpen(false);
        lenisRef.current?.start();

        // Limpia transform inline del container para que no interfiera con pins (si existe)
        try {
          if (containerRef.current) {
            // quitar transform inline y propiedades relacionadas
            gsap.set(containerRef.current, { clearProps: "transform" });
            containerRef.current.style.transform = "";
          }
        } catch {
          /* ignore */
        }

        // Forzamos refresh para que ScrollTrigger recalcule
        try {
          ScrollTrigger.refresh();
        } catch {
          /* ignore */
        }

        if (pendingCloseRef.current) {
          pendingCloseRef.current = false;
          requestAnimationFrame(() => {
            closeMenu().catch(() => {});
          });
        }
        resolve();
      });
    });
  }, [isAnimating, splitTextByContainer]);

  const handleMenuToggle = async () => {
    if (isAnimating) return;
    if (!isMenuOpen) {
      await openMenu();
    } else {
      await closeMenu();
    }
  };

  // Cerrar menú cuando cambie la ruta. Esto cubre clicks a la misma ruta
  // desde componentes que no produzcan un cambio de pathname real.
  useEffect(() => {
    if (isMenuOpen) {
      // No esperamos a que termine la animación; disparamos el cierre.
      closeMenu().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const menuLogoRef = useRef<HTMLDivElement | null>(null);
  const menuToggleBtnRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    // Animación de entrada tipo "Home"
    const logo = menuLogoRef.current;
    const toggle = menuToggleBtnRef.current;
    if (!logo && !toggle) return;

    const tl = gsap.timeline();
    tl.from([logo, toggle].filter(Boolean) as Element[], {
      autoAlpha: 0,
      y: 18,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.08,
    });

    return () => {
      // cleanup
      tl.kill();
      try {
        gsap.set([logo, toggle], { clearProps: "all" });
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-screen h-screen pointer-events-none overflow-hidden z-[2] cursor-none">
        <div className="menu-bar fixed top-0 left-1/2 -translate-x-1/2 container pt-4 px-4 sm:px-4 sm:pt-8 flex justify-between items-start pointer-events-auto text-menu-fg-secondary z-[2] h-[1px]">
          <div className="menu-logo" ref={menuLogoRef}>
            <CustomLink to="/">
              <DynamicSVGVariant
                width={isTablet ? 50 : 75}
                height={isTablet ? 50 : 75}
                frontPrimary="#fff"
                frontSecondary="#fff"
                primaryGradient={["#fff", "#333"]}
                accentGradient={["#333", "#fff"]}
              />
            </CustomLink>
          </div>

          <div
            ref={menuToggleBtnRef}
            className={`menu-toggle-btn flex items-center gap-4`}
            onClick={handleMenuToggle}
          >
            <div className="menu-toggle-label overflow-hidden">
              <p
                ref={menuToggleLabelRef}
                className="relative translate-y-0 will-change-transform text-sm font-medium text-white"
              >
                Menu
              </p>
            </div>

            <div
              ref={hamburgerIconRef}
              className="menu-hamburger-icon relative w-10 md:w-12 h-10 md:h-12 flex justify-center items-center border border-white rounded-full"
            >
              <span className="absolute w-[18px] h-[1px] bg-white hamburger-line-1" />
              <span className="absolute w-[18px] h-[1px] bg-white hamburger-line-2" />
            </div>
          </div>
        </div>

        <MenuOverlay
          setSplitTextByContainer={setSplitTextByContainer}
          closeMenu={closeMenu}
        />
      </nav>

      <div
        ref={containerRef}
        className="relative translate-y-0 bg-white text-foreground"
        style={{ transform: "translateY(0svh)" }}
      >
        {children}
      </div>
    </>
  );
};

export default Menu;
