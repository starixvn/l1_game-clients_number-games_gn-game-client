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
        subDomain: "gn-proxy",
        path: "",
    },
    sentry: {
        dsn: "https://a900ee5b5838ff2673801cc478c30855@sentry-k8s.lumigame.com/28",
        environment: "DEV",
    },
    enableSourceMap: true,
    subGuideDomain: "gn-guide",
    enableMsgpackParser: false,
    system: "GN",
    appType: 1,
    enableDebugLogs: true,
    socketGatewayPath: "gateway",
    useTolgeeStatic: false,
    googleAnalyticId: "G-F4HZV0YQ73",
};
