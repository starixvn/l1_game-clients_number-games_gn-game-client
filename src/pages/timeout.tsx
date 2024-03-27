import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCommonTranslate } from "../_shared/react-hooks/use-translator";
import ButtonReturnToURL from "../components/page-components/button-return-to-url";

const TimeOut = () => {
    const { t } = useCommonTranslate();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, [router.isReady]);

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
                <img src="/static/images/error-page/spaceman-timeout.png" alt="spaceman" />
            </div>
            <p className="errorOccurred-info mt-2">
                <p className="break">{t("message_session_timeout_break")} </p>
            </p>
            <ButtonReturnToURL />
        </div>
    );
};

export default TimeOut;
