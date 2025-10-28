// ------------------ src/components/MenuOverlay.tsx ------------------
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import CustomLink from "./CustomLink";

type SplitInstance = {
  lines: HTMLElement[];
};

interface MenuOverlayProps {
  setSplitTextByContainer: (splits: SplitInstance[][]) => void;
  closeMenu?: () => Promise<void>;
}

const MenuOverlay = ({ setSplitTextByContainer, closeMenu }: MenuOverlayProps) => {
  const textContainersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!gsap || !SplitText) return;

    const splitsByContainer: SplitInstance[][] = [];

    textContainersRef.current.forEach((container) => {
      if (!container) return;

      const textElements = container.querySelectorAll<HTMLElement>("a, p");
      const containerSplits: SplitInstance[] = [];

      textElements.forEach((element) => {
        const split = (new SplitText(element, {
          type: "lines",
          linesClass: "line",
        }) as unknown) as SplitInstance;

        containerSplits.push(split);
        gsap.set(split.lines, { y: "-110%" });
      });

      splitsByContainer.push(containerSplits);
    });

    setSplitTextByContainer(splitsByContainer);

    return () => {
      splitsByContainer.forEach((containerSplits) => {
        containerSplits.forEach((split) => {
          try {
            if (typeof (split as unknown as any).revert === "function") {
              (split as unknown as any).revert();
            }
          } catch {
            // ignore
          }
        });
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="menu-overlay fixed top-0 left-0 w-screen h-screen bg-menu-bg text-foreground overflow-hidden z-[1] pointer-events-none bg-[#111] text-white"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
    >
      <div
        className="menu-overlay-content fixed top-0 left-0 w-screen h-screen flex overflow-hidden pointer-events-auto"
        style={{ transform: "translateY(-50%)" }}
      >
        <div className="menu-media-wrapper flex-[2] opacity-0 will-change-[opacity] hidden lg:block h-full">
          <img
            src="../../public/menu/menu-media.jpg"
            alt="Menu background"
            className="w-full h-full object-cover opacity-75"
          />
        </div>

        <div className="menu-content-wrapper flex-[3] relative flex">
          <div className="menu-content-main absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] p-8 flex items-end gap-8 flex-col lg:flex-row">
            <div
              ref={(el) => {
                if (el) textContainersRef.current[0] = el;
              }}
              className="menu-col flex flex-col gap-2 flex-[3]"
            >
              <div className="menu-link overflow-hidden">
                <CustomLink
                  to="/"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                  onBeforeNavigate={closeMenu}
                >
                  Home
                </CustomLink>
              </div>

              <div className="menu-link overflow-hidden">
                <CustomLink
                  to="/about"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                  onBeforeNavigate={closeMenu}
                >
                  About
                </CustomLink>
              </div>

              <div className="menu-link overflow-hidden">
                <a
                  href="#"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                >
                  Portfolio
                </a>
              </div>

              <div className="menu-link overflow-hidden">
                <a
                  href="#"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                >
                  Studio
                </a>
              </div>

              <div className="menu-link overflow-hidden">
                <a
                  href="#"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                >
                  Journal
                </a>
              </div>

              <div className="menu-link overflow-hidden">
                <a
                  href="#"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                >
                  Connect
                </a>
              </div>
            </div>

            <div
              ref={(el) => {
                if (el) textContainersRef.current[1] = el;
              }}
              className="menu-col flex flex-col gap-2 flex-[2]"
            >
              <div className="menu-tag overflow-hidden">
                <a
                  href="#"
                  className="text-xl lg:text-2xl text-menu-fg-secondary"
                >
                  Web Animations
                </a>
              </div>
              <div className="menu-tag overflow-hidden">
                <a
                  href="#"
                  className="text-xl lg:text-2xl text-menu-fg-secondary"
                >
                  Interactive Media
                </a>
              </div>
              <div className="menu-tag overflow-hidden">
                <a
                  href="#"
                  className="text-xl lg:text-2xl text-menu-fg-secondary"
                >
                  Motion Craft
                </a>
              </div>
            </div>
          </div>

          <div className="menu-footer w-[75%] p-8 flex items-end gap-8 m-auto flex-col lg:flex-row">
            <div
              ref={(el) => {
                if (el) textContainersRef.current[2] = el;
              }}
              className="menu-col flex-[3] overflow-hidden"
            >
              <p className="text-sm font-medium text-menu-fg-secondary">
                Toronto, Canada
              </p>
            </div>
            <div
              ref={(el) => {
                if (el) textContainersRef.current[3] = el;
              }}
              className="menu-col flex flex-col gap-0 flex-[2]"
            >
              <p className="text-sm font-medium text-menu-fg-secondary overflow-hidden">
                +1 437 555 0199
              </p>
              <p className="text-sm font-medium text-menu-fg-secondary overflow-hidden">
                hello@nullspace.studio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;

