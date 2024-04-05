import * as Sentry from "@sentry/react";
import { WithRouterProps } from "next/dist/client/with-router";
import { useRouter } from "next/router";
import { ReactNode, useContext, useEffect } from "react";
import { getAppSettings } from "../../../_shared/app-settings";
import { buildVersion, languageMapper, locales, systemName } from "../../../_shared/constants";
import { AnalyticsHelper, StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { setSentryUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
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

    await tolgee.changeLanguage(locale);

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

export function SplashScreen(): ReactNode {
    const { token, language } = useContext(URLContext);
    const router = useRouter();
    const player = usePlayerContext();
    useEffect(() => {
        customStartup(token, language, router, player).catch(onStartupError);
    }, []);

    const { session, locale } = usePlayerContext();

    if (session?.isUM) {
        return <UMPage />;
    } else {
        return (
            <div className={`${Styles.page}`}>
                <img
                    src={`/static/images/splash-screen/${locale}/logo-${systemName}.svg?${buildVersion}`}
                    className={Styles["logo"]}
                    width="274"
                    height="96"
                    alt="Logo"
                />
                {locale === locales.vi && (
                    <img
                        src={`/static/images/splash-screen/${locale}/info.svg`}
                        className={Styles["info"]}
                        width="100"
                        height="26"
                        alt="Info"
                    />
                )}
            </div>
        );
    }
}
