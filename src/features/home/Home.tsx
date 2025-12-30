// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ParticlesContainer from "./components/ParticlesContainer";
import TextType from "./components/TextType";
import AnimatedContent from "./components/AnimatedContent";
import {
  MouseParallaxContainer,
  MouseParallaxChild,
} from "react-parallax-mouse";
import FadeContent from "./components/FadeContent";
import CircularText from "./components/CircularText";
import { useHome } from "./hooks/useHome";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export const Home = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    // small delay para asegurarnos que portal ya fue appended y estilos se calcularon
    const id = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh && ScrollTrigger.refresh();
      } catch {}
    }, 1500);
    return () => clearTimeout(id);
  }, [mounted]);

  const {
    rootRef,
    pinRef,
    leftRef,
    particlesRef,
    rightRef,
    isTablet,
    isLaptop,
    centerRef,
    cards,
  } = useHome({ ready: mounted });

  return (
    <div ref={rootRef}>
      {/* Placeholder para el pin: mantiene el espacio y será el "trigger" que ScrollTrigger pinée */}
      <div ref={pinRef} className="h-screen" aria-hidden="true" />

      {/* Contenido visual renderizado en portal para evitar ancestros transform que causan jitter */}
      {mounted &&
        createPortal(
          <div
            className="fixed inset-0 bg-[#111]  will-change-transform pointer-events-none"
            aria-hidden="false"
          >
            <MouseParallaxContainer
              globalFactorX={0.1}
              globalFactorY={0.2}
              resetOnLeave
            >
              <div className="w-full h-screen flex justify-end relative pointer-events-auto">
                {/* TOP LEFT IMAGE */}
                <div className="w-[400px] grayscale mix-blend-color-dodge top-0 left-0 absolute">
                  <MouseParallaxChild
                    factorX={0.2}
                    factorY={0.1}
                    className="w-full h-full"
                  >
                    <FadeContent
                      blur={true}
                      duration={1000}
                      easing="ease-out"
                      initialOpacity={0}
                      className="w-full h-full"
                    >
                      <img
                        src="/home/top-left-img.png"
                        alt=""
                        className="w-full h-full object-contain object-left-top"
                      />
                    </FadeContent>
                  </MouseParallaxChild>
                </div>

                {/* LEFT CONTENT */}
                <div
                  ref={leftRef}
                  className="container mx-auto h-screen flex flex-col justify-center absolute left-1/2 -translate-x-1/2 z-[1] mt-10 door-left"
                >
                  <AnimatedContent
                    distance={100}
                    direction="vertical"
                    reverse={false}
                    duration={1.2}
                    ease="power3.out"
                    initialOpacity={0}
                    animateOpacity
                    scale={1}
                    threshold={0.2}
                    delay={0}
                    className={"-mt-[400px] sm:-mt-[200px] lg:mt-0 pl-4"}
                  >
                    <span className="text-white font-bold text-[35px] sm:text-[45px] lg:text-[60px] leading-8 sm:leading-12 lg:leading-17">
                      Me llamo <br />
                      <span className="text-[#555]">Cristian Rojas,</span> soy
                    </span>
                    <div className="h-[70px] sm:h-[100px]">
                      <TextType
                        text={[
                          "Desarrollador Frontend",
                          "Desarrollador Backend",
                          "Desarrollador Full Stack",
                          "Diseñador UI/UX",
                          "Programador",
                        ]}
                        typingSpeed={75}
                        pauseDuration={1500}
                        showCursor={false}
                        className="text-[40px] sm:text-[55px] lg:text-[80px] font-crimson italic"
                      />
                    </div>

                    <div className="w-[100px] sm:w-[125px] lg:w-[150px] h-[100px] sm:h-[125px] lg:h-[150px] relative flex justify-center items-center p-2 mt-0 lg:mt-20">
                      <div className="w-full h-full absolute">
                        <img
                          src="/home/circle-star.svg"
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <CircularText
                        text="SCROLL • SCROLL • SCROLL • "
                        onHover="slowDown"
                        spinDuration={20}
                        className="font-medium !w-full !h-full circular-text-home"
                      />
                    </div>
                  </AnimatedContent>
                </div>

                {/* MIDDLE / RIGHT IMAGES + PARTICLES */}
                <div className="relative w-full lg:w-[1200px]">
                  <div ref={particlesRef} className="absolute w-full h-full">
                    <FadeContent
                      blur={true}
                      duration={1000}
                      easing="ease-out"
                      initialOpacity={0}
                      className="w-full h-full"
                    >
                      <ParticlesContainer />
                    </FadeContent>
                  </div>

                  <div className="w-full h-full grayscale mix-blend-color-dodge ">
                    <MouseParallaxChild
                      factorX={0.2}
                      factorY={0.1}
                      className="w-full h-full"
                    >
                      <FadeContent
                        blur={true}
                        duration={1000}
                        easing="ease-out"
                        initialOpacity={0}
                        className="w-full h-full"
                      >
                        <img
                          src="/home/bg-explosion.png"
                          alt=""
                          className="w-full h-full object-cover object-[80%_25px] sm:object-right"
                        />
                      </FadeContent>
                    </MouseParallaxChild>
                  </div>

                  <div
                    ref={rightRef}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[650px] door-right ml-[110px] sm:ml-[325px] xl:ml-[160px] 2xl:ml-0"
                  >
                    <AnimatedContent
                      distance={100}
                      direction="vertical"
                      reverse={false}
                      duration={1.2}
                      ease="power3.out"
                      initialOpacity={0}
                      animateOpacity
                      scale={1}
                      threshold={0.2}
                      delay={0}
                    >
                      <img
                        src={"/home/hero-img.png"}
                        width={isTablet ? 450 : isLaptop ? 500 : 737}
                        height={isTablet ? 400 : isLaptop ? 450 : 678}
                        alt="hero"
                        className="translate-z-0"
                      />
                    </AnimatedContent>
                  </div>
                </div>

                {/* CENTRO */}
                <div
                  ref={centerRef}
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none px-0 sm:px-6 opacity-0"
                >
                  <div className="max-w-[400px] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] text-center">
                    <p className="text-white font-crimson italic font-normal text-[1.9rem] sm:text-[2.25rem] lg:text-[2.55rem] leading-9 sm:leading-10 lg:leading-12">
                      Desarrollador de aplicaciones web full stack, con amplio
                      conocimiento y solida experiencia, trabajando con
                      tecnologías modernas de diseño frontend y arquitectura
                      backend, escribiendo código limpio y entregando un trabajo
                      de calidad.
                    </p>
                  </div>
                </div>

                {/* CONTENEDORES HORIZONTALES */}
                <div className="absolute inset-x-0 bottom-[10vh] sm:bottom-[20vh] lg:bottom-[30vh] z-30 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pointer-events-none px-6">
                  {cards.map((card, idx) => {
                    return (
                      <div
                        key={idx}
                        ref={card.contentRef}
                        className="w-[325px] h-[90px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] bg-white/6 backdrop-blur-md border-white/10 rounded-2xl p-6 flex flex-row sm:flex-col gap-6  sm:gap-0 items-center justify-center sm:text-center text-white opacity-0 pointer-events-auto"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-4xl sm:text-5xl">+</span>
                          <span
                            ref={card.counterRef}
                            className="text-5xl sm:text-6xl font-crimson font-light"
                          >
                            0
                          </span>
                        </div>
                        <span className="mt-0 sm:mt-3 font-semibold leading-5 w-[125px]">
                          {card.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </MouseParallaxContainer>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Home;
