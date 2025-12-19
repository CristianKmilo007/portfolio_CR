import DynamicSVGVariant from "../assets/icons/DynamicLogo";
import FuzzyText from "../components/FuzzyText";
import { useResponsive } from "../hooks/useMediaQuery";

export const NotFound = () => {
  const { isTablet } = useResponsive();

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[300px] md:w-[500px] h-[300px] md:h-[500px] relative">
        <div className="absolute flex justify-center items-center w-full h-full grayscale opacity-7">
          <DynamicSVGVariant
            width={isTablet ? 250 : 400}
            height={isTablet ? 250 : 400}
          />
        </div>
        <div className="flex flex-col justify-center items-center gap-3 w-full h-full relative z-[1] text-white">
          {/* <span className="font-extrabold text-9xl">404</span>
          <span className="text-2xl font-semibold">Pagina no encontrada</span> */}
          <FuzzyText
            baseIntensity={isTablet ? 0.12 : 0.18}
            fontSize={isTablet ? 100 : 150}
          >
            404
          </FuzzyText>
          <FuzzyText
            baseIntensity={isTablet ? 0.1 : 0.15}
            fontWeight={500}
            fontSize={isTablet ? 18 : 28}
          >
            Pagina no encontrada
          </FuzzyText>
        </div>
      </div>
    </div>
  );
};
