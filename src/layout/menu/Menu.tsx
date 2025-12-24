import DynamicSVGVariant from "../../assets/icons/DynamicLogo";
import MenuOverlay from "./components/MenuOverlay";
import CustomLink from "./components/CustomLink";
import type { ReactNode } from "react";
import { useMenu } from "./hooks/useMenu";

interface MenuProps {
  children: ReactNode;
}

const Menu = ({ children }: MenuProps) => {
  const {
    menuLogoRef,
    isTablet,
    menuToggleBtnRef,
    handleMenuToggle,
    menuToggleLabelRef,
    hamburgerIconRef,
    setSplitTextByContainer,
    closeMenu,
    containerRef,
  } = useMenu();

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
