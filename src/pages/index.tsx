import { memo, useContext } from "react";

import { useRouter } from "next/router";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import SplashScreen from "../components/page-components/splash-screen";
import { URLContext } from "../_shared/react-contexts";

const Home = () => {
    const { gameId, isDirectMode, token, language } = useContext(URLContext);
    console.log(`Home`, { gameId, isDirectMode, token, language });
    usePWAWoker();
    const router = useRouter();

    if (!router?.isReady) {
        return <div></div>;
    }


    return <SplashScreen />;
};

export default memo(Home);
