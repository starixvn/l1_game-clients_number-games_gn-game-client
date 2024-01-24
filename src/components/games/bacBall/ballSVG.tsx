import * as React from "react";
import { SVGProps } from "react";
const BallSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={179}
    height={179}
    fill="none"
    {...props}
  >
    <g id="ball">
      <circle cx={89.5} cy={89.5} r={89.5} fill="#4441C6" />
      <path
        fill="#fff"
        d="M74.003 56.896h24.384V124H87.635V66.976H74.003v-10.08Z"
      />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.8}
        strokeWidth={11}
        d="M164.5 89a74.5 74.5 0 1 1-149.002 0A74.5 74.5 0 0 1 164.5 89h0Z"
      />
    </g>
  </svg>
);
export default BallSVG;
