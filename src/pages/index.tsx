import { memo, useContext, useEffect } from "react";

import { useRouter } from "next/router";
import { URLContext } from "../_shared/react-contexts";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import SplashScreen from "../components/page-components/splash-screen";

const Home = () => {
    useContext(URLContext);
    // usePWAWoker();
    const router = useRouter();

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/service-worker.js')
                .then((registration) => console.log('scope is: ', registration.scope));
        }
        else {
            console.log('service-worker is not supported');
        }
    }, []);

    if (!router?.isReady || typeof window === "undefined") {
        return <div></div>;
    }

    return <SplashScreen />;
};

export default memo(Home);
