import "../_shared/helpers/string-helper";
import "../styles/errors.scss";
import "../styles/main.scss";

import { TolgeeProvider } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppProps } from "next/app";
import Head from "next/head";

import { buildVersion, systemName, Themes } from "../_shared/constants";
import { tolgee } from "../_shared/tolgee";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "../components/page-components/google-analytics";

class SabaNumberApp extends App<AppProps> {
    render() {
        const { Component, pageProps } = this.props;

        return (
            <ThemeProvider defaultTheme={Themes.light}>
                <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
                    <AppTilte />
                    <Component {...pageProps} />
                    <GoogleAnalytic />
                </TolgeeProvider>
            </ThemeProvider>
        );
    }
}

export const AppTilte = () => {
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <title>SABA xD</title>
            <link rel="shortcut icon" href={`/favicon-${systemName}.ico?v=${buildVersion}`} />
        </Head>
    );
};

export default SabaNumberApp;
