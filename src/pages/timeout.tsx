import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCommonTranslate } from "../_shared/react-hooks/use-translator";
import ButtonReturnToURL from "../components/page-components/button-return-to-url";
import { clearSession } from "../services/auth-service";
import BackgroundComet from "../components/page-components/background-error";

const TimeOut = () => {
    const { t } = useCommonTranslate();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
        clearSession();
    }, [router.isReady]);

    if (isLoading) {
        return <></>;
    }
    return (
        <div className="error-page">
            <div className="um-background">
                <div className="star-bg" />
                <div className="planet-center" />
            </div>
            <BackgroundComet />
            <div className="timeout-spaceman" />
            <p className="errorOccurred-info mt-2 break">{t("message_session_timeout_break")}</p>
            <ButtonReturnToURL />
        </div>
    );
};

export default TimeOut;
