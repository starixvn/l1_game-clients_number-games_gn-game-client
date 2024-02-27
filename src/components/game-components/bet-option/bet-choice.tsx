import { t } from "i18next";
import { BaseProps } from "./types";

export const BetChoice: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    return (
        <div id={`${gameName}-${choice}-bet-name`} className={className}>
            {t(`glossary_${choice}`, { ns: gameName }) || choice}
        </div>
    );
};
