import "../styles/errors.scss";
import "../styles/main.scss";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";
import App, { AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, systemName, Themes } from "../_shared/constants";

class SabaNumberApp extends App<AppProps> {
    render() {
        const { Component, pageProps } = this.props;

        return (
            <ThemeProvider defaultTheme={Themes.light}>
                <AppTilte />
                <Component {...pageProps} />
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

export default appWithTranslation(SabaNumberApp);
