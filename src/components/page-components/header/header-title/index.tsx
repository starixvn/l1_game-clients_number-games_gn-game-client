import React from "react";
import Image from "next/image";
import { getAppSettings } from "../../../../_shared/app-settings";
import { useTranslator } from "../../../../_shared/react-hooks";
import { ResourceTypes } from "../../../../_shared/resources";
import Styles from "./header-title.module.scss";

type Props = {
    isRenderGames: boolean;
    openingGameId: number;
};

const HeaderTitle: React.FC<Props> = (props) => {
    const { gameSettings } = getAppSettings();
    const { openingGameId, isRenderGames } = props;
    const appSetting = gameSettings[openingGameId];
    const tolgeeNamespace = appSetting ? appSetting["tolgeeNamespace"] : ResourceTypes.SABA_NUMBER;

    const { t } = useTranslator([tolgeeNamespace]);

    const headerTitle = isRenderGames ? (
        <div className="text-animation">{t(`${tolgeeNamespace}.game_name_${openingGameId}`).toUpperCase()}</div>
    ) : (
        <Image src={`/static/images/logo-gn.svg`} height={26} width={110} className="logo" alt="Logo" />
    );

    return (
        <div key={`game-name-${openingGameId}`} id="img-game-name" className={Styles["header-left"]}>
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
