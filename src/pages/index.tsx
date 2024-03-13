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
import { URLContext, URLContextProvider, initialURLContextData } from "../_shared/react-contexts/url-context";

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

    usePWAWoker();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const lang = urlParams.get("lang");
        const game = urlParams.get("gameId");

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
                console.log({ ref });
                ref && setIsDirectMode(validDirectModeRefs.includes(ref?.toString()));
                setGameId(game);
                setLoading(false);

                window.history.pushState(null, "", location.href.split("?")[0]);
            } else {
                router.push("timeout");
            }
        };

        const userSession = StorageHelper.get<SSOResponse>(localStorageKeys.session);
        const locale = languageMapper[(lang as string) ?? userSession?.language] ?? router.locale;
        setLanguage(locale);
        tolgee.changeLanguage(locale);
        signIn();
    }, []);

    if (isUM) {
        return <UMPage locale={language} />;
    }

    if (loading) {
        return <SplashScreen locale={language}></SplashScreen>;
    }

    console.log({ isDirectMode });
    return <URLContext.Provider value={initialURLContextData}>
        <Dashboard session={session} queryGame={+gameId} setIsUm={setIsUm} directMode={true} tolgee={tolgee} />
    </URLContext.Provider  >;
}

export default Home;
