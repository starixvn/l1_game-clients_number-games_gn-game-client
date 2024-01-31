import React from "react";

const cleanPercentage = (percentage: number) => {
  const tooLow = !Number.isFinite(+percentage) || percentage < 0;
  const tooHigh = percentage > 100;
  if (tooLow) return 0;
  return tooHigh ? 100 : +percentage;
};

const Circle: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 15;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - pct) * circ) / 100;
  return (
    <circle
      r={r}
      cx={16}
      cy={16}
      fill="transparent"
      //stroke={strokePct !== circ ? color : ""} // remove color as 0% sets full circumference
      strokeWidth={"2px"}
      strokeDasharray={circ}
      strokeDashoffset={pct ? strokePct : 0}
      strokeLinecap="round"
      className="circle-percentage"
    ></circle>
  );
};

const Text: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fontSize={"10px"}
      className="text-percentage"
    >
      {percentage.toFixed(0)}%
    </text>
  );
};

export const PercentageCircle: React.FC<{
  percentage: number;
}> = ({ percentage }) => {
  const pct = cleanPercentage(percentage);
  return (
    <svg width={32} height={32}>
      <g transform={`rotate(-90 ${"16 16"})`}>
        <circle r={15} cx={16} cy={16} fill="#00000080"></circle>
        <Circle pct={pct} />
      </g>
      <Text percentage={pct} />
    </svg>
  );
};

export default PercentageCircle;
