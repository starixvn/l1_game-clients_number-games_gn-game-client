window.envConfig = {
    subSocketGatewayDomain: "l1-gw",
    serverDomainMapper: {
        localhost: "lumigame.com",
    },
    proxy: {
        ssl: true,
        subDomain: "l1-proxy",
        path: "",
    },
    sentry: {
        dsn: "https://c8f93631be824a14b9f114f53e3a2bfc@sentry.lumigame.com/3",
        environment: "LOCAL_1",
    },
    offeredGames: [2, 22, 9, 1, 4, 24, 8, 3, 7, 27, 10, 35],
    enableSourceMap: true,
    subGuideDomain: "l1-guide",
    enableMsgpackParser: false,
    system: "GN",
    appType: 2,
};
