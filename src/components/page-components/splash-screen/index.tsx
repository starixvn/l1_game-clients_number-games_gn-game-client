import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { useRouter } from "next/router";
import { ReactNode, useContext, useEffect } from "react";

import { getAppSettings } from "../../../_shared/app-settings";
import { languageMapper } from "../../../_shared/constants";
import { AnalyticsHelper, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import { URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { setSentryUser } from "../../../_shared/sentry";
import { sso, verifySession } from "../../../services/auth-service";
import UMPage from "../um-page";
import Styles from "./splash-screen.module.scss";

export type SplashScreenProps = WithRouterProps;

export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

export async function customStartup(token, language, router, player): Promise<void> {
    const session = await (token ? sso(token, getAppSettings().appType) : verifySession());
    const locale = languageMapper[session?.language] || languageMapper[language];
    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);

    player.locale = locale;

    if (isTimeout) {
        router.push("timeout");

        return;
    }

    if (session?.isUM) {
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
        player.session = session;
    }

    if (session?.isAuthenticated) {
        setSentryUser(session);
        player.session = session;
        AnalyticsHelper.setUser(session.username);
    }

    router.push("");
}

export function onStartupError(error: Error): void {
    console.error(error);

    Sentry.captureException(error);

    globalThis.location.pathname = "timeout";
}

export default function SplashScreen(): ReactNode {
    const { token, language } = useContext(URLContext);
    const router = useRouter();
    const player = usePlayerContext();
    const { t } = useTranslator();

    useEffect(() => {
        customStartup(token, language, router, player).catch(onStartupError);
    }, []);

    const { session } = usePlayerContext();

    if (session?.isUM) {
        return <UMPage />;
    } else {
        return (
            <div className={`${Styles.page}`}>
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}></div>
                    <div className={Styles["slogan"]}>{t("SabaNumber.splashscreen_slogan")}</div>
                </div>

                <div className={Styles["loading"]}>
                    <div className={Styles["progress"]}>
                        <div className={Styles["progress-bar"]}></div>
                    </div>
                    <p className={Styles["text-first-download"]}>{t("Common.message_download_first_visit")}</p>
                </div>
            </div>
        );
    }
}
