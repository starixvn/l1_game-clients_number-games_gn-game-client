import Style from "./statistic-icon.module.scss";
const StatisticIcon = (iconProps: any) => {
  return (
    <span className={Style[`statistic-${iconProps.bgColor}`]}>
      {iconProps.betChoice}
    </span>
  );
};

export default StatisticIcon;
