import "../assets/errors.scss";
import "../assets/main.scss";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";
import App, { AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, systemName, Themes } from "../common/constants";
import { Profiler } from "react";


class SabaNumberApp extends App<AppProps> {
    callback(self) {
        return (id, phase, actualTime, baseTime, startTime, commitTime) => {

        }
    }

    render() {
        const { Component, pageProps } = this.props;

        return (
            <Profiler id="App" onRender={this.callback(this)}>
                <ThemeProvider defaultTheme={Themes.light}>
                    <AppTilte />
                    <Component {...pageProps} />
                </ThemeProvider>
            </Profiler>
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
