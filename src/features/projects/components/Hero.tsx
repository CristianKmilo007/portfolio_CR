import { useHero } from "../hooks/useHero";
import LightRays from "./LightRays";
import ScrollVelocity from "./ScrollVelocity";

interface HeroProps {
  onScrollPastHero: () => void;
  isVisible?: boolean;
}

export default function Hero({
  onScrollPastHero,
  isVisible = true,
}: HeroProps) {
  const {
    overlayGradientRef,
    lightRaysRef,
    isMobile,
    containerRef,
    leftTextRef,
    heroImagesWrapperRef,
    IMAGES,
    overlayImagesRef,
    textHorRef,
    scrollProgressRef,
  } = useHero({
    onScrollPastHero,
    isVisible,
  });

  return (
    <div
      className="fixed inset-0 z-0 flex items-center justify-center bg-[#111] overflow-hidden"
      style={{
        pointerEvents: isVisible ? "auto" : "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.4s ease-out",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#111]" />

        <div
          ref={overlayGradientRef}
          className="absolute inset-0 z-[1] overflow-hidden"
          style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a3a74] via-[#0a0a0a] to-[#1e3472]" />
        </div>

        <div
          ref={lightRaysRef}
          className="absolute inset-0 z-[2]"
          style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
        >
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1.5}
            followMouse
            fadeDistance={isMobile ? 2 : 1.5}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative z-[3] flex flex-col md:flex-row w-full h-full container"
      >
        <div className="w-full h-full flex items-center justify-center translate-y-25 md:translate-y-0">
          <div
            ref={leftTextRef}
            className="w-[350px] lg:w-[400px] xl:w-[550px] flex flex-col gap-6 opacity-0 mb-40"
          >
            <span className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white font-crimson italic text-center md:text-end">
              Ideas que brillan en pantalla y que realmente funcionan
            </span>
            <span className="text-[#ccc] text-base lg:text-lg xl:text-xl text-center md:text-end">
              Desde landing pages hasta dashboards utilizando patrones de
              diseño, componentes dinámicos y adaptables a cualquier pantalla
              para una mejor experiencia de usuario.
            </span>
          </div>
        </div>

        {/* NOTE: removimos las clases translate-x-* y dejamos el wrapper sin transform; GSAP aplicará el translate en JS */}
        <div
          ref={heroImagesWrapperRef}
          className="w-full h-full flex items-center justify-center relative"
        >
          <div className="relative w-[500px] h-[500px] hero-images-target ">
            {IMAGES.map((img, i) => (
              <div
                key={i}
                ref={(el) => {
                  overlayImagesRef.current[i] = el;
                }}
                className={
                  "absolute overflow-hidden flex justify-center items-center"
                }
                style={{ visibility: "hidden" }}
              >
                {img.isContain && (
                  <img
                    src={img.url}
                    alt=""
                    className={`absolute w-full h-full object-cover blur-2xl z-[1]`}
                  />
                )}
                <img
                  src={img.url}
                  className={`w-full h-full relative z-[2] ${
                    img.isContain ? "object-contain" : "object-cover"
                  }`}
                  alt={`hero-img-${i}`}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={textHorRef}
        className="absolute w-full bottom-65 sm:bottom-60 md:-bottom-10 lg:-bottom-20 z-[1] opacity-0"
      >
        <ScrollVelocity
          texts={[
            "PROJECTS • RESPONSIVE • DESIGN •",
            "REACT • ANGULAR • NEXT •",
          ]}
          velocity={5}
          className="custom-scroll-text text-white/4 text-[150px] lg:text-[225px] leading-[8rem] lg:leading-[12rem] font-semibold font-bbh tracking-wide"
          virtualProgressRef={scrollProgressRef}
          verticalTravel={1000}
          speedMultiplier={1}
          activeBoost={100}
          followAlpha={1}
        />
      </div>
    </div>
  );
}
