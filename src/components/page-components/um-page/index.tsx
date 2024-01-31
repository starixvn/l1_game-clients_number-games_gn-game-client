import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { UMInfo } from "sc-user-service-client/dist/auth";

import * as LocalStorageManager from "../../../_shared/local-storage";
import { convertToGMT8, formatDate } from "../../../_shared/helpers/time-helper";

const UMPage: React.FC<{ locale: string }> = ({ locale }) => {
    const router = useRouter();
    const { t } = useTranslation(["um", "messages"]);
    const [startTime, setStartTime] = useState<string>(null);
    const [endTime, setEndTime] = useState<string>(null);
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (router.isReady) {
            const template = "hh:mm dd/MM/yyyy";
            const umInfo = LocalStorageManager.getLocalStorageItem<UMInfo>(LocalStorageManager.localStorageKeys.umInfo);

            if (umInfo) {
                setStartTime(formatDate(convertToGMT8(new Date(umInfo.startTime)), template));
                setEndTime(formatDate(convertToGMT8(new Date(umInfo.endTime)), template));
            }

            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return <></>;
    }
    return (
        <div className="error-page">
            <div className="um-background">
                <img className="star-bg" src="/static/images/um/star-bg.png" alt="background" width={344} />
                <img src="/static/images/um/planet-center.png" alt="background" width={432} />
            </div>
            <div className="um-moving-comet">
                <img className="moving-comet comet-1" src="/static/images/um/comet-1.svg" alt="spaceman" />
                <img className="moving-comet comet-2" src="/static/images/um/comet-2.svg" alt="spaceman" />
                <img className="moving-comet comet-3" src="/static/images/um/comet-3.svg" alt="spaceman" />
                <img className="moving-comet comet-4" src="/static/images/um/comet-4.svg" alt="spaceman" />
                <img className="moving-planet planet-1" src="/static/images/um/planet-1.svg" alt="spaceman" />
                <img className="moving-planet planet-2" src="/static/images/um/planet-2.svg" alt="spaceman" />
                <img className="moving-planet planet-3" src="/static/images/um/planet-3.svg" alt="spaceman" />
            </div>
            <div className="um-spaceman">
                <img src="/static/images/um/um-spaceman.png" alt="spaceman" />
            </div>
            <p className="um-title">
                {t("messages:sysMaintenance")} <br /> {t("um:umTitleFirst")}
            </p>
            <p className="highlight">{t("um:umContentStart")}</p>
            <p className="highlight txt-bold">{t("um:umContent").toString().replace("{0}", startTime).replace("{1}", endTime)}</p>
            <p>{t("um:umNotice")}</p>
        </div>
    );
};

export default UMPage;
