import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import MenuOverlay from "./MenuOverlay";

interface MenuProps {
  children: ReactNode
}

const Menu = ({
  children
}: MenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [splitTextByContainer, setSplitTextByContainer] = useState<any[]>([]);
  
  const lenisRef = useRef<Lenis | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuToggleLabelRef = useRef<HTMLParagraphElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuOverlayContentRef = useRef<HTMLDivElement>(null);
  const menuMediaWrapperRef = useRef<HTMLDivElement>(null);
  const copyContainersRef = useRef<HTMLDivElement[]>([]);
  const hamburgerIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("hop", ".87,0,.13,1");

    const lenis = new Lenis();
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleMenuToggle = () => {
    if (isAnimating) return;

    if (!isMenuOpen) {
      setIsAnimating(true);
      lenisRef.current?.stop();

      const tl = gsap.timeline();

      tl.to(
        menuToggleLabelRef.current,
        {
          y: "-110%",
          duration: 1,
          ease: "hop",
        },
        "<"
      )
        .to(
          containerRef.current,
          {
            y: "100svh",
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuOverlayRef.current,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuOverlayContentRef.current,
          {
            yPercent: 0,
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuMediaWrapperRef.current,
          {
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            delay: 0.5,
          },
          "<"
        );

      splitTextByContainer.forEach((containerSplits) => {
        const copyLines = containerSplits.flatMap((split: any) => split.lines);
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

      hamburgerIconRef.current?.classList.add("active");

      tl.call(() => {
        setIsAnimating(false);
      });

      setIsMenuOpen(true);
    } else {
      setIsAnimating(true);
      hamburgerIconRef.current?.classList.remove("active");

      const tl = gsap.timeline();

      tl.to(containerRef.current, {
        y: "0svh",
        duration: 1,
        ease: "hop",
      })
        .to(
          menuOverlayRef.current,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuOverlayContentRef.current,
          {
            yPercent: -50,
            duration: 1,
            ease: "hop",
          },
          "<"
        )
        .to(
          menuToggleLabelRef.current,
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

      tl.call(() => {
        splitTextByContainer.forEach((containerSplits) => {
          const copyLines = containerSplits.flatMap((split: any) => split.lines);
          gsap.set(copyLines, { y: "-110%" });
        });

        gsap.set(copyContainersRef.current, { opacity: 1 });
        gsap.set(menuMediaWrapperRef.current, { opacity: 0 });

        setIsAnimating(false);
        lenisRef.current?.start();
      });

      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    menuOverlayRef.current = document.querySelector(".menu-overlay");
    menuOverlayContentRef.current = document.querySelector(".menu-overlay-content");
    menuMediaWrapperRef.current = document.querySelector(".menu-media-wrapper");
    copyContainersRef.current = Array.from(document.querySelectorAll(".menu-col"));
  }, [splitTextByContainer]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-screen h-screen pointer-events-none overflow-hidden z-[2]">
        <div className="menu-bar fixed top-0 left-0 w-screen p-8 flex justify-between items-center pointer-events-auto text-menu-fg-secondary z-[2]">
          <div className="menu-logo w-8 h-8">
            <a href="#">
              <img src="https://via.placeholder.com/32x32/ffffff/ffffff" alt="Logo" />
            </a>
          </div>

          <div 
            className="menu-toggle-btn flex items-center gap-4 cursor-pointer"
            onClick={handleMenuToggle}
          >
            <div className="menu-toggle-label overflow-hidden">
              <p 
                ref={menuToggleLabelRef}
                className="relative translate-y-0 will-change-transform text-sm font-medium"
              >
                Menu
              </p>
            </div>
            
            <div 
              ref={hamburgerIconRef}
              className="menu-hamburger-icon relative w-12 h-12 flex flex-col justify-center items-center gap-[0.3rem] border border-[hsl(var(--hamburger-icon-border))] rounded-full"
            >
              <span className="absolute w-[15px] h-[1.25px] bg-foreground transition-all duration-[750ms] ease-[cubic-bezier(0.87,0,0.13,1)] origin-center will-change-transform -translate-y-[3px] hamburger-line-1" />
              <span className="absolute w-[15px] h-[1.25px] bg-foreground transition-all duration-[750ms] ease-[cubic-bezier(0.87,0,0.13,1)] origin-center will-change-transform translate-y-[3px] hamburger-line-2" />
            </div>
          </div>
        </div>

        <MenuOverlay 
          isOpen={isMenuOpen}
          splitTextByContainer={splitTextByContainer}
          setSplitTextByContainer={setSplitTextByContainer}
        />
      </nav>

      <div 
        ref={containerRef}
        className="container relative translate-y-0 bg-background text-foreground"
        style={{ transform: "translateY(0svh)" }}
      >
        {children}
      </div>

      <style>{`
        .menu-hamburger-icon.active .hamburger-line-1 {
          transform: translateY(0) rotate(45deg) scaleX(1.05);
        }
        .menu-hamburger-icon.active .hamburger-line-2 {
          transform: translateY(0) rotate(-45deg) scaleX(1.05);
        }
      `}</style>
    </>
  );
};

export default Menu;
