import SlideImages from "./SlidesImages";
import { Button } from "@heroui/react";
import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { PiLinkBold } from "react-icons/pi";
import { useSliderProjects } from "../hooks/useSliderProjects";

function MinimapStaticControls({
  onPrev,
  onNext,
  bullets,
  activeIndex,
  onBulletClick,
  innerRef,
}: {
  onPrev: () => void;
  onNext: () => void;
  bullets: number;
  activeIndex: number;
  onBulletClick: (i: number) => void;
  counterText: string;
  innerRef: any;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[9] minimap-static-controls">
      <div ref={innerRef} className="absolute inset-0 pointer-events-none">
        <Button
          isIconOnly
          radius="full"
          onPress={onPrev}
          className={`pointer-events-auto button-prev cursor-none absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 bg-black/60 text-white w-9 h-9 min-w-9 flex items-center justify-center`}
        >
          <FaArrowLeft className="text-white" size={14} />
        </Button>

        <Button
          isIconOnly
          radius="full"
          onPress={onNext}
          className={`pointer-events-auto button-next cursor-none absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-9 h-9 min-w-9 flex items-center justify-center`}
        >
          <FaArrowRight className="text-white" size={14} />
        </Button>

        <div className="pointer-events-auto absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: bullets }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onBulletClick(i);
              }}
              className={`w-[5px] sm:w-2 h-[5px] sm:h-2 rounded-full cursor-none dots-slider ${
                i === activeIndex ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Ir a ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SliderProjectsProps {
  isActive?: boolean;
  onScrollToHero?: () => void;
}

export const SliderProjects = ({
  isActive,
  onScrollToHero,
}: SliderProjectsProps) => {
  const {
    rootRef,
    indicesToRender,
    stateRef,
    getProjectData,
    isLaptop,
    viewportW,
    viewportH,
    projectListRef,
    isMobile,
    isDesktop2XL,
    isDesktopXL,
    minimapWrapperRef,
    minimapImgPreviewRef,
    minimapInfoListRef,
    handlePrev,
    handleNext,
    controlsState,
    handleBulletClick,
    controlsInnerRef,
  } = useSliderProjects({ isActive, onScrollToHero });

  return (
    <div ref={rootRef} className="w-full projects-root">
      <div className="content fixed w-full h-screen overflow-hidden pointer-events-none">
        <div className="left-panels absolute left-0 lg:left-6 top-0 z-[20] pointer-events-none w-screen lg:w-[calc(50%-150px)] h-screen overflow-visible">
          {indicesToRender.map((index) => {
            const panelEntry = stateRef.current.panels.get(index);
            const elRef =
              panelEntry?.elRef ?? React.createRef<HTMLDivElement>();
            if (!panelEntry) stateRef.current.panels.set(index, { elRef });

            const project = getProjectData(index);

            return (
              <div
                ref={elRef}
                key={`left-panel-${index}`}
                aria-hidden="false"
                style={{
                  transform: isLaptop
                    ? `translate3d(${index * viewportW}px, 0, 0)`
                    : `translate3d(0, ${index * viewportH}px, 0)`,
                }}
                className="absolute left-0 w-full pt-[345px] sm:pt-[420px] lg:pt-0 h-auto lg:h-screen transform transition-opacity duration-300 ease-out will-change-transform opacity-0 pointer-events-none"
              >
                <div className="w-full h-full flex items-center justify-center lg:justify-end p-6 box-border text-white lg:text-right">
                  <div className="max-w-[500px] lg:max-w-[400px] flex flex-col gap-2">
                    <div className="w-full flex gap-2 lg:justify-end items-center">
                      <h3 className="text-3xl sm:text-4xl font-semibold">
                        {project.name}
                      </h3>
                      {project.link && (
                        <a
                          href={project?.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir ${project.name} en nueva pestaña`}
                          className="cursor-none"
                        >
                          <Button
                            isIconOnly
                            size="sm"
                            radius="full"
                            className="bg-[#00000036] mt-1 cursor-none button-link"
                          >
                            <PiLinkBold color="#fff" size={18} />
                          </Button>
                        </a>
                      )}
                    </div>
                    <p className="text-base sm:text-lg leading-5 sm:leading-6 text-[#aaa]">
                      {project.description}
                    </p>
                    <div className="flex lg:justify-end flex-wrap gap-2 mt-2">
                      {project.technologies.map((t: any) => (
                        <span
                          key={t}
                          className="text-sm px-3 py-1 bg-[#ffffff1c] rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ul
          ref={projectListRef}
          className="project-list relative w-full h-screen list-none pointer-events-auto"
        >
          {indicesToRender.map((index) => {
            const mapItem = stateRef.current.projects.get(index);
            const elRef = mapItem?.elRef ?? React.createRef<HTMLDivElement>();
            if (!mapItem)
              stateRef.current.projects.set(index, { elRef, parallax: null });

            const data = getProjectData(index);
            return (
              <li
                key={`proj-${index}`}
                ref={elRef}
                className="project absolute w-full h-screen will-change-transform overflow-hidden top-0 left-0"
                style={{ transform: "translateY(0px)" }}
              >
                <img
                  src={data.image}
                  alt={`bg-${index}`}
                  className="w-full h-full object-cover filter blur-[50px] brightness-40"
                  decoding="async"
                />
              </li>
            );
          })}
        </ul>

        <div
          className="minimap fixed top-[210px] sm:top-[260px] lg:top-1/2 left-1/2 lg:left-[65%] -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-auto"
          style={{
            width: isMobile ? 350 : isDesktop2XL ? 500 : 615,
            height: isMobile
              ? 250
              : isDesktopXL
              ? 300
              : isDesktop2XL
              ? 350
              : 400,
          }}
        >
          <div
            className="minimap-wrapper relative w-full h-full rounded-2xl"
            ref={minimapWrapperRef}
          >
            <div
              ref={minimapImgPreviewRef}
              className="minimap-img-preview absolute inset-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none"
            ></div>

            <div
              ref={minimapInfoListRef}
              className="minimap-info-list relative w-full h-full overflow-hidden rounded-2xl"
            >
              {indicesToRender.map((index) => {
                const miItem = stateRef.current.minimapInfo.get(index);
                const elRef =
                  miItem?.elRef ?? React.createRef<HTMLDivElement>();
                const wrapperRef =
                  miItem?.wrapperRef ?? React.createRef<HTMLDivElement>();
                if (!miItem)
                  stateRef.current.minimapInfo.set(index, {
                    elRef,
                    wrapperRef,
                    rootMounted: false,
                    parallax: null,
                    swiper: null,
                  });

                const data = getProjectData(index);
                const slides =
                  Array.isArray(data.slides) && data.slides.length > 0
                    ? data.slides
                    : data.image
                    ? [{ type: "image", src: data.image }]
                    : [];

                return (
                  <div
                    key={`info-${index}`}
                    ref={elRef}
                    className="minimap-item-info absolute w-full h-[250px] sm:h-[300px] xl:h-[350px] 2xl:h-[400px] flex flex-col justify-between will-change-transform"
                    style={{ top: 0, left: 0 }}
                  >
                    <div
                      ref={wrapperRef}
                      className="minimap-info-media-wrapper absolute inset-0 w-full h-full pointer-events-auto opacity-100 transition-opacity duration-300"
                      data-react-mounted="0"
                    >
                      <SlideImages slides={slides} thumbs={false} />
                    </div>
                    <div className="minimap-item-info-row w-full flex justify-between p-2 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>

            <MinimapStaticControls
              onPrev={handlePrev}
              onNext={handleNext}
              bullets={controlsState.bullets}
              activeIndex={controlsState.activeIndex}
              onBulletClick={handleBulletClick}
              counterText={controlsState.counterText}
              innerRef={controlsInnerRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
