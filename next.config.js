const gameSettings = require("./game-settings.json");
const configs = require("./configs.json");
const { v4: uuidv4 } = require("uuid");
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const basePath = "";
const appSettings = {
    ...configs,
    gameSettings,
};

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withSentryConfig(
    withBundleAnalyzer({
        publicRuntimeConfig: appSettings,
        productionBrowserSourceMaps: configs.enableSourceMap,
        sentry: {
            disableServerWebpackPlugin: true,
            disableClientWebpackPlugin: true,
            hideSourceMaps: true,
        },
        generateBuildId: async () => uuidv4(),
        webpack: (config, options) => {
            config.module.rules.push({
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2|mp3)$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 100000,
                    },
                },
            });

            return config;
        },
        basePath,
        env: {
            buildVersion: uuidv4(),
            REACT_APP_TOLGEE_API_URL: "https://tolgee.sabagame.com/",
            REACT_APP_TOLGEE_API_KEY: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
        },
        async rewrites() {
            return [
                {
                    source: "/health",
                    destination: "/api/health",
                },
            ];
        },
        async headers() {
            return [
                {
                    source: "/:all*(js|png|json|mp3)",
                    locale: false,
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "public, max-age=31536000, must-revalidate",
                        },
                    ],
                },
            ];
        },
    })
);

module.exports = nextConfig;
