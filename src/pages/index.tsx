import { memo } from "react";

import { useRouter } from "next/router";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import SplashScreen from "../components/page-components/splash-screen";
import { useHotdogScript } from "../_shared/react-hooks/use-hotdog-script";
import { getAppSettings } from "../_shared/app-settings";

const Home = () => {
    const appSettings = getAppSettings();
    if (appSettings.hotdogScript && appSettings.hotdogScript.baseUrl) {
        useHotdogScript({
            baseUrl: appSettings.hotdogScript.baseUrl,
        });
    }
    usePWAWoker();
    const router = useRouter();

    if (!router?.isReady || typeof window === "undefined") {
        return <div></div>;
    }

    return <SplashScreen />;
};

export default memo(Home);
