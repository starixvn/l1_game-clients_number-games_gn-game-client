import { useTranslator } from "../../../../../_shared/react-hooks";
import { ResourceTypes } from "../../../../../_shared/resources";
import Styles from "../../lobby.module.scss";

export const DisabledGameBlock: React.FC<{ message: string; isDisconnectGame: boolean; reconnectGame: Function }> = ({
    message,
    isDisconnectGame,
    reconnectGame,
}) => {
    const { t } = useTranslator();
    return (
        <>
            <div className={Styles["disable-game-block"]}></div>
            <div className={Styles["error-message"]}>
                <div>{message || t(`${ResourceTypes.COMMON}.message_disabled_game`)}</div>
                {isDisconnectGame && (
                    <button className={`btn-green w-70 ${Styles["btn-reconnect"]}`} onClick={() => reconnectGame()}>
                        {t(`${ResourceTypes.SABA_NUMBER}.button_reconnect`)}
                    </button>
                )}
            </div>
        </>
    );
};
