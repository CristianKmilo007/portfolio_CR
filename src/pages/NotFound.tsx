import DynamicSVGVariant from "../assets/icons/DynamicLogo";
import FuzzyText from "../components/FuzzyText";

export const NotFound = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[500px] h-[500px] relative">
        <div className="absolute flex justify-center items-center w-full h-full grayscale opacity-7">
          <DynamicSVGVariant width={400} height={400} />
        </div>
        <div className="flex flex-col justify-center items-center gap-3 w-full h-full relative z-[1] text-white">
          {/* <span className="font-extrabold text-9xl">404</span>
          <span className="text-2xl font-semibold">Pagina no encontrada</span> */}
          <FuzzyText fontSize={150}>404</FuzzyText>
          <FuzzyText baseIntensity={0.15} fontWeight={500} fontSize={28}>
            Pagina no encontrada
          </FuzzyText>
        </div>
      </div>
    </div>
  );
};
