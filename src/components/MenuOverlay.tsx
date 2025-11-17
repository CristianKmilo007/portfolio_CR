// ------------------ src/components/MenuOverlay.tsx ------------------
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import CustomLink from "./CustomLink";
import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLinkedinIn } from "react-icons/fa6";
import { TbBrandGithubFilled } from "react-icons/tb";

type SplitInstance = {
  lines: HTMLElement[];
};

interface MenuOverlayProps {
  setSplitTextByContainer: (splits: SplitInstance[][]) => void;
  closeMenu?: () => Promise<void>;
}

const MenuOverlay = ({
  setSplitTextByContainer,
  closeMenu,
}: MenuOverlayProps) => {
  const textContainersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!gsap || !SplitText) return;

    const splitsByContainer: SplitInstance[][] = [];

    textContainersRef.current.forEach((container) => {
      if (!container) return;

      const textElements = container.querySelectorAll<HTMLElement>("a, p");
      const containerSplits: SplitInstance[] = [];

      textElements.forEach((element) => {
        const split = new SplitText(element, {
          type: "lines",
          linesClass: "line !flex items-center gap-2",
        }) as unknown as SplitInstance;

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
                  Sobre mi
                </CustomLink>
              </div>

              <div className="menu-link overflow-hidden">
                <CustomLink
                  to="/skills"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                  onBeforeNavigate={closeMenu}
                >
                  Habilidades
                </CustomLink>
              </div>

              <div className="menu-link overflow-hidden">
                <CustomLink
                  to="/experience"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                  onBeforeNavigate={closeMenu}
                >
                  Experiencia
                </CustomLink>
              </div>

              <div className="menu-link overflow-hidden">
                <CustomLink
                  to="/"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                  onBeforeNavigate={closeMenu}
                >
                  Servicios
                </CustomLink>
              </div>

              <div className="menu-link overflow-hidden">
                <CustomLink
                  to="/"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                  onBeforeNavigate={closeMenu}
                >
                  Portafolio
                </CustomLink>
              </div>

              <div className="menu-link overflow-hidden">
                <CustomLink
                  to="/"
                  className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]"
                  onBeforeNavigate={closeMenu}
                >
                  Contacto
                </CustomLink>
              </div>
            </div>

            <div className="flex flex-col gap-8 flex-[2]">
              <div
                ref={(el) => {
                  if (el) textContainersRef.current[3] = el;
                }}
                className="menu-col flex flex-col gap-[2px]"
              >
                <p className="text-sm font-medium text-menu-fg-secondary overflow-hidden flex items-center gap-2">
                  <FaPhoneAlt size={12} />
                  <span>+57 313 517 5498</span>
                </p>
                <p className="text-sm font-medium text-menu-fg-secondary overflow-hidden flex items-center gap-2">
                  <MdEmail size={14} />
                  <span>cc.rojas.07@gmail.com</span>
                </p>
                <p className="text-sm font-medium text-menu-fg-secondary overflow-hidden flex items-center gap-2">
                  <FaMapMarkerAlt size={13} />
                  <span>Villavicencio - Colombia</span>
                </p>
              </div>

              <div
                ref={(el) => {
                  if (el) textContainersRef.current[1] = el;
                }}
                className="menu-col flex gap-2"
              >
                <div className="menu-tag overflow-hidden border border-white !size-10 rounded-full">
                  <a
                    href="https://www.linkedin.com/in/cristian-rojas-129174131/"
                    className="w-full h-full flex items-center justify-center"
                    target="_blank"
                  >
                    <FaLinkedinIn size={18} />
                  </a>
                </div>
                <div className="menu-tag overflow-hidden border border-white !size-10 rounded-full">
                  <a
                    href="https://github.com/CristianKmilo007"
                    className="w-full h-full flex items-center justify-center"
                    target="_blank"
                  >
                    <TbBrandGithubFilled size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
