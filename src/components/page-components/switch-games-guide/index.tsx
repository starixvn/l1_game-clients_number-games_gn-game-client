import React, { useEffect, useMemo, useState } from "react";
import { isMobileOnly } from "react-device-detect";

import { buildVersion } from "../../../_shared/constants";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useClickSound } from "../../../_shared/react-hooks/use-sound";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import Styles from "./switch-games-guide.module.scss";

const SWITCH_GAMES_GUIDE_PATH = "./static/images/switch-games-guide";

const GuideImages = ({ name }) => {
    return <img className={Styles[name]} src={`${SWITCH_GAMES_GUIDE_PATH}/${name}.svg?${buildVersion}`} alt={name} />;
};

const SwitchGamesGuide: React.FC = () => {
    const { t } = useTranslator();
    const { session } = usePlayerContext();
    const clickSound = useClickSound();

    const [isEnabledSwitchGamesGuide, setIsEnabledSwitchGamesGuide] = useState(false);

    const arrowLeftRight = <GuideImages name="arrow-left-right" />;
    const hand = <GuideImages name="hand" />;

    useEffect(() => {
        const isStorageHideGuide = StorageHelper.get(localStorageKeys.hideSwitchGameGuide) ?? false;
        const currentSessionSwitchGameGuide = StorageHelper.get(localStorageKeys.currentSessionSwitchGameGuide) ?? "";

        if (isStorageHideGuide) {
            return;
        }

        if (currentSessionSwitchGameGuide !== session?.ss) {
            setIsEnabledSwitchGamesGuide(true);
        }
    }, []);

    useEffect(() => {
        if (isEnabledSwitchGamesGuide) {
            document.body.classList.add("no-scroll");
            isMobileOnly && document.documentElement.classList.add("no-scroll-html");
        }

        return () => {
            if (isEnabledSwitchGamesGuide) {
                document.body.classList.remove("no-scroll");
                isMobileOnly && document.documentElement.classList.remove("no-scroll-html");
            }
        };
    }, [isEnabledSwitchGamesGuide]);

    const handleDoNotShowAgain = () => {
        clickSound()
        handleClose();
        StorageHelper.set(localStorageKeys.hideSwitchGameGuide, true);
    };

    const handleClose = () => {
        clickSound()
        setIsEnabledSwitchGamesGuide(false);
        StorageHelper.set(localStorageKeys.currentSessionSwitchGameGuide, session?.ss);
    };

    return useMemo(() => {
        if (!isMobileOnly) {
            return <></>;
        }

        return (
            isEnabledSwitchGamesGuide && (
                <div className={`${Styles["guide-container"]}`}>
                    <div className={Styles["guide-content"]}>
                        <div className={Styles["guide-images"]}>
                            {arrowLeftRight}
                            {hand}
                        </div>

                        <div className={Styles["guide-hint"]}>{t(`${ResourceTypes.SABA_NUMBER}.switch_game_hint`)}</div>

                        <div className={Styles["button-group"]}>
                            <button className="btn-grey" onClick={handleClose}>
                                {t(`${ResourceTypes.SABA_NUMBER}.button_close`)}
                            </button>
                            <button className="btn-orange" onClick={handleDoNotShowAgain}>
                                {t(`${ResourceTypes.SABA_NUMBER}.button_donot_show`)}
                            </button>
                        </div>
                    </div>
                </div>
            )
        );
    }, [isEnabledSwitchGamesGuide]);
};

export default SwitchGamesGuide;
