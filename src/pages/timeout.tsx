import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

const TimeOut = () => {
    const { t } = useTranslation("common");
    const router = useRouter();
    const { theme } = useTheme();
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
                <p>{t("sessionTimeout-1")} </p>
                <p>{t("sessionTimeout-2")}</p>
            </p>
            <button>Back</button>
        </div>
    );
};
export const getStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
};

export default TimeOut;
