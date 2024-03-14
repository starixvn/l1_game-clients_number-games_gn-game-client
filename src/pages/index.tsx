import { useContext } from "react";
import { URLContext, usePlayerContext } from "../_shared/react-contexts";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import { tolgee } from "../_shared/tolgee";
import Dashboard from "../components/page-components/dashboard";
import { SplashScreen } from "../components/page-components/splash-screen";
import { useRouter } from "next/router";

export function Home() {
    usePWAWoker();

    const router = useRouter();
    const { gameId, isDirectMode } = useContext(URLContext);
    const { session } = usePlayerContext();
    const shouldRenderDashboard = session?.isAuthenticated && !session?.isUM;
    const toUMPage = () => router.push("");

    if (shouldRenderDashboard) {
        return <Dashboard session={session} queryGame={gameId} setIsUm={toUMPage} directMode={isDirectMode} tolgee={tolgee} />;
    }

    return <SplashScreen />;
}

export default Home;
