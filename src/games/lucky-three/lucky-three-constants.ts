import { BallStatus } from "../../components/game-components/ball";

export enum LuckyThreeBetOptions {
    OVER = "over",
    UNDER = "under",
    RED2 = "red2",
    RED3 = "red3",
    BLUE2 = "blue2",
    BLUE3 = "blue3",
}

export const LuckyThreeBetOptionsPercentageColor = {
    over: "#84C6FF",
    under: "#FF9090",
};

export const defaultRoundData = [
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
];

export const DotColorMapper = {
    [LuckyThreeBetOptions.RED2]: [false, true, true],
    [LuckyThreeBetOptions.RED3]: [true, true, true],
    [LuckyThreeBetOptions.BLUE2]: [false, false, true],
    [LuckyThreeBetOptions.BLUE3]: [false, false, false],
};
