import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { UMInfo } from "sc-user-service-client/dist/auth";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers/storage-helper";
import { convertToGMT8, formatDate } from "../../../_shared/helpers/time-helper";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "../../../_shared/resources";

const UMPage: React.FC<{ locale: string }> = ({ locale }) => {
    const router = useRouter();
    const { t } = useTranslate([ResourceTypes.COMMON, ResourceTypes.SABANUMBER]);
    const [startTime, setStartTime] = useState<string>(null);
    const [endTime, setEndTime] = useState<string>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (router.isReady) {
            const template = "hh:mm dd/MM/yyyy";
            const umInfo = StorageHelper.get<UMInfo>(localStorageKeys.umInfo);

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
                <img className="star-bg" src="/static/images/error-page/star-bg.png" alt="background" width={344} />
                <img src="/static/images/error-page/planet-center.png" alt="background" width={432} />
            </div>
            <div className="um-moving-comet">
                <img className="moving-comet comet-1" src="/static/images/error-page/comet-1.svg" alt="spaceman" />
                <img className="moving-comet comet-2" src="/static/images/error-page/comet-2.svg" alt="spaceman" />
                <img className="moving-comet comet-3" src="/static/images/error-page/comet-3.svg" alt="spaceman" />
                <img className="moving-comet comet-4" src="/static/images/error-page/comet-4.svg" alt="spaceman" />
                <img className="moving-planet planet-1" src="/static/images/error-page/planet-1.svg" alt="spaceman" />
                <img className="moving-planet planet-2" src="/static/images/error-page/planet-2.svg" alt="spaceman" />
                <img className="moving-planet planet-3" src="/static/images/error-page/planet-3.svg" alt="spaceman" />
            </div>
            <div className="um-spaceman">
                <img src="/static/images/error-page/um-spaceman.png" alt="spaceman" />
            </div>
            <p className="um-title">
                {t("message_sys_maintenance")} <br /> {t("um_title")}
            </p>
            <p className="highlight">{t("um_content_start")}</p>
            <p className="highlight txt-bold">{t("um_time", { startTime, endTime }).replaceTolgeeFormat()}</p>
            <p>{t("under_maintenance_suggest")}</p>
            <button>{t("back")}</button>
        </div>
    );
};

export default UMPage;
