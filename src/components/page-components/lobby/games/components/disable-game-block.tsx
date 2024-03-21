import { useCommonTranslate } from "../../../../../_shared/react-hooks";
import Styles from "../../lobby.module.scss";

export const DisabledGameBlock: React.FC<{ message: string }> = ({ message }) => {
    const { t } = useCommonTranslate();
    return (
        <>
            <div className={Styles["disable-game-block"]}></div>
            <div className={Styles["um-message"]}>{message || t("message_disabled_game")}</div>
        </>
    );
};
