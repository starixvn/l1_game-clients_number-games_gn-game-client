import { useContext } from "react";

import { updateURLContext, URLContext } from "../../../_shared/react-contexts/url-context";
import { useClickSound } from "../../../_shared/react-hooks";
import Styles from "./switch-game.module.scss";

const SwitchGame = () => {
    const clickSound = useClickSound();
    const { backToRedirectUrl, isDirectMode, redirectUrl } = useContext(URLContext);
    const handleBackToLobbyOnclick = () => {
        clickSound();
        updateURLContext({ gameId: 0 });
        backToRedirectUrl(redirectUrl);
    };

    return (
        <div className={Styles["switch-game"]} onClick={() => handleBackToLobbyOnclick()}>
            <span id="list-game" className="icon icon-list-game" />
            Games
        </div>
    );
};

export default SwitchGame;
