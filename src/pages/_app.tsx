import "../_shared/helpers/string-helper";
import "../styles/errors.scss";
import "../styles/main.scss";

import { TolgeeProvider, useTolgeeSSR } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import { AppProps } from "next/app";
import Head from "next/head";

import { buildVersion, systemName, Themes } from "../_shared/constants";
import { tolgee } from "../_shared/tolgee";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "../components/page-components/google-analytics";

const SabaNumberApp = ({ Component, pageProps }: AppProps) => {
    const ssrTolgee = useTolgeeSSR(tolgee, "en");
    return (
        <ThemeProvider defaultTheme={Themes.light}>
            <TolgeeProvider tolgee={ssrTolgee} fallback={<LoadingSpinner />}>
                <AppTilte />
                <Component {...pageProps} />
                <GoogleAnalytic />
            </TolgeeProvider>
        </ThemeProvider>
    );
};

export const AppTilte = () => {
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <title>SABA xD</title>
            <link rel="shortcut icon" href={`/favicon-${systemName}.ico?v=${buildVersion}`} />
        </Head>
    );
};

export default SabaNumberApp;
