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
        dsn: "https://c8f93631be824a14b9f114f53e3a2bfc@sentry.lumigame.com/3",
        environment: "LOCAL_1",
    },
    offeredGames: [1001],
    enableSourceMap: true,
    subGuideDomain: "gn-guide",
    enableMsgpackParser: false,
    system: "GN",
    appType: 1,
    useTolgeeStatic: false,
};
