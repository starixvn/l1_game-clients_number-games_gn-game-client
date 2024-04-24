import React, { useMemo } from "react";

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
        t(`${ResourceTypes.SABA_NUMBER}.product_name`)
    );

    return (
        <div key={`game-name-${openingGameId}`} id="img-game-name" className={Styles["header-left"]}>
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
