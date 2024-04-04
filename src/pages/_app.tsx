"use-client";
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
import { isMobile } from "react-device-detect";

class SabaNumberApp extends App<AppProps> {
    private timeoutResize: NodeJS.Timeout;
    componentDidMount(): void {
        window.addEventListener("resize", this.deviceOrientation.bind(this));
        this.deviceOrientation();
    }
    componentWillUnmount(): void {
        this.timeoutResize && clearTimeout(this.timeoutResize);
        window.removeEventListener("resize", this.deviceOrientation.bind(this));
    }

    deviceOrientation() {
        if (!isMobile) {
            return;
        }
        this.timeoutResize && clearTimeout(this.timeoutResize);
        this.timeoutResize = setTimeout(() => {
            const body = document.body;
            switch (screen.orientation.type) {
                case "landscape-primary":
                    body.className = "";
                    body.classList.add("landscape");
                    body.classList.add("rotation90");
                    break;
                case "landscape-secondary":
                    body.className = "";
                    body.classList.add("landscape");
                    body.classList.add("rotation-90");
                    break;
                default:
                    body.className = "";
                    break;
            }
        }, 100);
    }
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
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <title>New Number Game</title>
            <link rel="shortcut icon" href={`/favicon-${systemName}.ico?v=${buildVersion}`} />
        </Head>
    );
};

export default SabaNumberApp;
