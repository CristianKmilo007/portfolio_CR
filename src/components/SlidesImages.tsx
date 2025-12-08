// src/components/SlideImages.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
/* import { createPortal } from 'react-dom';
import { Button } from '@heroui/react'; */
import { /* FaArrowLeft, FaArrowRight, */ FaRegCirclePlay } from 'react-icons/fa6';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, /* Pagination, */ Thumbs } from 'swiper/modules';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgAutoplay from 'lightgallery/plugins/autoplay';
import lgRotate from 'lightgallery/plugins/rotate';
import lgFullScreen from 'lightgallery/plugins/fullscreen';
import lgVideo from 'lightgallery/plugins/video';
import type { SwiperRef } from 'swiper/react';

import '../../node_modules/swiper/swiper.css';
import '../../node_modules/swiper/modules/navigation.css';
import '../../node_modules/swiper/modules/pagination.css';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-autoplay.css';
import 'lightgallery/css/lg-rotate.css';
import 'lightgallery/css/lg-fullscreen.css';
import 'lightgallery/css/lg-video.css';
/* import { useResponsive } from '../hooks/useMediaQuery'; */

interface SlideImagesProps {
  slides?: Array<any>;
  thumbs?: boolean;
  activeIndex?: number | null;
}

const SlideImagesComponent = ({
  slides = [],
  thumbs,
  activeIndex = null,
}: SlideImagesProps) => {
  const swiperRef = useRef<SwiperRef | null>(null);
  const lgRef = useRef<any>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const videoPlayState = useRef<Array<boolean>>([]);

  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  /* const { isMobile } = useResponsive();

  const [showNavigation, setShowNavigation] = useState(false); */
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  /* const handlePrev = useCallback(() => {
    try {
      swiperRef.current?.swiper.slidePrev();
    } catch {}
  }, []);

  const handleNext = useCallback(() => {
    try {
      swiperRef.current?.swiper.slideNext();
    } catch {}
  }, []); */

  const dynamicEl = useMemo(() => {
    return (slides ?? []).map((slide: any) => {
      if (slide?.type === 'image') {
        return {
          src: slide.src ?? '',
          thumb: slide.thumb ?? slide.src ?? '',
        };
      }

      return {
        thumb: slide.thumb ?? '',
        video: {
          source: [{ src: slide.src ?? '', type: 'video/mp4' }],
          tracks: [],
          attributes: {
            preload: 'metadata',
            playsinline: true,
            controls: true,
            poster: slide.thumb ?? '',
          },
        },
      };
    });
  }, [slides]) as unknown as Array<any>;

  const onInit = useCallback((detail: { instance: any }) => {
    lgRef.current = detail.instance;
  }, []);

  const open = useCallback(() => {
    lgRef.current?.openGallery(idxRef.current);
  }, []);

  const handleSlideChange = useCallback(
    (swiper: any) => {
      /* const totalSlides = swiper.slides?.length ?? 0;
      const slidesPerView = Number(swiper.params?.slidesPerView ?? 1); */
      /* setShowNavigation(totalSlides > slidesPerView); */

      const prevIndex = idxRef.current;
      const newIndex = swiper.realIndex ?? 0;

      const prevVideo = videoRefs.current[prevIndex];
      if (prevVideo) {
        videoPlayState.current[prevIndex] = !prevVideo.paused;
        prevVideo.pause();
      }

      idxRef.current = newIndex;
      setIdx(newIndex);

      const newSlide = slides[newIndex];
      if (newSlide?.type === 'video') {
        const newVideo = videoRefs.current[newIndex];
        const wasPlaying = videoPlayState.current[newIndex];
        if (wasPlaying) {
          newVideo?.play().catch(() => {});
        }
      }
    },
    [slides],
  );

  useEffect(() => {
    if (typeof activeIndex === 'number' && swiperRef.current?.swiper) {
      Promise.resolve().then(() => {
        try {
          const s = swiperRef.current!.swiper;
          if (typeof s.slideToLoop === 'function') {
            s.slideToLoop(activeIndex);
          } else {
            s.slideTo(activeIndex);
          }
        } catch {}
      });
    }
  }, [activeIndex]);

  if (!Array.isArray(slides) || slides.length === 0) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-[#f4f4f5] dark:bg-[#313236] text-center text-[#aaa] text-xs ${thumbs ? 'rounded-xl' : 'rounded-none'}`}
      >
        <span className="w-[100px]">{'Producto sin imagenes'}</span>
      </div>
    );
  }

  if (slides.length === 1) {
    const single = slides[0];
    return (
      <>
        <LightGallery
          onInit={onInit}
          dynamic
          dynamicEl={dynamicEl}
          plugins={[
            lgZoom,
            lgThumbnail,
            lgFullScreen,
            lgAutoplay,
            lgRotate,
            lgVideo,
          ]}
          speed={500}
          licenseKey="your_license_key"
          hideScrollbar
          autoplayFirstVideo={false}
        />
        <div
          className={`w-full h-full relative overflow-hidden ${thumbs ? 'rounded-xl' : 'rounded-none'}`}
        >
          <div className="w-full h-full flex justify-center items-center cursor-zoom-in">
            {single.type === 'image' ? (
              <img
                src={single.src}
                alt="slide-0"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full"
              />
            ) : (
              <video
                ref={(el) => {
                  videoRefs.current[0] = el;
                }}
                src={single.src}
                poster={single.thumb}
                controls
                preload="metadata"
                className="object-content w-full h-full video-no-click"
                onClickCapture={(e) => e.preventDefault()}
              />
            )}
            <div
              onClick={() => {
                const vid = videoRefs.current[0];
                if (single.type === 'video' && vid && !vid.paused) {
                  vid.pause();
                  open();
                  return;
                }
                open();
              }}
              className="absolute w-full top-0 left-0 h-full"
            />
          </div>
        </div>
        
      </>
    );
  }

  // ------------------ PORTAL HELPERS ------------------
  /* const getOverlayEl = () => {
    try {
      return document.querySelector('.minimap-wrapper .minimap-overlay') as HTMLElement | null;
    } catch {
      return null;
    }
  }; */

 /*  const renderControls = (containerClass = '') => {
    return (
      <>
        {showNavigation && !isMobile && (
          <>
            <Button
              isIconOnly
              radius="full"
              onPress={handleNext}
              className={`arrow-right absolute min-w-max top-1/2 -translate-y-1/2 right-1 z-[1] bg-[#00000088] hover:!opacity-100 flex justify-center items-center ${thumbs ? 'h-8 w-8' : 'h-6 w-6'} ${containerClass}`}
            >
              <FaArrowRight className="text-white" size={thumbs ? 14 : 12} />
            </Button>

            <Button
              isIconOnly
              radius="full"
              onPress={handlePrev}
              className={`arrow-left absolute min-w-max top-1/2 -translate-y-1/2 left-1 z-[1] bg-[#00000088] hover:!opacity-100 flex justify-center items-center ${thumbs ? 'h-8 w-8' : 'h-6 w-6'} ${containerClass}`}
            >
              <FaArrowLeft className="text-white" size={thumbs ? 14 : 12} />
            </Button>
          </>
        )}

        <span
          className={`absolute bottom-1 right-1 z-[1] text-white bg-[#00000088] px-[7px] pt-[2px] pb-[1px] rounded-full ${thumbs ? 'text-[11px]' : 'text-[9px]'} ${containerClass}`}
        >
          {idx + 1} / {slides.length}
        </span>
      </>
    );
  }; */
  // ------------------ END PORTAL HELPERS ------------------

  return (
    <>
      <LightGallery
        onInit={onInit}
        dynamic
        dynamicEl={dynamicEl}
        plugins={[
          lgZoom,
          lgThumbnail,
          lgFullScreen,
          lgAutoplay,
          lgRotate,
          lgVideo,
        ]}
        speed={500}
        licenseKey="your_license_key"
        hideScrollbar
        autoplayFirstVideo={false}
      />

      <div className="w-full h-full flex flex-col gap-2">
        <div
          className={`w-full h-full relative overflow-hidden ${thumbs ? 'rounded-xl' : 'rounded-none'}`}
        >
          <Swiper
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Navigation, Thumbs, FreeMode]}
            className="mySwiper w-full h-full"
            ref={swiperRef}
            slidesPerView={1}
            onSlideChange={handleSlideChange}
            pagination={{ dynamicBullets: true, clickable: true }}
            loop
          >
            {slides.map((slide, i) => (
              <SwiperSlide key={i}>
                <div
                  className={`w-full h-full flex justify-center items-center cursor-zoom-in ${slide?.type === 'video' ? 'bg-[#010101]' : ''} ${slide?.isContain && 'bg-[#01010133]'}`}
                >
                  {slide.src ? (
                    slide.type === 'image' ? (
                      <img
                        src={slide.src}
                        alt={`slide-${i}`}
                        loading="lazy"
                        decoding="async"
                        className={`${slide?.isContain ? 'object-contain' : 'object-cover'} w-full h-full`}
                      />
                    ) : (
                      <video
                        ref={(el) => {
                          videoRefs.current[i] = el;
                        }}
                        src={slide.src}
                        poster={slide.thumb}
                        controls
                        preload="metadata"
                        className="object-content w-full h-full video-no-click"
                        onClickCapture={(e) => e.preventDefault()}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f4f4f5] dark:bg-[#313236] text-center text-[#aaa] text-xs">
                      <span className="w-[100px]">
                        {'Error al cargar la imagen'}
                      </span>
                    </div>
                  )}

                  <div
                    onClick={() => {
                      const vid = videoRefs.current[i];
                      if (slide.type === 'video' && vid && !vid.paused) {
                        vid.pause();
                        open();
                        return;
                      }
                      open();
                    }}
                    className={`absolute w-full top-0 left-0 ${slide?.type === 'video' ? 'h-[calc(100%-65px)]' : 'h-full'}`}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Render controls via portal into overlay if available, otherwise render inline (fallback) */}
          {/* {(() => {
            const overlay = getOverlayEl();
            if (overlay) {
              return createPortal(renderControls('portal-control'), overlay);
            }
            return renderControls('');
          })()} */}
        </div>

        {thumbs && (
          <div className="w-full">
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[Navigation, Thumbs, FreeMode]}
              spaceBetween={8}
              slidesPerView={4}
              freeMode
              watchSlidesProgress
              loop
            >
              {slides.map((slide: any, i: number) => (
                <SwiperSlide key={i}>
                  <div className="w-full h-[85px] sm:h-[94px] rounded-none overflow-hidden flex justify-center items-center imgs-thumb opacity-60 cursor-pointer">
                    {slide.thumb ? (
                      <>
                        <img
                          src={slide.thumb}
                          alt={`thumb-${i}`}
                          loading="lazy"
                          decoding="async"
                          className="object-cover w-full h-full"
                        />
                        {slide?.type === 'video' && (
                          <FaRegCirclePlay
                            size={25}
                            className="absolute z-[1] text-[#fff]"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f4f4f5] dark:bg-[#313236] text-center text-[#aaa] text-[11px] opacity-100 leading-3.5">
                        <span className="w-[100px]">
                          {'Error al cargar la imagen'}
                        </span>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </>
  );
};

export const SlideImages = React.memo(SlideImagesComponent);
export default SlideImages;
