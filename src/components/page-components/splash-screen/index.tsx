import { WithRouterProps } from "next/dist/client/with-router";
import { useRouter } from "next/router";
import { ReactNode, useContext } from "react";
import { getAppSettings } from "../../../_shared/app-settings";
import { buildVersion, languageMapper, locales, systemName } from "../../../_shared/constants";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { setUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
import { sso, verifySession } from "../../../services/auth-service";
import UMPage from "../um-page";
import Styles from "./splash-screen.module.scss";
import * as Sentry from "@sentry/nextjs";

export type SplashScreenProps = WithRouterProps;

export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

export async function useCustomStartup(): Promise<void> {
    const { token, language } = useContext(URLContext);
    const router = useRouter();
    const player = usePlayerContext();
    const session = await (token ? sso(token, getAppSettings().appType) : verifySession());
    const locale = languageMapper[session?.language] || languageMapper[language];
    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);

    tolgee.changeLanguage(locale);
    player.locale = locale;

    if (isTimeout) {
        router.push("timeout");

        return;
    }

    if (session?.isUM) {
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
    }

    if (session?.isAuthenticated) {
        setUser(session);

        player.session = session;
    }

    router.push("");
}

export function useStartupErrorCatcher(error: Error): void {
    Sentry.captureException(error);

    const router = useRouter();

    router.push("timeout");
}

export function SplashScreen(): ReactNode {
    useCustomStartup().catch(useStartupErrorCatcher);

    const { session, locale } = usePlayerContext();

    if (session?.isUM) {
        return <UMPage locale={locale} />;
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
