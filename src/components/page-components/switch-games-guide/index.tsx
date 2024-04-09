import React, { useEffect, useMemo, useState } from "react";
import { isMobileOnly } from "react-device-detect";

import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import Styles from "./switch-games-guide.module.scss";

const SWITCH_GAMES_GUIDE_PATH = "./static/images/switch-games-guide";

const GuideImages = ({ name }) => {
    return <img src={`${SWITCH_GAMES_GUIDE_PATH}/${name}.svg`} alt={name} />;
};

const SwitchGamesGuide: React.FC<{ allowSwipeable: boolean }> = (allowSwipeable) => {
    const { t } = useTranslator();
    const { session } = usePlayerContext();
    const [isEnabledSwitchGamesGuide, setIsEnabledSwitchGamesGuide] = useState(false);

    const imgGuide = <GuideImages name="img-guide" />;

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

    const handleDoNotShowAgain = () => {
        handleClose();
        StorageHelper.set(localStorageKeys.hideSwitchGameGuide, true);
    };

    const handleClose = () => {
        setIsEnabledSwitchGamesGuide(false);
        StorageHelper.set(localStorageKeys.currentSessionSwitchGameGuide, session?.ss);
    };

    return useMemo(() => {
        if (!isMobileOnly) {
            return <></>;
        }

        return (
            isEnabledSwitchGamesGuide &&
            allowSwipeable && (
                <div className={`${Styles["guide-container"]}`}>
                    <div className={Styles["guide-content"]}>
                        <div className={Styles["guide-images"]}>{imgGuide}</div>

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
