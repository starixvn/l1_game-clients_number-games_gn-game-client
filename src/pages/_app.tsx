import "../assets/errors.scss";
import "../assets/main.scss";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";
import App, { AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, systemName, Themes } from "../_shared/constants";
import { Profiler, StrictMode } from "react";


class SabaNumberApp extends App<AppProps> {
    callback(self) {
        return (id, phase, actualTime, baseTime, startTime, commitTime) => {
            console.log(`
Id: "${id}", Phase: "${phase}", Actual Time:${actualTime}, Base Time: ${baseTime}, Start Time:${startTime}, Commit Time: ${commitTime}
`)
        }
    }

    render() {
        const { Component, pageProps } = this.props;

        return (
            <Profiler id="App" onRender={this.callback(this)}>
                <StrictMode>
                    <ThemeProvider defaultTheme={Themes.light}>
                        <AppTilte />
                        <Component {...pageProps} />
                    </ThemeProvider>
                </StrictMode>
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
