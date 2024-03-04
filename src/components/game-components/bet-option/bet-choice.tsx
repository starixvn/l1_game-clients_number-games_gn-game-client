import { BaseProps } from "./types";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";

export const BetChoice: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const { t } = useTranslator([gameName]);

    return (
        <div id={`${gameName}-${choice}-bet-name`} className={className}>
            {t(`glossary_${choice}`, { ns: gameName }) || choice}
        </div>
    );
};
