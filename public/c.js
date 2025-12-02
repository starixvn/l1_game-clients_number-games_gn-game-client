window.envConfig = {
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.12": "lumigame.com",
        "10.5.10.35": "lumigame.com",
        "10.5.10.66": "lumigame.com",
        "10.5.10.17": "lumigame.com",
    },
    proxy: {
        ssl: true,
        subDomain: "hd-proxy",
        path: "",
    },
    sentry: {
        dsn: "https://c65e9ef4f6c64d928f7b31ba355a44c2@sentry.lumigame.com/84",
        environment: "DEV",
    },
    enableSourceMap: true,
    subGuideDomain: "hd-guide",
    enableMsgpackParser: false,
    system: "GN",
    appType: 1,
    useTolgeeStatic: false,
    googleAnalyticId: "G-F4HZV0YQ73",
    hotdogScript: {
        baseUrl: "https://res.hotdog-gaming.com/ingame-lobby-client/index.min.js",
    },
};
