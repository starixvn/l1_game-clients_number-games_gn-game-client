import dynamic from "next/dynamic";
import { useContext, useState } from "react";
import { URLContext, usePlayerContext } from "../_shared/react-contexts";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import { tolgee } from "../_shared/tolgee";
import Dashboard from "../components/page-components/dashboard";
import SplashScreen from "../components/page-components/splash-screen";

const UMPage = dynamic(() => import("../components/page-components/um-page"));

export function Home() {
    usePWAWoker();
    const { gameId, isDirectMode } = useContext(URLContext);
    const { session } = usePlayerContext();
    const shouldRenderDashboard = session?.isAuthenticated && !session?.isUM;
    const [isUm, setIsUm] = useState(session?.isUM);
    const toUMPage = (value) => setIsUm(value);

    if (isUm) {
        return <UMPage />;
    }

    if (shouldRenderDashboard) {
        return <Dashboard session={session} queryGame={gameId} setIsUm={toUMPage} directMode={isDirectMode} tolgee={tolgee} />;
    }

    return <SplashScreen />;
}

export default Home;
