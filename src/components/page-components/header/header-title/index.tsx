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
    const appSetting = gameSettings[props.openingGameId];

    const tolgeeNamespace = appSetting ? appSetting["tolgeeNamespace"] : ResourceTypes.SABA_NUMBER;

    const { t } = useTranslator([tolgeeNamespace]);

    const headerTitle = `${
        props.isRenderGames
            ? `${t(`${tolgeeNamespace}.game_name_${props.openingGameId}`).toUpperCase()}`
            : `${t(`${ResourceTypes.SABA_NUMBER}.product_name`)}`.toLocaleUpperCase()
    }`;

    return (
        <div id="img-game-name" className={Styles["header-left"]}>
            {headerTitle}
        </div>
    );
};
export default HeaderTitle;
