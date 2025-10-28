import React, { useId } from "react";

export type GradientPair = [string, string];

export interface DynamicSVGVariantProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  idPrefix?: string;
  primaryGradient?: GradientPair;
  accentGradient?: GradientPair;
  // nuevos props para los colores planos del "frente"
  frontPrimary?: string; // reemplaza .cls-7
  frontSecondary?: string; // reemplaza .cls-8
  title?: string;
}

const DynamicSVGVariant: React.FC<DynamicSVGVariantProps> = ({
  width = 500,
  height = 500,
  className = "",
  idPrefix,
  primaryGradient = ["#8a0bff", "#410086"],
  accentGradient = ["#64008b", "#f92cf7"],
  frontPrimary = "#ae38ff", // default similar al original
  frontSecondary = "#f92cf7", // default similar al original
  title = "Decorative graphic",
}) => {
  const reactId = useId();
  const uid = (
    idPrefix ||
    reactId ||
    Math.random().toString(36).slice(2)
  ).replace(/[:.]/g, "_");

  const g1 = `linear-gradient-${uid}-1`;
  const g2 = `linear-gradient-${uid}-2`;
  const g3 = `linear-gradient-${uid}-3`;
  const g4 = `linear-gradient-${uid}-4`;
  const g5 = `linear-gradient-${uid}-5`;
  const g6 = `linear-gradient-${uid}-6`;
  const g7 = `linear-gradient-${uid}-7`;
  const g8 = `linear-gradient-${uid}-8`;
  const g9 = `linear-gradient-${uid}-9`;
  const g10 = `linear-gradient-${uid}-10`;

  const Stop = ({
    offset,
    color,
    opacity,
  }: {
    offset: number | string;
    color: string;
    opacity?: number;
  }) => (
    <stop offset={String(offset)} stopColor={color} stopOpacity={opacity} />
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={width}
      height={height}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
    >
      <defs>
        <style>{`.cls-1{fill:url(#${g1})}.cls-1,.cls-2,.cls_3,.cls-4,.cls-5,.cls-6,.cls-7,.cls-8,.cls-9,.cls-10{stroke-width:0px}.cls-2{fill:url(#${g6})}.cls-11{isolation:isolate}.cls-3{fill:url(#${g5});opacity:.42}.cls-4{fill:url(#${g10});opacity:.32}.cls-5{fill:url(#${g2})}.cls-6{fill:url(#${g7})}.cls-9{fill:url(#${g8})}.cls-10{fill:url(#${g4});mix-blend-mode:overlay}`}</style>

        <linearGradient
          id={g1}
          x1="131.47"
          y1="162.64"
          x2="494.38"
          y2="162.64"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color={primaryGradient[0]} />
          <Stop offset={1} color={primaryGradient[1]} />
        </linearGradient>

        <linearGradient
          id={g2}
          x1="136.95"
          y1="90.18"
          x2="373.75"
          y2="231.97"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color={primaryGradient[0]} opacity={0} />
          <Stop offset={1} color={primaryGradient[1]} />
        </linearGradient>

        <linearGradient
          id={g3}
          x1="366.7"
          y1="320.7"
          x2="366.7"
          y2="27.87"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color="#a553ff" />
          <Stop offset={1} color="#ae38ff" />
        </linearGradient>

        <linearGradient
          id={g4}
          x1="359.02"
          y1="201.14"
          x2="550.85"
          y2="263.25"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color="#af53ff" />
          <Stop offset={0.16} color="rgba(174, 77, 255, .8)" opacity={0.8} />
          <Stop offset={0.39} color="rgba(174, 69, 255, .52)" opacity={0.52} />
          <Stop offset={0.6} color="rgba(174, 63, 255, .29)" opacity={0.29} />
          <Stop offset={0.78} color="rgba(174, 59, 255, .13)" opacity={0.13} />
          <Stop offset={0.92} color="rgba(174, 56, 255, .04)" opacity={0.04} />
          <Stop offset={1} color="#ae38ff" opacity={0} />
        </linearGradient>

        <linearGradient
          id={g5}
          x1="172.12"
          y1="135.96"
          x2="506.68"
          y2="300.55"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color={primaryGradient[0]} />
          <Stop offset={1} color={primaryGradient[1]} opacity={0} />
        </linearGradient>

        <linearGradient
          id={g6}
          x1="3.8"
          y1="337.81"
          x2="366.7"
          y2="337.81"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color={accentGradient[0]} />
          <Stop offset={1} color={accentGradient[1]} />
        </linearGradient>

        <linearGradient
          id={g7}
          x1="178.24"
          y1="301.59"
          x2="309.54"
          y2="482.03"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color={accentGradient[0]} />
          <Stop offset={1} color={accentGradient[1]} />
        </linearGradient>

        <linearGradient
          id={g8}
          x1="131.47"
          y1="472.58"
          x2="131.47"
          y2="179.75"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color="#df38ff" />
          <Stop offset={1} color="#ff39ff" />
        </linearGradient>

        <linearGradient
          id={g9}
          x1="-27.09"
          y1="212.06"
          x2="298.01"
          y2="360.93"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} color="#9e0082" />
          <Stop offset={1} color="#ff39ff" opacity={0} />
        </linearGradient>

        <linearGradient
          id={g10}
          x1="40.44"
          y1="200"
          x2="375"
          y2="364.58"
          gradientTransform="translate(366.5 564.48) rotate(-180)"
          xlinkHref={`#${g5}`}
        />
      </defs>

      {title ? <title>{title}</title> : null}

      <g className="cls-11">
        <g id="OBJECTS">
          <g>
            <g>
              <path
                className="cls-1"
                d="M236.05,4.58h-104.58l215.1,207.65-107.55,108.47h126.63c18.93,0,36.21-5.32,44.54-13.72l75.79-76.44c11.43-11.53,11.19-25.04-.65-36.47L313.17,27.87c-14.81-14.3-44.6-23.3-77.12-23.3Z"
              />
              <path
                className="cls-5"
                d="M236.05,4.58h-104.58l215.1,207.65-107.55,108.47h126.63c18.93,0,36.21-5.32,44.54-13.72l75.79-76.44c11.43-11.53,11.19-25.04-.65-36.47L313.17,27.87c-14.81-14.3-44.6-23.3-77.12-23.3Z"
              />
              {/* ahora fill dinámico con prop frontPrimary (sobrescribe .cls-7) */}
              <path
                // className="cls-7" // opcional dejar o quitar
                fill={frontPrimary}
                d="M313.17,27.87c85.74,82.78,92.44,124.82,33.4,184.36l-107.55,108.47h126.63c18.93,0,36.21-5.32,44.54-13.72l75.79-76.44c11.43-11.53,11.19-25.04-.65-36.47L313.17,27.87Z"
              />
              <path
                className="cls-10"
                d="M313.17,27.87c85.74,82.78,92.44,124.82,33.4,184.36l-107.55,108.47h126.63c18.93,0,36.21-5.32,44.54-13.72l75.79-76.44c11.43-11.53,11.19-25.04-.65-36.47L313.17,27.87Z"
              />
              <path
                className="cls-3"
                d="M485.33,194.08l-48.57-46.89c3.32,26.86-9.83,51.36-38.09,79.86l-92.86,93.66h59.85c18.93,0,36.21-5.32,44.54-13.72l75.79-76.44c11.43-11.53,11.19-25.04-.65-36.47Z"
              />
            </g>
            <g>
              <path
                className="cls-2"
                d="M262.13,495.87h104.58l-215.1-207.65,107.55-108.47h-126.63c-18.93,0-36.21,5.32-44.54,13.72L12.2,269.91c-11.43,11.53-11.19,25.04.65,36.47l172.16,166.2c14.81,14.3,44.6,23.3,77.12,23.3Z"
              />
              <path
                className="cls-6"
                d="M262.13,495.87h104.58l-215.1-207.65,107.55-108.47h-126.63c-18.93,0-36.21,5.32-44.54,13.72L12.2,269.91c-11.43,11.53-11.19,25.04.65,36.47l172.16,166.2c14.81,14.3,44.6,23.3,77.12,23.3Z"
              />
              <path
                className="cls-9"
                d="M185.01,472.58c-85.74-82.78-92.44-124.82-33.4-184.36l107.55-108.47h-126.63c-18.93,0-36.21,5.32-44.54,13.72L12.2,269.91c-11.43,11.53-11.19,25.04.65,36.47l172.16,166.2Z"
              />
              {/* ahora fill dinámico con prop frontSecondary (sobrescribe .cls-8) */}
              <path
                // className="cls-8" // opcional dejar o quitar
                fill={frontSecondary}
                d="M185.01,472.58c-85.74-82.78-92.44-124.82-33.4-184.36l107.55-108.47h-126.63c-18.93,0-36.21,5.32-44.54,13.72L12.2,269.91c-11.43,11.53-11.19,25.04.65,36.47l172.16,166.2Z"
              />
              <path
                className="cls-4"
                d="M12.85,306.37l48.57,46.89c-3.32-26.86,9.83-51.36,38.09-79.86l92.86-93.66h-59.85c-18.93,0-36.21,5.32-44.54,13.72L12.2,269.91c-11.43,11.53-11.19,25.04.65,36.47Z"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default DynamicSVGVariant;
