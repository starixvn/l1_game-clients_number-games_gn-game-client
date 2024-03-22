import "@testing-library/jest-dom";

jest.mock("next/config", () => () => ({
    publicRuntimeConfig: {
        proxy: {
            ssl: true,
            subDomain: "gn-proxy",
            path: "",
        },
        sentry: {
            dsn: "",
            environment: "",
            tracesSampleRate: 1,
        },
        enableSourceMap: true,
        subGuideDomain: "gn-guide",
        enableMsgpackParser: false,
        system: "GN",
        appType: 1,
        useTolgeeStatic: false,
        socketGatewayPath: "gateway",
        gameSettings: {
            "1001": {
                id: 1001,
                gameName: "BacBall",
                socketInfo: {
                    namespace: "bacball",
                    path: "bacball",
                },
                durations: {
                    wholeRound: 122,
                    wholeTurn: 30,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 10,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                    switchRoundAnimation: 2,
                },
                totalTurns: 4,
            },
        },
    },
}));
