// src/pages/Skills.tsx

import DarkVeil from "./components/DarkVeil";
import StarsCanvas from "./components/StarBackground";
import FadeContent from "../home/components/FadeContent";
import ServicesModal from "./components/modals/ServicesModal";
import { useSkills } from "./hooks/useSkills";

export const Skills: React.FC = () => {
  const {
    containerRef,
    leftRef,
    leftSectionsReversed,
    rightRef,
    SECTIONS,
    isOpen,
    onOpenChange,
    isItems,
  } = useSkills();

  return (
    <div className="bg-[#111] w-screen h-screen relative text-white">
      <FadeContent
        blur={true}
        duration={1000}
        delay={500}
        easing="ease-out"
        initialOpacity={0}
        className="w-full h-full fixed z-10"
      >
        <StarsCanvas />
      </FadeContent>

      <FadeContent
        blur={true}
        duration={5000}
        delay={1500}
        easing="ease-out"
        initialOpacity={0}
        className="w-[1000px] md:w-full h-[250px] lg:h-[600px] relative"
      >
        <DarkVeil />
      </FadeContent>

      <FadeContent
        blur={true}
        duration={1000}
        delay={1500}
        easing="ease-out"
        initialOpacity={0}
        className="absolute top-0 left-0 w-full h-full z-20"
      >
        <section
          ref={containerRef}
          className="w-full h-full relative z-[999]"
          aria-label="Skills split scroller"
        >
          <div className="absolute w-full h-full inset-0 flex flex-col-reverse lg:flex-row">
            {/* LEFT COLUMN (lista invertida para que visual baje) */}

            <div
              ref={leftRef}
              className="flex flex-row lg:flex-col w-full lg:w-1/2 h-1/2 lg:h-full z-[1]"
            >
              {leftSectionsReversed.map((s) => (
                <div
                  key={s.id}
                  className={`split-item w-full min-w-full lg:w-full lg:min-w-auto h-full lg:h-screen lg:min-h-screen flex items-center justify-center`}
                >
                  {s.left}
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN (orden normal, sube) */}

            <div
              ref={rightRef}
              className="flex flex-row lg:flex-col w-full lg:w-1/2 h-1/2 lg:h-full"
            >
              {SECTIONS.map((s) => (
                <div
                  key={s.id}
                  className={`split-item w-full min-w-full lg:w-full lg:min-w-auto h-full lg:h-screen lg:min-h-screen flex items-center justify-center `}
                >
                  {s.right}
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeContent>

      <ServicesModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        items={isItems}
      />
    </div>
  );
};

export default Skills;
