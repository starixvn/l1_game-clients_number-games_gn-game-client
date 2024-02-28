import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../_shared/app-settings";
import { languageMapper } from "../_shared/constants";
import { StorageHelper, localStorageKeys } from "../_shared/helpers/storage-helper";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import * as Sentry from "../_shared/sentry";
import { tolgee } from "../_shared/tolgee";
import Dashboard from "../components/page-components/dashboard";
import SplashScreen from "../components/page-components/splash-screen";
import UMPage from "../components/page-components/um-page";
import { sso, verifySession } from "../services/auth-service";

const getUserSession = (token: string) => (token ? sso(token, getAppSettings().appType) : verifySession());
const validDirectModeRefs = ["m_direct", "d_direct"];

function Home() {
    const router = useRouter();
    const [isUM, setIsUm] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [session, setSession] = useState<SSOResponse>(null);
    const [language, setLanguage] = useState<string>(null);
    const [isDirectMode, setIsDirectMode] = useState<boolean>(null);
    const [gameId, setGameId] = useState(null);

    const { i18n } = useTranslation();

    usePWAWoker();
    useEffect(() => {
        const { token, lang, gameId } = router.query;

        const signIn = async () => {
            const userSession = await getUserSession(token as string);

            if (!userSession) {
                router.push("timeout");
                return;
            }

            if (userSession.isUM) {
                StorageHelper.set(localStorageKeys.umInfo, userSession.umInfo);
                setTimeout(() => {
                    setIsUm(true);
                }, 500);

                return;
            }

            if (userSession.isAuthenticated) {
                setSession(userSession);
                Sentry.setUser(userSession);
                const { ref } = router.query;
                ref && setIsDirectMode(validDirectModeRefs.includes(ref?.toString()));
                setGameId(gameId);
                setLoading(false);

                window.history.pushState(null, "", location.href.split("?")[0]);
            } else {
                router.push("timeout");
            }
        };

        if (router.isReady) {
            const userSession = StorageHelper.get<SSOResponse>(localStorageKeys.session);
            const locale = languageMapper[(lang as string) ?? userSession?.language] ?? router.locale;
            setLanguage(locale);
            i18n.changeLanguage(locale);
            tolgee.changeLanguage(locale);

            signIn();
        }
    }, [router.isReady]);

    if (isUM) {
        return <UMPage locale={language} />;
    }

    if (loading) {
        return <SplashScreen locale={language}></SplashScreen>;
    }

    return <Dashboard session={session} queryGame={+gameId} setIsUm={setIsUm} directMode={isDirectMode} />;
}

export const getStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common", "register", "bethistory", "messages", "um"])),
        },
    };
};

export default Home;
