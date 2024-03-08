import { FC, memo, useMemo, useRef, useState } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ModalContainer from "../modal-container";
import { v4 as uuidv4 } from "uuid";
import Styles from "./game-guide.module.scss";
import Loader from "../loader";
import { buildGameGuideUrl } from "../../../_shared/helpers";
import { tolgee } from "../../../_shared/tolgee";
import { useTheme } from "next-themes";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { buildVersion } from "../../../_shared/constants";

const GameGuideModal: FC = () => {
    const { isShowGameGuide } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const { t: translate } = useCommonTranslate();

    const handleCloseModal = () => {
        dispatch({ type: "TOGGLE_GAME_GUIDE", payload: { isShowGameGuide: false } });
    };

    return (
        isShowGameGuide && (
            <ModalContainer isOpen={true} onCloseModal={handleCloseModal} title={translate("game_guide")}>
                <WrapperGameGuide />
            </ModalContainer>
        )
    );
};

const GameGuide: FC = () => {
    const { userStakeLevel, gameConfigs } = useGameStateContext();
    const theme = useTheme().theme ?? "dark";
    const language = tolgee.getLanguage() ?? "en";
    const wrapperRef = useRef<HTMLIFrameElement>();
    const wrapperIframeRef = useRef<HTMLIFrameElement>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const minMaxBetParams = `&minBet=${userStakeLevel?.minBet}&maxBet=${userStakeLevel?.maxBet}`;
    const guideUrl = buildGameGuideUrl();
    const srcPath = `${guideUrl}/${language}/?gId=${gameConfigs["gameId"]}&t=${theme}${minMaxBetParams}&dy=1&v=${buildVersion}`;

    const hideSpinner = () => {
        setIsLoading(false);
        wrapperIframeRef.current.contentWindow.postMessage(JSON.stringify(gameConfigs), "*");
    };

    return useMemo(() => {
        return (
            <div className={Styles["container-guide"]} ref={wrapperRef}>
                {isLoading && (
                    <div className={Styles["guide-loading"]}>
                        <Loader></Loader>
                    </div>
                )}
                <iframe
                    style={{ display: isLoading ? "none" : "block" }}
                    ref={wrapperIframeRef}
                    key={uuidv4()}
                    className={Styles["guide-iframe"]}
                    src={srcPath}
                    referrerPolicy="strict-origin-when-cross-origin"
                    scrolling="auto"
                    onLoad={() =>
                        setTimeout(() => {
                            hideSpinner();
                        }, 300)
                    }
                />
            </div>
        );
    }, [isLoading]);
};

const WrapperGameGuide = memo(GameGuide);

export default GameGuideModal;
