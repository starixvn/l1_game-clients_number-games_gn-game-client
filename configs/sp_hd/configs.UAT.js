window.envConfig = {
    proxy: {
        ssl: true,
        subDomain: "hduatproxy",
        path: "/uat",
    },
    sentry: {
        dsn: "http://aec64e89fed64d25a73926e63f2500f7@sentrysc-ovs.ops-kluat.gamora.prod/179",
        environment: "UAT",
    },
    enableSourceMap: false,
    subGuideDomain: "hduatguides",
    enableMsgpackParser: true,
    system: "HD",
    appType: 1,
    enableDebugLogs: true,
    socketGatewayPath: "gateway",
    useTolgeeStatic: true,
    googleAnalyticId: "G-F4HZV0YQ73",
    hotdogScript: {
        baseUrl: "https://res.hotdog-gaming.com/ingame-lobby-client/index.min.js",
    },
};
