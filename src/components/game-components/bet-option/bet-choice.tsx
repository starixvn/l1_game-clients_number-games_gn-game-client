import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

export const BetChoice: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const { t } = useTranslator([gameName]);

    return (
        <div id={`${gameName}-${choice}-bet-name`} className={`text-center ${Styles["bet-name"]} ${className}`}>
            {t(`glossary_${choice}`, { ns: gameName }) || choice}
        </div>
    );
};
