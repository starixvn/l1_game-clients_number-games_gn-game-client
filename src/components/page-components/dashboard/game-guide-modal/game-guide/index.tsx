import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Loader from "../../../../game-components/loader";
import { UserStakeLevel } from "../../../../game-base/type";
import { useTheme } from "next-themes";
import { useTranslation } from "next-i18next";
import { isMobileOnly, isIOS, browserVersion } from "react-device-detect";
import Styles from "./game-guide.module.scss";
import { buildGameGuideUrl } from "../../../../../_shared/helpers/url-helper";

type Props = {
    gameId: number;
    userStakeLevel: UserStakeLevel;
    gameConfigs: any;
    fractionalOddsFormat: boolean;
};
const GameGuides: React.FC<Props> = (props) => {
    const { gameId, userStakeLevel, gameConfigs, fractionalOddsFormat } = props;
    const { i18n } = useTranslation();
    const { theme } = useTheme();
    const wrapperRef = useRef<HTMLIFrameElement>();
    const wrapperIframeRef = useRef<HTMLIFrameElement>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [heightGuide, setHeightGuide] = useState<number>(0);
    const [widthGuide, setWidthGuide] = useState<number>(0);
    const minMaxBetParams = `&minBet=${userStakeLevel?.minBet}&maxBet=${userStakeLevel?.maxBet}`;
    const oddsFormatParams = `&fof=${fractionalOddsFormat}`;
    const guideUrl = buildGameGuideUrl();
    const srcPath = `${guideUrl}/${i18n.language}/?gId=${gameId}&t=${theme}${minMaxBetParams}&dy=0&v=${Date.now()}${oddsFormatParams}`;
    const handleResize = () => {
        if (wrapperRef?.current) {
            setHeightGuide(wrapperRef.current.clientHeight);
            setWidthGuide(wrapperRef.current.clientWidth);
        }
    };

    const hideSpinner = () => {
        setIsLoading(false);
        handleResize();
        wrapperIframeRef.current.contentWindow.postMessage(JSON.stringify(gameConfigs), "*");
    };

    useEffect(() => {
        const isIOSBrowserVersion15 = isMobileOnly && isIOS && browserVersion === "15";
        !isIOSBrowserVersion15 && window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [wrapperRef]);

    return (
        <div className={Styles["container-guide"]} ref={wrapperRef}>
            {isLoading && (
                <div className={Styles["guide-loading"]}>
                    <Loader></Loader>
                </div>
            )}
            <iframe
                ref={wrapperIframeRef}
                key={uuidv4()}
                className={Styles["guide-iframe"]}
                src={srcPath}
                referrerPolicy="strict-origin-when-cross-origin"
                height={heightGuide}
                width={widthGuide}
                scrolling="auto"
                onLoad={() =>
                    setTimeout(() => {
                        hideSpinner();
                    }, 300)
                }
            />
        </div>
    );
};

export default React.memo(GameGuides);
