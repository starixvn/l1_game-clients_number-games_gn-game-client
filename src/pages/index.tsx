import { useContext } from "react";
import { URLContext, usePlayerContext } from "../_shared/react-contexts";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import { tolgee } from "../_shared/tolgee";
import Dashboard from "../components/page-components/dashboard";
import { SplashScreen } from "../components/page-components/splash-screen";

export function Home() {
    usePWAWoker();

    const { gameId, isDirectMode } = useContext(URLContext);
    const { session } = usePlayerContext();
    const tempFunction = () => console.log("TEMP FUNCTION");

    if (session) {
        return <Dashboard session={session} queryGame={gameId} setIsUm={tempFunction} directMode={isDirectMode} tolgee={tolgee} />;
    }

    return <SplashScreen />;
}

export default Home;
