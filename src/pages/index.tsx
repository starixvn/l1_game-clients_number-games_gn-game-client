import { memo, useContext } from "react";

import { useRouter } from "next/router";
import { URLContext } from "../_shared/react-contexts";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import SplashScreen from "../components/page-components/splash-screen";

const Home = () => {
    const { gameId, isDirectMode, token, language } = useContext(URLContext);
    console.log(`Home`, { gameId, isDirectMode, token, language });
    usePWAWoker();
    const router = useRouter();

    if (!router?.isReady || typeof window === "undefined") {
        return <div></div>;
    }

    return <SplashScreen />;
};

export default memo(Home);
