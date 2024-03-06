const gameSettings = require("./game-settings.json");
const configs = require("./configs.json");
const { v4: uuidv4 } = require("uuid");
const { withSentryConfig } = require("@sentry/nextjs");

const basePath = "";
const appSettings = {
    ...configs,
    gameSettings,
};

module.exports = withSentryConfig({
    publicRuntimeConfig: appSettings,
    productionBrowserSourceMaps: configs.enableSourceMap,
    sentry: {
        disableServerWebpackPlugin: true,
        disableClientWebpackPlugin: true,
        hideSourceMaps: true,
    },
    generateBuildId: async () => {
        return uuidv4();
    },
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
});
