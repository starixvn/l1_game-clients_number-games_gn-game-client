import { delay, http, HttpResponse } from "msw";
import { buildUrlWithPath } from "../../src/_shared/helpers";

export const handlers = [
    // Intercept "GET https://example.com/user" requests...
    http.get(buildUrlWithPath(`/user/auth/sso?token=x&system=1`), () => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json({
            isAuthenticated: true,
            umInfo: null,
            username: "username",
            language: "vi-VN",
            ss: "ss",
            system: 1,
            memberName: "username",
            isUM: false,
        });
    }),
    http.post(buildUrlWithPath(`/user/auth/authorize`), ({ request, params }) => {
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
                        _id: "64993d4a7d27c898f074f5ad",
                        minBet: 1,
                        maxBet: 2000,
                        maxBetPerChoices: {
                            yellow: 2000,
                            red: 2000,
                            pink: 2000,
                            white: 2000,
                            blue: 2000,
                            green: 2000,
                            hot: 2000,
                            cold: 2000,
                        },
                    },
                ],
                fractionalOddsFormat: true,
                isDisplayPlayerCurrency: true,
            },
            umInfo: null,
            isUM: false,
        });
    }),
    http.post(buildUrlWithPath(`/user/settings`), ({ request, params }) => {
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
];
