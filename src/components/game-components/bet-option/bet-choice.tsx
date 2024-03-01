import { useTranslate } from "@tolgee/react";
import { BaseProps } from "./types";

export const BetChoice: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const { t } = useTranslate(gameName);

    return (
        <div id={`${gameName}-${choice}-bet-name`} className={className}>
            {t(`glossary_${choice}`, { ns: gameName }) || choice}
        </div>
    );
};
