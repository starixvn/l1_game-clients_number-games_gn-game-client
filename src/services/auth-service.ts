import { SSOResponse } from "sc-user-service-client/dist/auth";

import { getLocalStorageItem, localStorageKeys, removeLocalStorageItem, storeLocalStorageItem } from "../common/local-storage";
import { UserClientCommunication } from "./user-client-communication";

const { auth: authService, userSettings: userSettingsService } = UserClientCommunication.getUserClientInstance();

export const sso = async (token: string, appType: number): Promise<SSOResponse> => {
    const userSession = await authService.sso(token, appType);

    if (userSession && userSession.isAuthenticated) {
        storeLocalStorageItem<SSOResponse>(localStorageKeys.session, userSession);
    }

    console.log(`sso ${JSON.stringify(userSession)}`);
    return {
        isAuthenticated: true,
        umInfo: null,
        username: "ONEworks1_8975174",
        language: "vi-VN",
        ss: "nYPowbn1pqyn1ZYLtgaXjo8oK4WmJ7Ss_ONEworks1_8975174",
        // system: 2,
        memberName: "username_8975174",
        // rate: 1,
        isUM: false,
    };
};

export const verifySession = async (): Promise<SSOResponse> => {
    const userSession = getLocalStorageItem<SSOResponse>(localStorageKeys.session);

    if (!userSession) {
        return null;
    }

    const verifySessionResponse = await authService.verifySession(userSession?.ss, userSession?.username);

    if (verifySessionResponse) {
        userSession.isUM = verifySessionResponse.isUM;
        userSession.umInfo = verifySessionResponse.umInfo;

        verifySessionResponse.isSuccessful && storeLocalStorageItem<SSOResponse>(localStorageKeys.session, userSession);
    }

    return verifySessionResponse.isSuccessful || userSession.isUM ? userSession : null;
};

export const clearSession = () => removeLocalStorageItem(localStorageKeys.session);

export const reCheckIn = async (userSession: SSOResponse) => {
    var result = authService.reCheckIn(userSession?.ss, userSession?.username);

    return {
        errorCode: "0",
        message: "",
        umInfo: null,
        isSuccessful: true,
        isUM: false,
        balance: 2000,
        scoins: 0,
        availableSpins: 0,
        apiError: null,
        availSpins: 0,
        isDisableAccount: null,
    };
};

export const createNickname = async (userSession: SSOResponse, nickname: string, avatarId: number) => {
    var result = authService.signName(userSession.ss, userSession.username, nickname, avatarId);
    return {
        authorized: true,
        user: {
            id: "65b22147f736dfe9359edf0b",
            name: "Rookie69069",
            currency: "$US",
            UID: 24425,
            avatarId: 56,
            joinedOn: "2024-01-25T08:52:37.719Z",
            __v: 0,
            scoins: 0,
            isSignedInSM: false,
            "settings.theme": "",
            maxBet: 0,
            minBet: 0,
            banned: false,
            inGameRoom: "",
            disabled: false,
            inRoom: false,
            type: false,
            redPlay: 0,
            redLost: 0,
            redWin: 0,
            red: 2000,
            _id: "65b22155f736dfe21d9edf0e",
            offerGames: [
                {
                    _id: "6189ea5dac732a000164fd99",
                    gameId: 3,
                    minBet: 1,
                    maxBet: 60000,
                    maxBetPerChoices: {
                        fish: 30000,
                        prawn: 30000,
                        crab: 30000,
                        stag: 30000,
                        gourd: 30000,
                        rooster: 30000,
                    },
                },
            ],
            fractionalOddsFormat: false,
            isDisplayPlayerCurrency: true,
            rate: 1,
            disableJackpotGames: true,
            multiplier: 1,
            currencyCode: "USD",
        },
        umInfo: null,
        isUM: false,
    };
};

export const authorize = async (userSession: SSOResponse) => {
    var result = authService.authorize(userSession.ss, userSession.username);

    return { authorized: false, user: null, umInfo: null, isUM: false };
};

export const getBalance = async (userSession: SSOResponse) => {
    var result = authService.getBalance(userSession.ss, userSession.username);
    console.log(`getBalance ${JSON.stringify(result)}`);
    return result;
};

export const getSettingGames = async (userSession: SSOResponse) => {
    var result = authService.getSettingGames(userSession.ss, userSession.username);
    return {
        isAuthenticated: true,
        settingGames: [
            {
                _id: "6189ea5dac732a000164fd99",
                gameId: 3,
                minBet: 1,
                maxBet: 60000,
                maxBetPerChoices: {
                    fish: 30000,
                    prawn: 30000,
                    crab: 30000,
                    stag: 30000,
                    gourd: 30000,
                    rooster: 30000,
                },
            },
        ],
        umInfo: null,
        isUM: false,
    };
};
