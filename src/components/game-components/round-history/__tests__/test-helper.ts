import { GameState, ViewMode } from "../../../shared/game-base/type";

export const roundHistory = [
    { result: { dice1: 5, dice2: 5, dice3: 1 }, roundId: 786275, settlementResult: { big: true, small: false } },
    { result: { dice1: 5, dice2: 5, dice3: 1 }, roundId: 786274, settlementResult: { big: true, small: false } },
    { result: { dice1: 2, dice2: 4, dice3: 1 }, roundId: 786267, settlementResult: { big: false, small: true } },
];

const gameSetting = {
    id: 1,
    gameName: "BigSmall",
    supportMD5: false,
    socketInfo: {
        namespace: "bigsmall",
        path: "bigsmall",
    },
    durations: {
        wholeRound: 62,
        placingBets: 50,
        lockingBet: 5,
        showResult: 8,
        resultAnimation: 3,
        beforeStartRound: 0,
        balancingBet: 3,
    },
};

export const gameContext = {
    gameSetting: gameSetting,
    totalBets: {},
    ownBets: {},
    roundId: 1,
    remainingTime: 1,
    gameConfigs: {},
    gameState: GameState.InRound,
    viewMode: ViewMode.full,
    isShowBlink: false,
    playResultAnimation: true,
};
