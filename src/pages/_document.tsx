/* eslint-disable @next/next/no-sync-scripts */
import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { buildVersion } from "../_shared/constants";

// eslint-disable-next-line import/no-anonymous-default-export
export default class extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        return { ...initialProps };
    }

    render() {
        const configFileWithVersion = `./c.js?${buildVersion}`;

        return (
            <Html>
                <Head>
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <script type="text/javascript" src={configFileWithVersion}></script>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
