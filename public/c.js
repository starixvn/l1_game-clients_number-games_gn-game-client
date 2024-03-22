window.envConfig = {
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.31": "lumigame.com",
    },
    proxy: {
        ssl: true,
        subDomain: "gn-proxy",
        path: "",
    },
    sentry: {
        dsn: "https://c65e9ef4f6c64d928f7b31ba355a44c2@sentry.lumigame.com/84",
        environment: "LOCAL",
    },
    offeredGames: [1001],
    enableSourceMap: true,
    subGuideDomain: "gn-guide",
    enableMsgpackParser: false,
    system: "GN",
    appType: 1,
    useTolgeeStatic: false,
};
