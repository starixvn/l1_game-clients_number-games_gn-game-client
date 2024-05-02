import "../_shared/helpers/string-helper";
import "../styles/errors.scss";
import "../styles/main.scss";

import { TolgeeProvider, useTolgeeSSR } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import { AppProps } from "next/app";
import Head from "next/head";

import { buildVersion, languageMapper, Themes } from "../_shared/constants";
import { tolgee } from "../_shared/tolgee";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "../components/page-components/google-analytics";

const SabaNumberApp = ({ Component, pageProps, language }: AppProps & { language: string }) => {
    const ssrTolgee = useTolgeeSSR(tolgee, language);
    return (
        <ThemeProvider defaultTheme={Themes.light} forcedTheme={Themes.light}>
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
            <link rel="shortcut icon" type="image/x-icon" href={`/favicons/favicon.ico?v=${buildVersion}`} sizes="any" />
            <link rel="icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="16x16" />
            <link rel="apple-touch-icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="any" />
        </Head>
    );
};
SabaNumberApp.getInitialProps = async ({ router }) => {
    const { lang, token } = router.query;
    return token ? { language: languageMapper[lang] || "en" } : { language: tolgee.getLanguage() };
};

export default SabaNumberApp;
