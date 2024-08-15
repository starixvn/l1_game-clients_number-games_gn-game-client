import { delay, http, HttpResponse } from "msw";

/** A collection of handlers to be used by default for all tests. */
export default [
    http.get("/api/users", async () => {
        await delay(500);
        return HttpResponse.json(
            [
                {
                    id: "bcff5c0e-10b6-407b-94d1-90d741363885",
                    firstName: "Rhydian",
                    lastName: "Greig",
                },
                {
                    id: "b44e89e4-3254-415e-b14a-441166616b20",
                    firstName: "Alessandro",
                    lastName: "Metcalfe",
                },
                {
                    id: "6e369942-6b5d-4159-9b39-729646549183",
                    firstName: "Erika",
                    lastName: "Richards",
                },
            ],
            {
                status: 200,
            }
        );
    }),
    http.get(`/user/auth/sso?token=x&system=1`, () => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json({
            isAuthenticated: true,
            umInfo: null,
            username: "username",
            language: "vi-VN",
            ss: "ss",
            system: 1,
            memberName: "username",
            rate: 1000,
            isUM: false,
        });
    }),
    http.post(`/user/auth/authorize`, ({ request, params }) => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json({
            authorized: true,
            user: {
                name: "Conall",
                UID: 1234,
                avatarId: 83,
                currency: "$US",
                isSignedInSM: false,
                red: 2000,
                scoins: 0,
                settings: {
                    theme: "",
                },
                offerGames: [
                    {
                        gameId: 1001,
                        minBet: 1,
                        maxBet: 40000,
                        maxBetPerChoices: {
                            player: 40000,
                            banker: 40000,
                            tie: 2000,
                        },
                    },
                    {
                        gameId: 1003,
                        minBet: 10,
                        maxBet: 10000,
                        maxBetPerChoices: {
                            over: 10000,
                            under: 10000,
                            odd: 10000,
                            even: 10000,
                        },
                    },
                    {
                        gameId: 1004,
                        minBet: 10,
                        maxBet: 20000,
                        maxBetPerChoices: {
                            over: 10000,
                            under: 20000,
                            odd: 10000,
                            even: 20000,
                        },
                    },
                    {
                        gameId: 1005,
                        minBet: 1,
                        maxBet: 2000000,
                        maxBetPerChoices: {
                            odd: 200000,
                            even: 200000,
                            red2: 20000,
                            red3: 20000,
                            red4: 5000,
                            blue3: 20000,
                            blue4: 5000,
                        },
                    },
                    {
                        gameId: 1006,
                        minBet: 10,
                        maxBet: 40000,
                        maxBetPerChoices: {
                            over: 40000,
                            under: 40000,
                            red2: 40000,
                            red3: 10000,
                            blue2: 40000,
                            blue3: 10000,
                        },
                    },
                    {
                        gameId: 1007,
                        minBet: 1,
                        maxBet: 20000,
                        maxBetPerChoices: {
                            big: 40000,
                            small: 40000,
                            specific1: 40000,
                            specific2: 40000,
                            specific3: 40000,
                            specific4: 40000,
                            specific5: 40000,
                            specific6: 40000,
                        },
                    },
                ],
                enabledGameIds: [1001, 1003, 1004, 1005, 1006, 1007],
                fractionalOddsFormat: true,
                isDisplayPlayerCurrency: true,
                disableJackpotGames: true,
                rate: 1000,
                multiplier: 1000,
                currencyCode: "VND",
            },
            umInfo: null,
            isUM: false,
        });
    }),
    http.post(`/user/lobby/configs`, ({ request, params }) => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json({
            isAuthenticated: true,
            lobbyConfigs: {
                _id: "65f3f05a4470f95fb29c7341",
                time: "0001-01-01T00:00:00.000Z",
                __v: 0,
                name: "Lobby",
                currencyGroupIds: [
                    "61b953ad815d6c000196a14c",
                    "61b96c3d815d6c000196a15d",
                    "644201327216db0ed2fa8706",
                    "644a31d87216db0ed2fa8725",
                    "64642ebaf736a7a9c7b31914",
                    "6470221c9e762182b4d367e4",
                    "647022369e762182b4d367e5",
                    "6470224f9e762182b4d367e6",
                    "647022799e762182b4d367e7",
                    "6470228f9e762182b4d367e8",
                    "647022a99e762182b4d367e9",
                    "647022ea9e762182b4d367ea",
                    "6441fde97216db0ed2fa8702",
                    "644b2e837216db0ed2fa872a",
                    "651fd70940085002a425d96e",
                    "651fd72e40085002a425d96f",
                    "651fd74040085002a425d970",
                ],
                miniPanelGameIds: [1001],
                categories: [
                    {
                        name: {
                            "en-US": "Games",
                            "vi-VN": "Games",
                            "id-ID": "Games",
                            "th-TH": "Games",
                            "zh-CN": "Games",
                            "zh-TW": "Games",
                        },
                        gameSettings: [
                            {
                                gameId: 1007,
                                bigSize: false,
                                newTag: false,
                            },
                            {
                                gameId: 1006,
                                bigSize: false,
                                newTag: false,
                            },
                            {
                                gameId: 1005,
                                bigSize: false,
                                newTag: false,
                            },
                            {
                                gameId: 1001,
                                bigSize: false,
                                newTag: false,
                            },
                            {
                                gameId: 1002,
                                bigSize: false,
                                newTag: false,
                            },
                            {
                                gameId: 1003,
                                bigSize: false,
                                newTag: false,
                            },
                            {
                                gameId: 1004,
                                bigSize: false,
                                newTag: false,
                            },
                        ],
                    },
                ],
                banners: [
                    {
                        gameId: 1001,
                        displayTime: 3,
                    },
                    {
                        gameId: 1007,
                        displayTime: 15,
                    },
                    {
                        gameId: 1005,
                        displayTime: 10,
                    },
                    {
                        gameId: 1003,
                        displayTime: 10,
                    },
                ],
                roundTimerGame: {
                    games: [],
                    main: 0,
                },
            },
        });
    }),
    http.get("/api/bacball1", async () => {
        await delay(500);
        return new HttpResponse("You'd better not touch me, babe!", { status: 200 });
    }),
    http.get("/api/bacball2", async () => {
        await delay(500);
        return new HttpResponse("You'd better not touch me, babe!", { status: 200 });
    }),
    http.get("/api/luckynext1", async () => {
        await delay(500);
        return new HttpResponse("You'd better not touch me, babe!", { status: 200 });
    }),
    http.get("/api/luckynext2", async () => {
        await delay(500);
        return new HttpResponse("You'd better not touch me, babe!", { status: 200 });
    }),
    http.get("/api/seball1", async () => {
        await delay(500);
        return new HttpResponse("You'd better not touch me, babe!", { status: 200 });
    }),
    http.get("/api/luckythree", async () => {
        await delay(500);
        return new HttpResponse("You'd better not touch me, babe!", { status: 200 });
    }),
    http.get("/api/sicball", async () => {
        await delay(500);
        return new HttpResponse("You'd better not touch me, babe!", { status: 200 });
    }),

    http.post(`/user/settings`, ({ request, params }) => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json({
            chips: [
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "1",
                    value: 1,
                    color: "#848484",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "2",
                    value: 2,
                    color: "#a335a7",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "5",
                    value: 5,
                    color: "#2cb400",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "10",
                    value: 10,
                    color: "#ff930d",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "100",
                    value: 100,
                    color: "#1477ff",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "200",
                    value: 200,
                    color: "#10e3ff",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "500",
                    value: 500,
                    color: "#ff3818",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "1K",
                    value: 1000,
                    color: "#193c66",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "2K",
                    value: 2000,
                    color: "#8c6f01",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "3K",
                    value: 3000,
                    color: "#222222",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "5K",
                    value: 5000,
                    color: "#be000b",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "10K",
                    value: 10000,
                    color: "#7b004b",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "20K",
                    value: 20000,
                    color: "#007866",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "50",
                    value: 50,
                    color: "#ff48e4",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "30K",
                    value: 30000,
                    color: "#e93a3a",
                },
                {
                    time: "0001-01-01T00:00:00.000Z",
                    text: "3",
                    value: 3,
                    color: "#000000",
                },
            ],
        });
    }),
    http.post(`/user/auth/balance`, async () => {
        await delay(250);
        return HttpResponse.json({
            errorCode: "0",
            message: null,
            umInfo: null,
            isSuccessful: true,
            isUM: false,
            balance: 2000,
            scoins: 0,
            availableSpins: 0,
        });
    }),
];
