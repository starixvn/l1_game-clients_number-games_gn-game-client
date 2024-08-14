import "../_shared/helpers/string-helper";
import "../styles/errors.scss";
import "../styles/main.scss";

import { TolgeeProvider, useTolgeeSSR } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppContext, AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, languageMapper, Themes } from "../_shared/constants";
import { useURLContext } from "../_shared/react-contexts";
import { tolgee } from "../_shared/tolgee";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "../components/page-components/google-analytics";

const SabaNumberApp = ({ Component, pageProps, language }: AppProps & { language: string }) => {
    const ssrTolgee = useTolgeeSSR(tolgee, language);

    return (
        <ThemeProvider defaultTheme={Themes.light} forcedTheme={Themes.light}>
            <TolgeeProvider tolgee={ssrTolgee} fallback={<LoadingSpinner />}>
                <AppTittle />
                <Component {...pageProps} />
                <GoogleAnalytic />
            </TolgeeProvider>
        </ThemeProvider>
    );
};

export const AppTittle = () => {
    const { isDirectMode } = useURLContext();
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <title>{isDirectMode ? "SABA Play" : "SABA xD"}</title>
            <link rel="shortcut icon" type="image/x-icon" href={`/favicons/favicon.ico?v=${buildVersion}`} sizes="any" />
            <link rel="icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="16x16" />
            <link rel="apple-touch-icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="any" />{" "}
        </Head>
    );
};
SabaNumberApp.getInitialProps = async (context: AppContext) => {
    const initialProps = await App.getInitialProps(context);
    const { lang, token } = context.router.query;
    return {
        ...initialProps,
        language: token ? languageMapper[lang as string] || "en" : "en",
    };
};

export default SabaNumberApp;
