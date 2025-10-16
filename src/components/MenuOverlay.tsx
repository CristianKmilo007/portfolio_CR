import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

interface MenuOverlayProps {
  isOpen: boolean;
  splitTextByContainer: any[];
  setSplitTextByContainer: (splits: any[]) => void;
}

const MenuOverlay = ({ isOpen, splitTextByContainer, setSplitTextByContainer }: MenuOverlayProps) => {
  const textContainersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!gsap || !SplitText) return;

    const splitsByContainer: any[] = [];

    textContainersRef.current.forEach((container) => {
      if (!container) return;
      
      const textElements = container.querySelectorAll("a, p");
      const containerSplits: any[] = [];

      textElements.forEach((element) => {
        const split = new SplitText(element, {
          type: "lines",
          linesClass: "line",
        });
        containerSplits.push(split);

        gsap.set(split.lines, { y: "-110%" });
      });

      splitsByContainer.push(containerSplits);
    });

    setSplitTextByContainer(splitsByContainer);

    return () => {
      splitsByContainer.forEach((containerSplits) => {
        containerSplits.forEach((split: any) => split.revert());
      });
    };
  }, []);

  return (
    <div className="menu-overlay fixed top-0 left-0 w-screen h-screen bg-menu-bg text-foreground overflow-hidden z-[1] pointer-events-none"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}>
      <div className="menu-overlay-content fixed top-0 left-0 w-screen h-screen flex overflow-hidden pointer-events-auto"
        style={{ transform: "translateY(-50%)" }}>
        <div className="menu-media-wrapper flex-[2] opacity-0 will-change-[opacity] hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
            alt="Menu background" 
            className="opacity-25"
          />
        </div>
        
        <div className="menu-content-wrapper flex-[3] relative flex">
          <div className="menu-content-main absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] p-8 flex items-end gap-8 flex-col lg:flex-row">
            <div 
              ref={(el) => { if (el) textContainersRef.current[0] = el; }}
              className="menu-col flex flex-col gap-2 flex-[3]"
            >
              <div className="menu-link overflow-hidden">
                <a href="#" className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]">Index</a>
              </div>
              <div className="menu-link overflow-hidden">
                <a href="#" className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]">Portfolio</a>
              </div>
              <div className="menu-link overflow-hidden">
                <a href="#" className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]">Studio</a>
              </div>
              <div className="menu-link overflow-hidden">
                <a href="#" className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]">Journal</a>
              </div>
              <div className="menu-link overflow-hidden">
                <a href="#" className="text-5xl lg:text-[3.5rem] font-medium leading-[1.2]">Connect</a>
              </div>
            </div>

            <div 
              ref={(el) => { if (el) textContainersRef.current[1] = el; }}
              className="menu-col flex flex-col gap-2 flex-[2]"
            >
              <div className="menu-tag overflow-hidden">
                <a href="#" className="text-xl lg:text-2xl text-menu-fg-secondary">Web Animations</a>
              </div>
              <div className="menu-tag overflow-hidden">
                <a href="#" className="text-xl lg:text-2xl text-menu-fg-secondary">Interactive Media</a>
              </div>
              <div className="menu-tag overflow-hidden">
                <a href="#" className="text-xl lg:text-2xl text-menu-fg-secondary">Motion Craft</a>
              </div>
            </div>
          </div>

          <div className="menu-footer w-[75%] p-8 flex items-end gap-8 m-auto flex-col lg:flex-row">
            <div 
              ref={(el) => { if (el) textContainersRef.current[2] = el; }}
              className="menu-col flex-[3] overflow-hidden"
            >
              <p className="text-sm font-medium text-menu-fg-secondary">Toronto, Canada</p>
            </div>
            <div 
              ref={(el) => { if (el) textContainersRef.current[3] = el; }}
              className="menu-col flex flex-col gap-0 flex-[2]"
            >
              <p className="text-sm font-medium text-menu-fg-secondary overflow-hidden">+1 437 555 0199</p>
              <p className="text-sm font-medium text-menu-fg-secondary overflow-hidden">hello@nullspace.studio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
