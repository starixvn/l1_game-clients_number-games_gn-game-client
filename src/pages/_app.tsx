import { TolgeeProvider } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, systemName, Themes } from "../_shared/constants";
import "../_shared/helpers/string-helper";
import { tolgee } from "../_shared/tolgee";
import Loading from "../components/page-components/loading";
import "../styles/errors.scss";
import "../styles/main.scss";

class SabaNumberApp extends App<AppProps> {
    render() {
        const { Component, pageProps } = this.props;

        return (
            <ThemeProvider defaultTheme={Themes.light}>
                <TolgeeProvider tolgee={tolgee} fallback={<Loading />}>
                    <AppTilte />
                    <Component {...pageProps} />
                </TolgeeProvider>
            </ThemeProvider>
        );
    }
}

export const AppTilte = () => {
    return (
        <Head>
            <title>New Number Game</title>
            <link rel="shortcut icon" href={`/favicon-${systemName}.ico?v=${buildVersion}`} />
        </Head>
    );
};

export default SabaNumberApp;
