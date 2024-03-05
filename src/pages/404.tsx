import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCommonTranslate } from "../_shared/react-hooks/use-translator";

const Custom404 = () => {
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
                <img className="number-4-left" src="/static/images/error-page/number-4.svg" alt="background" />
                <img className="number-4-right" src="/static/images/error-page/number-4.svg" alt="background" />
            </div>
            <div className="um-moving-comet">
                <img className="moving-comet comet-1" src="/static/images/error-page/comet-1.svg" alt="spaceman" />
                <img className="moving-comet comet-2" src="/static/images/error-page/comet-2.svg" alt="spaceman" />
                <img className="moving-comet comet-3" src="/static/images/error-page/comet-3.svg" alt="spaceman" />
                <img className="moving-comet comet-4" src="/static/images/error-page/comet-4.svg" alt="spaceman" />
            </div>
            <p className="errorOccurred-info">{t("message_error_occurred", { errorCode: 404 }).replaceTolgeeFormat()}</p>
        </div>
    );
};

export default Custom404;
